import CurrentProfile from "@/lib/current-profile";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new Response("Unauthorized", { status: 401 });
        }

        const room = await db.room.findUnique({
            where: { code: params.code },
            include: {
                host: true,
                participants: {
                    include: { user: true }
                }
            }
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        return NextResponse.json({ room });
    } catch (error) {
        console.log("[ROOM_GET]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new Response("Unauthorized", { status: 401 });
        }

        const room = await db.room.findUnique({
            where: { code: params.code },
            include: { participants: true }
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.participants.length >= room.maxPlayers) {
            return NextResponse.json({ error: "Room is full" }, { status: 400 });
        }

        // Check if already in room
        const existingParticipant = room.participants.find(p => p.userId === profile.id);
        if (existingParticipant) {
            return NextResponse.json({ message: "Already in room" });
        }

        await db.roomParticipant.create({
            data: {
                roomId: room.id,
                userId: profile.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("[ROOM_JOIN]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}