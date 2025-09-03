import { Dashboard } from "@/components/dashboard/dashboard"
import CurrentProfile from "@/lib/current-profile";
import { redirect } from "next/navigation";

export default async function Home() {
    const profile = await CurrentProfile();

    if (!profile) {
        redirect("/sign-in")
    }

    return <div className="max-md:pt-3">
        <Dashboard profile={profile} />
    </div>
}