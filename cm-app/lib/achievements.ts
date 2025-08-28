import { db } from "@/lib/db";

interface AchievementCondition {
    type: string;
    field: string;
    operator: string;
    value: number;
    count?: number;
    additional?: Record<string, any>;
}

export class AchievementService {
    static async checkAchievements(userId: string, newTest: any) {
        const achievements = await db.achievement.findMany();
        const userAchievements = await db.userAchievement.findMany({
            where: { userId }
        });

        const unlockedAchievementIds = new Set(
            userAchievements.map(ua => ua.achievementId)
        );

        const newlyUnlocked = [];

        for (const achievement of achievements) {
            if (unlockedAchievementIds.has(achievement.id)) continue;

            const condition = achievement.condition as unknown as AchievementCondition;
            const isUnlocked = await this.checkCondition(userId, newTest, condition);

            if (isUnlocked) {
                await db.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id
                    }
                });
                newlyUnlocked.push(achievement);
            }
        }

        return newlyUnlocked;
    }

    private static async checkCondition(
        userId: string,
        newTest: any,
        condition: AchievementCondition
    ): Promise<boolean> {
        const { type, field, operator, value, count, additional } = condition;

        switch (type) {
            case "single_test":
                const singleValue = newTest[field];
                if (typeof singleValue !== 'number') return false;
                return this.evaluateCondition(singleValue, operator, value) &&
                    this.checkAdditional(newTest, additional);

            case "consecutive_tests":
                if (!count) return false;

                const recentTests = await db.typingTest.findMany({
                    where: { userId },
                    orderBy: { completedAt: 'desc' },
                    take: count
                });

                return recentTests.length >= count &&
                    recentTests.every(test => {
                        const testValue = test[field as keyof typeof test];
                        return typeof testValue === 'number' &&
                            this.evaluateCondition(testValue, operator, value);
                    });

            case "total_count":
                const totalTests = await db.typingTest.count({
                    where: { userId }
                });
                return this.evaluateCondition(totalTests, operator, value);

            case "daily_count":
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayCount = await db.typingTest.count({
                    where: {
                        userId,
                        completedAt: {
                            gte: today,
                            lt: tomorrow
                        }
                    }
                });
                return this.evaluateCondition(todayCount, operator, value);

            case "improvement":
                const firstTest = await db.typingTest.findFirst({
                    where: { userId },
                    orderBy: { completedAt: 'asc' }
                });

                if (!firstTest) return false;

                const newTestValue = newTest[field as keyof typeof newTest];
                const firstTestValue = firstTest[field as keyof typeof firstTest];

                if (typeof newTestValue !== 'number' || typeof firstTestValue !== 'number') {
                    return false;
                }

                const improvement = newTestValue - firstTestValue;
                return this.evaluateCondition(improvement, operator, value);

            default:
                return false;
        }
    }

    private static evaluateCondition(
        actual: number,
        operator: string,
        expected: number
    ): boolean {
        switch (operator) {
            case ">=": return actual >= expected;
            case ">": return actual > expected;
            case "<=": return actual <= expected;
            case "<": return actual < expected;
            case "==": return actual === expected;
            default: return false;
        }
    }

    private static checkAdditional(
        test: any,
        additional?: Record<string, any>
    ): boolean {
        if (!additional) return true;

        return Object.entries(additional).every(([key, value]) =>
            test[key] === value
        );
    }
}