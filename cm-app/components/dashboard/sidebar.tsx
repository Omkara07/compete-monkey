"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Settings, Trophy, LogOut, KeyboardIcon, Gauge, User, UsersIcon, Loader2, AlertCircle, Target, TrendingUp } from "lucide-react"
import { User as DB_User } from "@/lib/generated/prisma"
import { SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import { ToggleTheme } from "../toggle-theme"
import { useTypingStats } from "@/hooks/useTypingStats"
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler"

interface SidebarProps {
    activeSection: string
    onSectionChange: (section: string) => void
    profile: DB_User
}

export function Sidebar({ activeSection, onSectionChange, profile }: SidebarProps) {
    const menuItems = [
        {
            id: "stats",
            label: "Stats",
            icon: BarChart3,
            description: "Performance & Analytics",
        },
        {
            id: "speedTest",
            label: "Speed Test",
            icon: Gauge,
            description: "Test your typing speed",
        },
        {
            id: "testWithFriends",
            label: "Rooms and Competitions",
            icon: UsersIcon,
            description: "Compete with Friends in Rooms",
        },
        {
            id: "profile",
            label: "Profile",
            icon: Settings,
            description: "Account Settings",
        },
    ]

    const { stats, loading, refetch } = useTypingStats();

    return (
        <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <KeyboardIcon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-sidebar-foreground">Compete-Monkey</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">Competitive Typing</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 sm:p-6 border-b border-sidebar-border">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3">QUICK STATS</h3>

                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-sidebar-accent p-2 sm:p-3 rounded-lg text-center">
                            <div className="flex items-center justify-center h-8 mb-1">
                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                            </div>
                            <div className="text-xs text-muted-foreground">Loading...</div>
                        </div>
                        <div className="bg-sidebar-accent p-2 sm:p-3 rounded-lg text-center">
                            <div className="flex items-center justify-center h-8 mb-1">
                                <Loader2 className="h-4 w-4 text-accent animate-spin" />
                            </div>
                            <div className="text-xs text-muted-foreground">Loading...</div>
                        </div>
                    </div>
                ) : stats && (stats.averageWpm > 0 || stats.averageAccuracy > 0) ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-sidebar-accent p-2 sm:p-3 rounded-lg text-center">
                            <div className="text-xl sm:text-2xl font-bold text-primary filter dark:brightness-125 dark:saturate-200">
                                {stats.averageWpm || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Avg WPM</div>
                        </div>
                        <div className="bg-sidebar-accent p-2 sm:p-3 rounded-lg text-center">
                            <div className="text-xl sm:text-2xl font-bold text-accent">
                                {stats.averageAccuracy || 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-sidebar-accent p-3 rounded-lg text-center">
                            <div className="flex flex-col items-center space-y-2">
                                <Target className="h-6 w-6 text-muted-foreground/50" />
                                <div className="text-sm font-medium text-muted-foreground">No Stats Yet</div>
                                <div className="text-xs text-muted-foreground/70">
                                    Take your first typing test to see stats here
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-sidebar-accent p-2 sm:p-3 rounded-lg text-center">
                                <div className="text-xl sm:text-2xl font-bold text-muted-foreground/50">--</div>
                                <div className="text-xs text-muted-foreground">Avg WPM</div>
                            </div>
                            <div className="bg-sidebar-accent p-2 sm:p-3 rounded-lg text-center">
                                <div className="text-xl sm:text-2xl font-bold text-muted-foreground/50">--%</div>
                                <div className="text-xs text-muted-foreground">Accuracy</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 sm:p-4">
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeSection === item.id

                        return (
                            item.id === "speedTest" ?
                                <Link href="/typing-test" key={item.id} className="w-full">
                                    <Button
                                        variant={isActive ? "default" : "ghost"}
                                        className={cn(
                                            "w-full justify-start h-auto p-3 sm:p-4 text-left",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "",
                                        )}
                                    >
                                        <div className="flex items-center gap-3 w-full min-w-0">
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium truncate">{item.label}</span>
                                                </div>
                                                <p className="text-xs opacity-70 mt-1 truncate">{item.description}</p>
                                            </div>
                                        </div>
                                    </Button>
                                </Link>
                                :
                                item.id === "testWithFriends" ?
                                    <Link href="/room" key={item.id} className="w-full">
                                        <Button
                                            variant={isActive ? "default" : "ghost"}
                                            className={cn(
                                                "w-full justify-start h-auto p-3 sm:p-4 text-left",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "",
                                            )}
                                        >
                                            <div className="flex items-center gap-3 w-full min-w-0">
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium truncate">{item.label}</span>
                                                    </div>
                                                    <p className="text-xs opacity-70 mt-1 truncate">{item.description}</p>
                                                </div>
                                            </div>
                                        </Button>
                                    </Link>
                                    :
                                    <Button
                                        key={item.id}
                                        variant={isActive ? "default" : "ghost"}
                                        className={cn(
                                            "w-full justify-start h-auto p-3 sm:p-4 text-left",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "",
                                        )}
                                        onClick={() => onSectionChange(item.id)}
                                    >
                                        <div className="flex items-center gap-3 w-full min-w-0">
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium truncate">{item.label}</span>
                                                </div>
                                                <p className="text-xs opacity-70 mt-1 truncate">{item.description}</p>
                                            </div>
                                        </div>
                                    </Button>

                        )
                    })}
                </div>
            </nav >

            {/* Footer */}
            < div className="p-3 sm:p-4 border-t border-sidebar-border space-y-3" >
                {/* User Avatar and Logout */}
                <div className="flex items-center justify-between gap-2" >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={profile.imageUrl || ""} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{profile.name?.[0] || ""}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.name}</p>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                    </div>
                    <AnimatedThemeToggler className="w-5 h-5 text-sm" />
                    <SignOutButton>
                        <Button
                            variant="ghost"
                            size="default"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        >
                            <LogOut className="w-6 h-6" />
                        </Button>
                    </SignOutButton>
                </div >
            </div >
        </div >
    )
}
