import CurrentProfile from "@/lib/current-profile";
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db";

const LIMIT = 100;
export async function GET(req: NextRequest) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Get all tests ordered chronologically to show trajectory
        const tests = await db.typingTest.findMany({
            where: {
                userId: profile.id
            },
            orderBy: {
                completedAt: 'asc'
            },
            take: LIMIT,
            select: {
                id: true,
                wpm: true,
                accuracy: true,
                completedAt: true
            }
        });

        // Transform to chart data with test sequence numbers as X-axis
        const chartData = tests.map((test, index) => {
            const date = test.completedAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            return {
                testNumber: index + 1, // Sequential test number for X-axis
                date: date, // For tooltip display
                wpm: test.wpm,
                accuracy: test.accuracy,
                fullDate: test.completedAt.toISOString()
            };
        });

        return NextResponse.json({ chartData });
    }
    catch (error) {
        console.log("[TYPING_TEST_STATS_GET]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
