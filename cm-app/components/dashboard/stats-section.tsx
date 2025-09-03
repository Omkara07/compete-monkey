"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart, Tooltip } from "recharts"
import { Trophy, Target, Clock, TrendingUp, Award, Loader2, AlertCircle, BarChart3, Activity, Zap } from "lucide-react"
import { useTheme } from "next-themes"

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
    loading: boolean,
    competitionData: any[],
    competitionStats: any,
    competitionLoading: boolean,
    error?: string | null
}

export function StatsSection({ chartData, stats, latestTest, loading, competitionData, competitionStats, competitionLoading, error }: Props) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Error state
    if (error) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-[70vh] space-y-4">
                <div className="flex items-center space-x-2 text-destructive">
                    <AlertCircle className="h-8 w-8" />
                    <h3 className="text-lg font-semibold">Error Loading Stats</h3>
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    {error}
                </p>
                <div className="text-xs text-muted-foreground">
                    Please try refreshing the page or contact support if the problem persists.
                </div>
            </div>
        )
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-[70vh] space-y-4">
                <div className="relative">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <div className="absolute inset-0 h-8 w-8 border-2 border-primary/20 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">Loading your stats...</p>
                    <p className="text-xs text-muted-foreground">This might take a moment</p>
                </div>
            </div>
        )
    }

    // Check if we have any meaningful data
    const hasChartData = chartData && chartData.length > 0;
    const hasStats = stats && (stats.totalTests > 0 || stats.averageWpm > 0 || stats.averageAccuracy > 0);
    const hasLatestTest = latestTest && (latestTest.wpm > 0 || latestTest.accuracy > 0);
    const hasCompetitionData = competitionData && competitionData.length > 0;
    const hasCompetitionStats = competitionStats && (competitionStats.totalWins > 0 || competitionStats.totalCompetitions > 0);

    // No data state
    if (!hasChartData && !hasStats && !hasLatestTest && !hasCompetitionData && !hasCompetitionStats) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-[70vh] space-y-6">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                        <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <Zap className="h-3 w-3 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">No Data Available</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Start taking typing tests to see your progress and statistics here.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>Take your first typing test</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span>Join competitions</span>
                    </div>
                </div>
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
                        {hasLatestTest ? (
                            <>
                                <div className="text-2xl font-bold text-primary filter dark:brightness-125 dark:saturate-200">
                                    {latestTest.wpm || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <TrendingUp className="inline w-3 h-3 mr-1" />
                                    latest test results
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-muted-foreground/50">--</div>
                                <p className="text-xs text-muted-foreground">
                                    <Clock className="inline w-3 h-3 mr-1" />
                                    no tests taken yet
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                        <Trophy className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        {hasLatestTest ? (
                            <>
                                <div className="text-2xl font-bold text-accent">{latestTest.accuracy || 0}%</div>
                                <p className="text-xs text-muted-foreground">latest test results</p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-muted-foreground/50">--%</div>
                                <p className="text-xs text-muted-foreground">no tests taken yet</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Competitions Won</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {hasCompetitionStats ? (
                            <>
                                <div className="text-2xl font-bold">{competitionStats.totalWins || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Out of {competitionStats.totalCompetitions || 0} competitions
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-muted-foreground/50">0</div>
                                <p className="text-xs text-muted-foreground">no competitions joined yet</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* WPM Progress Chart */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Typing Speed Progress</CardTitle>
                        <CardDescription>Your WPM and accuracy</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        {hasChartData ? (
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
                        ) : (
                            <div className="h-[250px] w-full flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                                <BarChart3 className="h-12 w-12 opacity-50" />
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-medium">No Progress Data</p>
                                    <p className="text-xs">Take some typing tests to see your progress here</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Competition Wins Chart */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Competition Performance</CardTitle>
                        <CardDescription>Wins vs total competitions per month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        {hasCompetitionData ? (
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
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-[250px] w-full flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                                <Trophy className="h-12 w-12 opacity-50" />
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-medium">No Competition Data</p>
                                    <p className="text-xs">Join competitions to see your performance here</p>
                                </div>
                            </div>
                        )}
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
                    {hasStats ? (
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Speed (WPM)</span>
                                    <span>{stats.averageWpm || 0}/{(stats.averageWpm || 0) < 100 ? 100 : 200}</span>
                                </div>
                                <Progress value={stats.averageWpm || 0} className="h-2" />
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Accuracy</span>
                                    <span>{stats.averageAccuracy || 0}/100</span>
                                </div>
                                <Progress value={stats.averageAccuracy || 0} className="h-2" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-muted-foreground">
                                <Activity className="h-12 w-12 opacity-50" />
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-medium">No Skill Data Available</p>
                                    <p className="text-xs">Complete some typing tests to track your skill development</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Speed (WPM)</span>
                                        <span>0/100</span>
                                    </div>
                                    <Progress value={0} className="h-2" />
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Accuracy</span>
                                        <span>0/100</span>
                                    </div>
                                    <Progress value={0} className="h-2" />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
