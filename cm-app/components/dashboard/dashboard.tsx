"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatsSection } from "@/components/dashboard/stats-section"
import { TestSection } from "@/components/dashboard/test-section"
import { FriendsSection } from "@/components/dashboard/friend-section"
import { ProfileSection } from "@/components/dashboard/profile-section"
import { ToggleTheme } from "@/components/toggle-theme"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import type { User } from "@/lib/generated/prisma"

interface Props {
    profile: User
}
export function Dashboard({ profile }: Props) {
    const [activeSection, setActiveSection] = useState("stats")
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    const renderActiveSection = () => {
        switch (activeSection) {
            case "stats":
                return <StatsSection />
            case "speedTest":
                return <TestSection />
            case "testWithFriends":
                return <FriendsSection />
            case "profile":
                return <ProfileSection profile={profile} updateEndpoint={"/api/profile"} />
            default:
                return <StatsSection />
        }
    }

    const handleSectionChange = (section: string) => {
        setActiveSection(section)
        setIsMobileSidebarOpen(false)
    }

    return (
        <div className="flex h-screen bg-background">
            <div className="hidden lg:block">
                <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} profile={profile} />
            </div>

            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)} />
                    <div className="fixed left-0 top-0 h-full w-80 bg-background">
                        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} profile={profile} />
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-auto min-w-0">
                <div className="p-4 pt-0 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMobileSidebarOpen(true)}>
                                <Menu className="w-5 h-5" />
                            </Button>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {activeSection === "stats" && "Performance Stats"}
                                {activeSection === "speedTest" && "Speed Test"}
                                {activeSection === "testWithFriends" && "Compete with Friends"}
                                {activeSection === "profile" && "Profile Settings"}
                            </h1>
                        </div>
                        <ToggleTheme />
                    </div>
                    {renderActiveSection()}
                </div>
            </main>
        </div>
    )
}
