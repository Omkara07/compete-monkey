"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, MessageCircle, Crown, Medal, Search } from "lucide-react"

const friends = [
    {
        id: 1,
        name: "Sarah Chen",
        username: "speedqueen",
        avatar: "/female-gamer.png",
        status: "online",
        wpm: 92,
        accuracy: 96,
        level: 18,
        lastSeen: "now",
    },
    {
        id: 2,
        name: "Mike Johnson",
        username: "typingmike",
        avatar: "/male-gamer.png",
        status: "in-game",
        wpm: 78,
        accuracy: 94,
        level: 12,
        lastSeen: "2 min ago",
    },
    {
        id: 3,
        name: "Alex Rivera",
        username: "keyboardwarrior",
        avatar: "/gamer-avatar.png",
        status: "offline",
        wpm: 85,
        accuracy: 91,
        level: 15,
        lastSeen: "1 hour ago",
    },
]

const leaderboard = [
    {
        rank: 1,
        name: "TypeMaster Pro",
        wpm: 127,
        accuracy: 98,
        points: 15420,
        change: "+2",
    },
    {
        rank: 2,
        name: "SpeedDemon",
        wpm: 124,
        accuracy: 97,
        points: 14890,
        change: "-1",
    },
    {
        rank: 3,
        name: "KeyboardNinja",
        wpm: 119,
        accuracy: 99,
        points: 14250,
        change: "+1",
    },
    {
        rank: 4,
        name: "You (John Doe)",
        wpm: 89,
        accuracy: 95,
        points: 8750,
        change: "+3",
        isCurrentUser: true,
    },
]

const friendRequests = [
    {
        id: 1,
        name: "Emma Wilson",
        username: "fastfingers",
        avatar: "/female-player.png",
        mutualFriends: 3,
    },
    {
        id: 2,
        name: "David Park",
        username: "typingace",
        avatar: "/male-player.png",
        mutualFriends: 1,
    },
]

export function FriendsSection() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="friends" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="friends">Friends</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="space-y-6">
                    {/* Search and Add Friends */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input placeholder="Search friends..." className="pl-10" />
                        </div>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Friend
                        </Button>
                    </div>

                    {/* Friends List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Friends ({friends.length})</CardTitle>
                            <CardDescription>Your typing buddies and competitors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                                                    <AvatarFallback>
                                                        {friend.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${friend.status === "online"
                                                            ? "bg-green-500"
                                                            : friend.status === "in-game"
                                                                ? "bg-yellow-500"
                                                                : "bg-gray-400"
                                                        }`}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{friend.name}</h4>
                                                <p className="text-sm text-muted-foreground">@{friend.username}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                    <span>{friend.wpm} WPM</span>
                                                    <span>{friend.accuracy}% ACC</span>
                                                    <span>Level {friend.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={friend.status === "online" ? "default" : "secondary"}>{friend.status}</Badge>
                                            <Button variant="outline" size="sm">
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                Chat
                                            </Button>
                                            <Button size="sm">Challenge</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leaderboard" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Leaderboard</CardTitle>
                            <CardDescription>Top performers this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {leaderboard.map((player) => (
                                    <div
                                        key={player.rank}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${player.isCurrentUser ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8">
                                                {player.rank === 1 && <Crown className="w-6 h-6 text-yellow-500" />}
                                                {player.rank === 2 && <Medal className="w-6 h-6 text-gray-400" />}
                                                {player.rank === 3 && <Medal className="w-6 h-6 text-amber-600" />}
                                                {player.rank > 3 && <span className="font-bold text-lg">#{player.rank}</span>}
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold ${player.isCurrentUser ? "text-primary" : ""}`}>{player.name}</h4>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{player.wpm} WPM</span>
                                                    <span>{player.accuracy}% ACC</span>
                                                    <span>{player.points.toLocaleString()} pts</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={player.change.startsWith("+") ? "default" : "destructive"}>{player.change}</Badge>
                                            {player.isCurrentUser && <Badge variant="outline">You</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Friend Requests ({friendRequests.length})</CardTitle>
                            <CardDescription>People who want to connect with you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {friendRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={request.avatar || "/placeholder.svg"} />
                                                <AvatarFallback>
                                                    {request.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-semibold">{request.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    @{request.username} • {request.mutualFriends} mutual friends
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                Decline
                                            </Button>
                                            <Button size="sm">Accept</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
