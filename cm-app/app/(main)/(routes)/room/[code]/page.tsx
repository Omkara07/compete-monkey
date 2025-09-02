import { RoomTest } from '@/components/room-tests/room-test';
import CurrentProfile from '@/lib/current-profile';
import { RedirectToSignIn } from '@clerk/nextjs';

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
    const user = await CurrentProfile();

    if (!user) {
        return <RedirectToSignIn />;
    }

    const { code } = await params;
    const roomUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/room/${code}`;
    return <RoomTest user={user} roomUrl={roomUrl} code={code} />;
}