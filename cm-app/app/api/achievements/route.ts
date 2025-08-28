import CurrentProfile from "@/lib/current-profile";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Get all achievements
        const allAchievements = await db.achievement.findMany({
            orderBy: { createdAt: 'asc' }
        });

        // Get user's unlocked achievements
        const userAchievements = await db.userAchievement.findMany({
            where: { userId: profile.id },
            include: { achievement: true }
        });

        const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

        // Combine data
        const achievements = allAchievements.map(achievement => ({
            ...achievement,
            isUnlocked: unlockedIds.has(achievement.id),
            unlockedAt: userAchievements.find(ua =>
                ua.achievementId === achievement.id
            )?.unlockedAt
        }));

        const stats = {
            totalAchievements: allAchievements.length,
            unlockedAchievements: userAchievements.length,
            completionPercentage: Math.round(
                (userAchievements.length / allAchievements.length) * 100
            )
        };

        return NextResponse.json({ achievements, stats });
    } catch (error) {
        console.log("[ACHIEVEMENTS_GET]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}