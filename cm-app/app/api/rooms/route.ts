import CurrentProfile from "@/lib/current-profile";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
    try {
        const profile = await CurrentProfile();
        if (!profile) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { timeLimit, passageType } = await req.json();

        const roomCode = generateRoomCode();

        const room = await db.room.create({
            data: {
                code: roomCode,
                hostId: profile.id,
                timeLimit,
                passageType,
                passage: "", // Will be set when game starts
            }
        });

        // Add host as participant
        await db.roomParticipant.create({
            data: {
                roomId: room.id,
                userId: profile.id,
                isReady: true
            }
        });

        return NextResponse.json({
            roomId: room.id,
            roomCode: room.code
        });
    } catch (error) {
        console.log("[ROOM_CREATE]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
