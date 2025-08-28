"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart, Tooltip } from "recharts"
import { Trophy, Target, Clock, TrendingUp, Award, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

const wpmData = [
    { date: "Jan", wpm: 65, accuracy: 89 },
    { date: "Feb", wpm: 72, accuracy: 91 },
    { date: "Mar", wpm: 78, accuracy: 93 },
    { date: "Apr", wpm: 82, accuracy: 94 },
    { date: "May", wpm: 87, accuracy: 94 },
    { date: "Jun", wpm: 89, accuracy: 95 },
    { date: "Jul", wpm: 82, accuracy: 94 },
    { date: "Aug", wpm: 87, accuracy: 94 },
    { date: "Sep", wpm: 89, accuracy: 95 },
    { date: "Oct", wpm: 65, accuracy: 89 },
    { date: "Nov", wpm: 72, accuracy: 91 },
    { date: "Dec", wpm: 78, accuracy: 93 },
]

const competitionData = [
    { month: "Jan", wins: 12, total: 18 },
    { month: "Feb", wins: 15, total: 22 },
    { month: "Mar", wins: 18, total: 25 },
    { month: "Apr", wins: 22, total: 28 },
    { month: "May", wins: 25, total: 30 },
    { month: "Jun", wins: 28, total: 32 },
]

const wpmChartConfig = {
    wpm: {
        label: "WPM",
        color: "hsl(var(--primary))",
    },
    accuracy: {
        label: "Accuracy(%)",
        color: "hsl(var(--accent))",
    },
    date: {
        label: "Date",
        color: "hsl(var(--muted-foreground))",
    },
}

const competitionChartConfig = {
    wins: {
        label: "Wins",
        color: "hsl(var(--primary))",
    },
    total: {
        label: "Total",
        color: "hsl(var(--muted-foreground))",
    },
}

interface Props {
    chartData: any[]
    latestTest: {
        wpm: number
        accuracy: number
    } | null,
    stats: {
        totalTests: number,
        averageWpm: number,
        averageAccuracy: number,
        bestWpm: number,
        bestAccuracy: number,
    } | null,
    loading: boolean
}

export function StatsSection({ chartData, stats, latestTest, loading }: Props) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    console.log(chartData, stats);
    if (loading) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-[70vh]">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current WPM</CardTitle>
                        <Target className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary filter dark:brightness-125 dark:saturate-200">{latestTest?.wpm}</div>
                        <p className="text-xs text-muted-foreground">
                            <TrendingUp className="inline w-3 h-3 mr-1" />
                            latest test results
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                        <Trophy className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">{latestTest?.accuracy}%</div>
                        <p className="text-xs text-muted-foreground">latest test results</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Competitions Won</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">28</div>
                        <p className="text-xs text-muted-foreground">Out of 32 this month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* WPM Progress Chart */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Typing Speed Progress</CardTitle>
                        <CardDescription>Your WPM and accuracy over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <ChartContainer config={wpmChartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                    <XAxis dataKey="testNumber" fontSize={12} tickMargin={5} stroke="#ffffff" tick={{ fill: "#ffffff" }} />
                                    <YAxis fontSize={12} tickMargin={5} width={40} stroke="#ffffff" tick={{ fill: "#ffffff" }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line
                                        type="monotone"
                                        dataKey="wpm"
                                        stroke="var(--primary)"
                                        strokeWidth={2}
                                        dot={{ fill: isDark ? "#cccccc" : "black", strokeWidth: 2, r: 3 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="accuracy"
                                        stroke="var(--secondary)" // softer white/gray for contrast
                                        strokeWidth={2}
                                        dot={{ fill: isDark ? "#cccccc" : "black", strokeWidth: 2, r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Competition Wins Chart */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Competition Performance</CardTitle>
                        <CardDescription>Wins vs total competitions per month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <ChartContainer config={competitionChartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={competitionData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--primary)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="wins"
                                        fill="var(--secondary)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Skill Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Skill Development</CardTitle>
                    <CardDescription>Track your progress across different typing skills</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Speed (WPM)</span>
                                <span>{stats?.averageWpm}/{(stats?.averageWpm || 0) < 100 ? 100 : 200}</span>
                            </div>
                            <Progress value={stats?.averageWpm} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Accuracy</span>
                                <span>{stats?.averageAccuracy}/100</span>
                            </div>
                            <Progress value={stats?.averageAccuracy} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
