"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart, Tooltip } from "recharts"
import { Trophy, Target, Clock, TrendingUp, Award } from "lucide-react"
import { useTheme } from "next-themes"

const wpmData = [
    { date: "Jan", wpm: 65, accuracy: 89 },
    { date: "Feb", wpm: 72, accuracy: 91 },
    { date: "Mar", wpm: 78, accuracy: 93 },
    { date: "Apr", wpm: 82, accuracy: 94 },
    { date: "May", wpm: 87, accuracy: 94 },
    { date: "Jun", wpm: 89, accuracy: 95 }
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

export function StatsSection() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
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
                        <div className="text-2xl font-bold text-primary">89</div>
                        <p className="text-xs text-muted-foreground">
                            <TrendingUp className="inline w-3 h-3 mr-1" />
                            +5 from last week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                        <Trophy className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">94.8%</div>
                        <p className="text-xs text-muted-foreground">Personal best: 97.2%</p>
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
                                <LineChart data={wpmData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                    <XAxis dataKey="date" fontSize={12} tickMargin={5} stroke="#ffffff" tick={{ fill: "#ffffff" }} />
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

            {/* Recent Achievements */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                    <CardDescription>Your latest milestones and accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold">Speed Demon</h4>
                                <p className="text-sm text-muted-foreground">Achieved 90+ WPM in a competition</p>
                            </div>
                            <Badge variant="secondary">New!</Badge>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                <Target className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold">Accuracy Master</h4>
                                <p className="text-sm text-muted-foreground">Maintained 95%+ accuracy for 10 games</p>
                            </div>
                            <Badge variant="outline">3 days ago</Badge>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold">Consistency King</h4>
                                <p className="text-sm text-muted-foreground">Played for 7 consecutive days</p>
                            </div>
                            <Badge variant="outline">1 week ago</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                <span>89/100</span>
                            </div>
                            <Progress value={89} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Accuracy</span>
                                <span>95/100</span>
                            </div>
                            <Progress value={95} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Consistency</span>
                                <span>78/100</span>
                            </div>
                            <Progress value={78} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Endurance</span>
                                <span>82/100</span>
                            </div>
                            <Progress value={82} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
