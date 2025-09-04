import { Dashboard } from "@/components/dashboard/dashboard"
import { syncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";

export default async function Home() {
    const profile = await syncUser();
    if (!profile) {
        redirect("/sign-in")
    }
    console.log(profile)

    return <div className="max-md:pt-3">
        <Dashboard profile={profile as any} />
    </div>
}