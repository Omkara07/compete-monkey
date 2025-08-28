import CurrentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { wpm, accuracy, timeLimit, passageType } = body;

        if (typeof wpm !== "number" || typeof accuracy !== "number" || typeof timeLimit !== "number" || typeof passageType !== "string") {
            return new Response("Bad Request", { status: 400 });
        }

        if (!wpm || !accuracy || !timeLimit || !passageType) {
            return new Response("Bad Request", { status: 400 });
        }

        const typingTest = await db.typingTest.create({
            data: {
                userId: profile.id,
                wpm: Math.round(wpm),
                accuracy: Math.round(accuracy * 100) / 100,
                timeLimit,
                passageType
            },
        })

        return NextResponse.json({
            message: "Test recorded successfully",
            success: true,
            typingTestId: typingTest.id
        });
    }
    catch (error) {
        console.log("[TYPING_TEST_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return new Response("Bad Request", { status: 400 });
        }

        const now = new Date();
        const dateFilter: any = {
            completedAt: {
                gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            }
        }
        const typingTests = await db.typingTest.findMany({
            where: {
                userId: profile.id,
                ...dateFilter
            },
            orderBy: {
                completedAt: "desc"
            },
            take: limit
        });

        //aggregated stats
        const totalTests = await db.typingTest.count({ where: { userId: profile.id } });
        const avgWpm = await db.typingTest.aggregate({ where: { userId: profile.id }, _avg: { wpm: true, accuracy: true } });
        const bestTest = await db.typingTest.findFirst({
            where: { userId: profile.id },
            orderBy: { wpm: "desc" }
        });

        const stats = {
            totalTests,
            averageWpm: Math.round(avgWpm._avg.wpm || 0),
            averageAccuracy: Math.round((avgWpm._avg.accuracy || 0) * 100) / 100,
            bestWpm: bestTest?.wpm || 0,
            bestAccuracy: bestTest?.accuracy || 0
        }
        return NextResponse.json({ typingTests, stats });
    }
    catch (error) {
        console.log("[TYPING_TEST_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}