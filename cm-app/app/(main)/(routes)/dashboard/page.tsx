import { syncUser } from "@/lib/sync-user";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    const user = await syncUser();

    return (
        <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            <aside className="rounded-xl border p-4 md:sticky md:top-4 h-fit">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.imageUrl || "/vercel.svg"}
                        alt={user?.name || "User"}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-semibold leading-tight">{user?.name ?? "User"}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                            {user?.email ?? "no-email@example.com"}
                        </p>
                    </div>
                </div>
                <div className="mt-auto">
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "h-16 w-16",
                                },
                            }}
                        />
                    </SignedIn>
                </div>
            </aside>
            <main className="rounded-xl border p-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Your overview and quick actions.</p>
                <div className="mt-6 h-40 rounded-lg border border-dashed" />
            </main>
        </div>
    );
}