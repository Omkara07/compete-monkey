'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Target, Users, Zap } from 'lucide-react';
import axios from 'axios';

export default function CreateRoomPage() {
    const [timeLimit, setTimeLimit] = useState<30 | 60>(30);
    const [passageType, setPassageType] = useState<'text' | 'code'>('text');
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const createRoom = async () => {
        setIsCreating(true);
        try {
            const response = await axios.post('/api/rooms', {
                timeLimit,
                passageType
            });

            const { roomCode } = response.data;
            router.push(`/room/${roomCode}`);
        } catch (error) {
            console.error('Error creating room:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Create Competition Room</h1>
                    <p className="text-muted-foreground">Set up a new multiplayer typing competition</p>
                </div>

                <Card className="p-8">
                    <div className="space-y-8">
                        {/* Time Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                                <Clock size={16} />
                                Time Limit
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    onClick={() => setTimeLimit(30)}
                                    variant={timeLimit === 30 ? "default" : "outline"}
                                    className="h-16 flex-col gap-2"
                                >
                                    <div className="text-2xl font-bold">30s</div>
                                    <div className="text-sm text-muted-foreground">Quick Sprint</div>
                                </Button>
                                <Button
                                    onClick={() => setTimeLimit(60)}
                                    variant={timeLimit === 60 ? "default" : "outline"}
                                    className="h-16 flex-col gap-2"
                                >
                                    <div className="text-2xl font-bold">60s</div>
                                    <div className="text-sm text-muted-foreground">Standard Race</div>
                                </Button>
                            </div>
                        </div>

                        {/* Passage Type Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                                <Target size={16} />
                                Content Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    onClick={() => setPassageType('text')}
                                    variant={passageType === 'text' ? "default" : "outline"}
                                    className="h-16 flex-col gap-2"
                                >
                                    <Target className="w-6 h-6" />
                                    <div className="font-medium">Text</div>
                                    <div className="text-sm text-muted-foreground">Natural language</div>
                                </Button>
                                <Button
                                    onClick={() => setPassageType('code')}
                                    variant={passageType === 'code' ? "default" : "outline"}
                                    className="h-16 flex-col gap-2"
                                >
                                    <Zap className="w-6 h-6" />
                                    <div className="font-medium">Code</div>
                                    <div className="text-sm text-muted-foreground">Programming snippets</div>
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={createRoom}
                            disabled={isCreating}
                            className="w-full h-12 text-lg"
                        >
                            {isCreating ? 'Creating Room...' : (
                                <>
                                    <Users className="w-5 h-5 mr-2" />
                                    Create Competition Room
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}