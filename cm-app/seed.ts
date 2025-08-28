import { db } from "./lib/db"

const achievements = [
    {
        title: "Speed Demon",
        description: "Achieve 90+ WPM in a test",
        icon: "trophy",
        category: "speed",
        condition: {
            type: "single_test",
            field: "wpm",
            operator: ">=",
            value: 90
        }
    },
    {
        title: "Accuracy Master",
        description: "Maintain 95%+ accuracy for 10 tests",
        icon: "target",
        category: "accuracy",
        condition: {
            type: "consecutive_tests",
            field: "accuracy",
            operator: ">=",
            value: 95,
            count: 10
        }
    },
    {
        title: "Lightning Fast",
        description: "Achieve 100+ WPM in any test",
        icon: "zap",
        category: "speed",
        condition: {
            type: "single_test",
            field: "wpm",
            operator: ">=",
            value: 100
        }
    },
    {
        title: "Consistent Performer",
        description: "Complete 50 typing tests",
        icon: "award",
        category: "consistency",
        condition: {
            type: "total_count",
            field: "tests_completed",
            operator: ">=",
            value: 50
        }
    },
    {
        title: "Code Ninja",
        description: "Achieve 80+ WPM on code snippets",
        icon: "code",
        category: "specialty",
        condition: {
            type: "single_test",
            field: "wpm",
            operator: ">=",
            value: 80,
            additional: {
                passageType: "code"
            }
        }
    },
    {
        title: "Perfectionist",
        description: "Achieve 100% accuracy in a test",
        icon: "shield",
        category: "accuracy",
        condition: {
            type: "single_test",
            field: "accuracy",
            operator: ">=",
            value: 100
        }
    },
    {
        title: "Marathon Runner",
        description: "Complete 20 tests in a single day",
        icon: "clock",
        category: "endurance",
        condition: {
            type: "daily_count",
            field: "tests_completed",
            operator: ">=",
            value: 20
        }
    },
    {
        title: "Speed Improvement",
        description: "Improve WPM by 20 points from first test",
        icon: "trending-up",
        category: "improvement",
        condition: {
            type: "improvement",
            field: "wpm",
            operator: ">=",
            value: 20
        }
    }
]

async function seedAchievements() {
    for (const achievement of achievements) {
        await db.achievement.upsert({
            where: { title: achievement.title },
            update: achievement,
            create: achievement,
        })
    }
}

seedAchievements()