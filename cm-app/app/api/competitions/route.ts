import CurrentProfile from "@/lib/current-profile";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { roomCode, results, passage, timeLimit, passageType } = await req.json();

        const room = await db.room.findUnique({
            where: { code: roomCode }
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Create competition record
        const competition = await db.competition.create({
            data: {
                roomId: room.id,
                passage,
                timeLimit,
                passageType,
                startedAt: new Date(Date.now() - timeLimit * 1000),
                completedAt: new Date(),
                winnerId: results[0].userId
            }
        });

        // Save all participant results
        const competitionResults = await Promise.all(
            results.map((result: any, index: number) =>
                db.competitionResult.create({
                    data: {
                        competitionId: competition.id,
                        userId: result.userId,
                        wpm: result.wpm,
                        accuracy: result.accuracy,
                        correctChars: result.correctChars,
                        incorrectChars: result.incorrectChars,
                        totalChars: result.totalChars,
                        position: index + 1,
                        completedAt: result.completedAt ? new Date(result.completedAt) : new Date()
                    }
                })
            )
        );

        return NextResponse.json({
            competitionId: competition.id,
            results: competitionResults
        });

    } catch (error) {
        console.log("[COMPETITION_POST]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// Get user's competition stats for dashboard
export async function GET(req: NextRequest) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Get recent competitions
        const recentCompetitions = await db.competitionResult.findMany({
            where: { userId: profile.id },
            include: {
                competition: {
                    include: {
                        winner: true
                    }
                }
            },
            orderBy: { completedAt: 'desc' },
            take: 6
        });

        // Transform for chart data (wins vs total per month)
        const competitionsByMonth = recentCompetitions.reduce<Record<string, { wins: number; total: number }>>((acc, result) => {
            const month = result.completedAt?.toLocaleDateString('en-US', { month: 'short' }) || 'Unknown';
            if (!acc[month]) {
                acc[month] = { wins: 0, total: 0 };
            }
            acc[month].total++;
            if (result.position === 1) {
                acc[month].wins++;
            }
            return acc;
        }, {});

        const chartData = Object.entries(competitionsByMonth).map(([month, data]) => ({
            month,
            wins: data.wins,
            total: data.total
        }));

        // Overall stats
        const totalCompetitions = await db.competitionResult.count({
            where: { userId: profile.id }
        });

        const totalWins = await db.competitionResult.count({
            where: {
                userId: profile.id,
                position: 1
            }
        });

        const avgPosition = await db.competitionResult.aggregate({
            where: { userId: profile.id },
            _avg: { position: true }
        });

        return NextResponse.json({
            chartData,
            stats: {
                totalCompetitions,
                totalWins,
                winRate: totalCompetitions > 0 ? Math.round((totalWins / totalCompetitions) * 100) : 0,
                avgPosition: Math.round(avgPosition._avg.position || 0)
            }
        });

    } catch (error) {
        console.log("[COMPETITIONS_GET]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}