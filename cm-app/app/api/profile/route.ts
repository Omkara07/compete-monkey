import CurrentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const { name, imageUrl } = await req.json();

        console.log(name, imageUrl);
        const profile = await CurrentProfile();

        if (!profile) return new NextResponse("Unauthorized", { status: 401 });

        const updatedProfile = await db.user.update({
            where: {
                id: profile.id
            },
            data: {
                name,
                imageUrl
            }
        });

        return NextResponse.json(updatedProfile, {
            status: 200
        })
    }
    catch (error) {
        console.log("[PROFILE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}       