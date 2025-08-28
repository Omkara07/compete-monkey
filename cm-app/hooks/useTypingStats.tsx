"use client"
import { useEffect, useState } from "react"

interface LatestTypingStats {
    wpm: number
    accuracy: number
}

interface TypingStats {
    totalTests: number,
    averageWpm: number,
    averageAccuracy: number,
    bestWpm: number,
    bestAccuracy: number,
}
interface ChartDataPoint {
    date: string
    wpm: number
    accuracy: number
    testCount: number
}

export const useTypingStats = () => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [stats, setStats] = useState<TypingStats | null>(null);
    const [latestTest, setLatestTest] = useState<LatestTypingStats | null>(null);

    useEffect(() => {
        fetchTypingStats();
    }, [])

    const fetchTypingStats = async () => {
        try {
            const res = await fetch("/api/typing-test/stats");
            const data = await res.json();
            setChartData(data.chartData);
            console.log(data)

            const testRes = await fetch("/api/typing-test?limit=1");
            const { typingTests, stats } = await testRes.json()

            console.log(typingTests)
            if (typingTests.length > 0 && stats) {
                setStats(stats);
                setLatestTest(typingTests[0]);
            }
        }
        catch (error) {
            console.log("[USE_TYPING_STATS]", error);
        }
        finally {
            setLoading(false);
        }
    }

    return { loading, chartData, stats, latestTest, refetch: fetchTypingStats };
}