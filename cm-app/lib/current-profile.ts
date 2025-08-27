import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db";

export default async function CurrentProfile() {
    const { userId } = await auth();
    if (!userId) return null;

    const currentProfile = await db.user.findUnique({
        where: {
            userId
        }
    });
    return currentProfile
}