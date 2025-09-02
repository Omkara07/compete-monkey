import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomCard } from "@/components/room-tests/room-card"
import CurrentProfile from "@/lib/current-profile"
import { RedirectToSignIn } from "@clerk/nextjs"
import { db } from "@/lib/db"

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
        <main className="mx-auto w-full max-w-5xl p-4 md:p-6 lg:p-8">
            {/* Actions */}
            <section className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
                <Link href="/room/create" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                        Create Room
                    </Button>
                </Link>
                <Link href="/room/join" className="w-full sm:w-auto">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                        Join Room
                    </Button>
                </Link>
            </section>

            {/* My Rooms */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">My Rooms</h2>
                {myRooms.length === 0 ? (
                    <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">
                            {"You haven’t hosted any rooms yet."}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {myRooms.map((room) => (
                            <RoomCard key={room.id} room={room as any} href={`/room/${room.code}`} />
                        ))}
                    </div>
                )}
            </section>

            {/* Joined Rooms */}
            <section className="mt-8 space-y-3">
                <h2 className="text-lg font-semibold">Joined Rooms</h2>
                {joinedRooms.length === 0 ? (
                    <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">
                            {"You haven’t joined any rooms yet."}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {joinedRooms.map((room) => (
                            <RoomCard key={room.id} room={room as any} href={`/room/${room.code}`} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
