"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Plus, Users, Clock, Trophy, Search, Filter } from "lucide-react"

const activeRooms = [
    {
        id: 1,
        name: "Speed Demons",
        players: 8,
        maxPlayers: 10,
        difficulty: "Hard",
        timeLeft: "2:34",
        host: "SpeedKing",
        isPrivate: false,
    },
    {
        id: 2,
        name: "Beginner's Paradise",
        players: 5,
        maxPlayers: 8,
        difficulty: "Easy",
        timeLeft: "5:12",
        host: "TypingMaster",
        isPrivate: false,
    },
    {
        id: 3,
        name: "Elite Championship",
        players: 12,
        maxPlayers: 12,
        difficulty: "Expert",
        timeLeft: "Starting soon",
        host: "ProTyper",
        isPrivate: true,
    },
]

const myRooms = [
    {
        id: 4,
        name: "John's Practice Room",
        players: 3,
        maxPlayers: 6,
        difficulty: "Medium",
        status: "Active",
        created: "2 hours ago",
    },
]

export function TestSection() {
    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input placeholder="Search rooms..." className="pl-10" />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                </Button>
            </div>

            {/* My Rooms */}
            <Card>
                <CardHeader>
                    <CardTitle>My Rooms</CardTitle>
                    <CardDescription>Rooms you&apos;ve created or are hosting</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {myRooms.map((room) => (
                            <div
                                key={room.id}
                                className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{room.name}</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>
                                                {room.players}/{room.maxPlayers} players
                                            </span>
                                            <Badge variant="outline">{room.difficulty}</Badge>
                                            <span>Created {room.created}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        Manage
                                    </Button>
                                    <Button size="sm">Join</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Rooms */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Rooms</CardTitle>
                    <CardDescription>Join ongoing competitions and practice sessions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {activeRooms.map((room) => (
                            <div key={room.id} className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                                            <Trophy className="w-5 h-5 text-accent-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{room.name}</h4>
                                            <p className="text-sm text-muted-foreground">Hosted by {room.host}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {room.isPrivate && <Badge variant="secondary">Private</Badge>}
                                        <Badge
                                            variant={
                                                room.difficulty === "Expert"
                                                    ? "destructive"
                                                    : room.difficulty === "Hard"
                                                        ? "default"
                                                        : "secondary"
                                            }
                                        >
                                            {room.difficulty}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {room.players}/{room.maxPlayers}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{room.timeLeft}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <Avatar key={i} className="w-8 h-8 border-2 border-background">
                                                    <AvatarImage src={`/player-.png?height=32&width=32&query=player+${i}`} />
                                                    <AvatarFallback className="text-xs">P{i}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {room.players > 3 && (
                                                <div className="w-8 h-8 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs">
                                                    +{room.players - 3}
                                                </div>
                                            )}
                                        </div>
                                        <Button className="ml-4" disabled={room.players >= room.maxPlayers}>
                                            {room.players >= room.maxPlayers ? "Full" : "Join Room"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h4 className="font-semibold mb-2">Create Room</h4>
                        <p className="text-sm text-muted-foreground">Start your own typing competition</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Search className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <h4 className="font-semibold mb-2">Quick Match</h4>
                        <p className="text-sm text-muted-foreground">Find a random opponent instantly</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-chart-3 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold mb-2">Tournament</h4>
                        <p className="text-sm text-muted-foreground">Join ranked competitions</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
