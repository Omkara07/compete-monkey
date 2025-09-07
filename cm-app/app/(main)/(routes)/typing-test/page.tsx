import { TypingTest } from "@/components/typing-test/typing-test"
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function TypingTestPage() {
    const profile = await currentUser();
    if (!profile) {
        redirect("/sign-in")
    }
    return <TypingTest />
}
