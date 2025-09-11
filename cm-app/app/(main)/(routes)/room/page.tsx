import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomCard } from "@/components/room-tests/room-card"
import CurrentProfile from "@/lib/current-profile"
import { RedirectToSignIn } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { Home } from "lucide-react"
import { MotionFadeIn, MotionItem, MotionStagger } from "@/components/animations/motion"

type RoomRow = {
    id: string
    code: string
    hostId: string
    timeLimit: number
    passageType: string
    status: string
    maxPlayers: number
    createdAt: string | Date
}

async function fetchRooms(userId: string | null) {
    if (!userId) return { myRooms: [] as RoomRow[], joinedRooms: [] as RoomRow[] }
    try {
        const participantRooms = await db.room.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Partition into rooms hosted by user and rooms joined by user
        const myRooms = participantRooms.filter(room => room.hostId === userId);
        const joinedRooms = participantRooms.filter(room => room.hostId !== userId);

        return { myRooms, joinedRooms };
    } catch {
        // If DATABASE_URL missing or query fails, render empty lists gracefully
        return { myRooms: [] as RoomRow[], joinedRooms: [] as RoomRow[] }
    }
}

export default async function RoomPage() {

    const profile = await CurrentProfile();
    if (!profile) {
        return <RedirectToSignIn />
    }

    const { myRooms, joinedRooms } = await fetchRooms(profile?.id || null)

    return (
        <main className="w-full max-w-5xlflex flex-col gap-4 justify-center items-center p-4 md:p-6 lg:p-8">
            {/* Actions */}
            <MotionFadeIn from="down">
                <section className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
                    <Link href="/room/create" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto p-10">
                            Create Room
                        </Button>
                    </Link>
                    <Link href="/room/join" className="w-full sm:w-auto">
                        <Button size="lg" variant="secondary" className="w-full sm:w-auto p-10">
                            Join Room
                        </Button>
                    </Link>
                    <Link href="/dashboard" className="w-full sm:w-auto mt-2 sm:mt-0 ml-auto mr-10">
                        <Button variant="ghost" size="sm">
                            <Home className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                </section>
            </MotionFadeIn>

            {/* My Rooms */}
            <section className="space-y-3">
                <MotionFadeIn from="none">
                    <h2 className="text-lg font-semibold">My Rooms</h2>
                </MotionFadeIn>
                {myRooms.length === 0 ? (
                    <MotionFadeIn>
                        <Card>
                            <CardContent className="py-6 text-sm text-muted-foreground">
                                {"You haven’t hosted any rooms yet."}
                            </CardContent>
                        </Card>
                    </MotionFadeIn>
                ) : (
                    <MotionStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {myRooms.map((room) => (
                            <MotionItem key={room.id}>
                                <RoomCard room={room as any} href={`/room/${room.code}`} />
                            </MotionItem>
                        ))}
                    </MotionStagger>
                )}
            </section>

            {/* Joined Rooms */}
            <section className="mt-8 space-y-3">
                <MotionFadeIn from="none">
                    <h2 className="text-lg font-semibold">Joined Rooms</h2>
                </MotionFadeIn>
                {joinedRooms.length === 0 ? (
                    <MotionFadeIn>
                        <Card>
                            <CardContent className="py-6 text-sm text-muted-foreground">
                                {"You haven’t joined any rooms yet."}
                            </CardContent>
                        </Card>
                    </MotionFadeIn>
                ) : (
                    <MotionStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {joinedRooms.map((room) => (
                            <MotionItem key={room.id}>
                                <RoomCard room={room as any} href={`/room/${room.code}`} />
                            </MotionItem>
                        ))}
                    </MotionStagger>
                )}
            </section>
        </main>
    )
}
