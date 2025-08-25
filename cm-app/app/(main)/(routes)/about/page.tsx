import Navbar from "@/components/navigation/navbar";

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center w-screen min-h-screen">
            <div className="flex w-full fixed top-0 justify-center z-50">
                <Navbar />
            </div>
            <div className="flex flex-col w-full justify-center items-center py-30 mt-24 px-4">
                <h1 className="text-4xl font-bold mb-4">About Compete Monkey</h1>
                <p className="text-lg text-muted-foreground max-w-2xl text-center mb-6">
                    Compete Monkey is a fun, gamified typing arena. Create or join rooms, race
                    your friends (or strangers) in real-time, and track your typing speed and
                    accuracy with live leaderboards.
                </p>
                <div className="max-w-2xl text-center text-base text-muted-foreground">
                    <p>
                        Pick a passage, start a match, and see who finishes first. We provide
                        matchmaking, fair scoring, and detailed stats after each race so you can
                        improve over time. Ready to type faster? Spin up a room and start competing.
                    </p>
                </div>
            </div>
        </div>
    );
}


