import { useAchievements } from "@/hooks/useAchievements";
import { Award, Clock, Code, Loader2, Shield, Target, TrendingUp, Trophy, Zap } from "lucide-react";
import { Badge } from "./ui/badge";

export function AchievementsGrid() {
    const { achievements, stats, loading } = useAchievements();

    if (loading) {
        return <div className="flex-1 flex flex-col justify-center items-center h-[40vh]">
            <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
    }

    const getIconComponent = (iconName: string) => {
        const icons = {
            trophy: Trophy,
            target: Target,
            clock: Clock,
            award: Award,
            shield: Shield,
            zap: Zap,
            code: Code,
            'trending-up': TrendingUp
        } as const;
        return icons[iconName as keyof typeof icons] || Trophy;
    };

    return (
        <div className="space-y-4">
            {stats && (
                <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                        {stats.unlockedAchievements} of {stats.totalAchievements} achievements unlocked
                        ({stats.completionPercentage}%)
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    const isUnlocked = achievement.isUnlocked;

                    return (
                        <div
                            key={achievement.id}
                            className={`p-4 rounded-lg border ${isUnlocked
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-muted/50 border-muted'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isUnlocked
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                <IconComponent className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold mb-1">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                {achievement.description}
                            </p>
                            <Badge variant={isUnlocked ? "default" : "outline"}>
                                {isUnlocked ? "Unlocked" : "Locked"}
                            </Badge>
                            {isUnlocked && achievement.unlockedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}