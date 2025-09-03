import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Timer, CodeXml } from "lucide-react"
import { cn } from "@/lib/utils"

type Room = {
    id: string
    code: string
    hostId: string
    timeLimit: number
    passageType: string
    status: string
    maxPlayers: number
    createdAt: string | Date
}

export function RoomCard({ room, href, className }: { room: Room; href: string; className?: string }) {
    const isCode = room.passageType?.toLowerCase() === "code" || room.passageType?.toLowerCase() === "code_snippet"

    return (
        <Link href={href} className="block">
            <Card className={cn("transition-all hover:shadow-md hover:border-primary/40", className)}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-balance text-base">Room {room.code}</CardTitle>
                        <Badge variant="secondary" className="capitalize">
                            {room.status?.toLowerCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                    {/* <div className="flex items-center gap-2 text-muted-foreground">
                        <Timer className="h-4 w-4" />
                        <span>{room.timeLimit}s</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {isCode ? <CodeXml className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        <span className="capitalize">{isCode ? "code snippet" : "text"}</span>
                    </div> */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Max {room.maxPlayers} players</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
