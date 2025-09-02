'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Users, ArrowRight } from 'lucide-react';

export default function JoinRoomPage() {
    const [roomCode, setRoomCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const router = useRouter();

    const joinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomCode.trim()) return;

        setIsJoining(true);
        try {
            // Validate room exists before navigating
            const response = await fetch(`/api/rooms/${roomCode.toUpperCase()}`);

            if (response.ok) {
                router.push(`/room/${roomCode.toUpperCase()}`);
            } else if (response.status === 404) {
                alert('Room not found. Please check the code and try again.');
            } else {
                alert('Error joining room. Please try again.');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Error joining room. Please try again.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Join Competition</h1>
                    <p className="text-muted-foreground">Enter the room code to join a typing competition</p>
                </div>

                <Card className="p-6">
                    <form onSubmit={joinRoom} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="roomCode">Room Code</Label>
                            <Input
                                id="roomCode"
                                type="text"
                                placeholder="Enter 6-character code"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                className="text-center text-lg font-mono tracking-wider"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={roomCode.length !== 6 || isJoining}
                            className="w-full h-12"
                        >
                            {isJoining ? 'Joining Room...' : (
                                <>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Join Competition
                                </>
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}