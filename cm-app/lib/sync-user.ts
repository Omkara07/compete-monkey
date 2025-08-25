import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function syncUser() {
    const user = await currentUser();
    if (!user) return redirect("/sign-in");

    // check if exists
    let dbUser = await db.user.findUnique({
        where: { userId: user.id },
    });

    if (!dbUser) {
        dbUser = await db.user.create({
            data: {
                userId: user.id,
                name: `${user.firstName} ${user.lastName}`,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress
            },
        });
    }

    return dbUser;
}
