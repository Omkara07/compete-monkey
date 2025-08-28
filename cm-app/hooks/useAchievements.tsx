import { useState, useEffect } from 'react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
    unlockedAt?: string;
}

interface AchievementStats {
    unlockedAchievements: number;
    totalAchievements: number;
    completionPercentage: number;
}

export function useAchievements() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [stats, setStats] = useState<AchievementStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const response = await fetch('/api/achievements');
            const data = await response.json();
            setAchievements(data.achievements);
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    return { achievements, stats, loading, refetch: fetchAchievements };
}