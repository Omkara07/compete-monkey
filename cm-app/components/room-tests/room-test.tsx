'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Settings, Crown, Clock, Target, Zap, KeyboardIcon, Home, Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { User } from '@/lib/generated/prisma';

interface Participant extends User {
    socketId: string;
    isReady: boolean;
    progress: number;
    currentWpm?: number;
    currentAccuracy?: number;
}

interface RoomSettings {
    timeLimit: number;
    passageType: 'text' | 'code';
}

interface TypingStats {
    wpm: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
    totalChars: number;
}

interface RoomTestProps {
    user: User | null;
    roomUrl: string;
    code: string;
}

export function RoomTest({ user, roomUrl, code }: RoomTestProps) {
    const textPassages = [
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. It has been used for decades to test typewriters and keyboards. The sentence is memorable and flows naturally when typed.",
        "In the heart of the bustling city, where skyscrapers touch the clouds and the streets never sleep, people from all walks of life pursue their dreams. Technology advances at breakneck speed, connecting us in ways previously unimaginable.",
        "Programming is the art of telling another human what one wants the computer to do. It requires logical thinking, attention to detail, and the ability to break down complex problems into smaller, manageable pieces."
    ];

    const codeSnippets = [
        `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(result);`,
        `const users = await fetch('/api/users')
  .then(response => response.json())
  .catch(error => console.error(error));

const activeUsers = users.filter(user => user.isActive);`,
        `import React, { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}`
    ];

    const [socket, setSocket] = useState<Socket | null>(null);
    const [room, setRoom] = useState<any>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [gameState, setGameState] = useState<"setup" | "countdown" | "typing" | "finished">("setup");
    const [isHost, setIsHost] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPassage, setCurrentPassage] = useState("");
    const [userInput, setUserInput] = useState("");
    const [timeLeft, setTimeLeft] = useState(30);
    const [countdown, setCountdown] = useState(3);
    const [stats, setStats] = useState<TypingStats>({
        wpm: 0,
        accuracy: 0,
        correctChars: 0,
        incorrectChars: 0,
        totalChars: 0,
    });
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [finalResults, setFinalResults] = useState<any[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const roomCode = code;

    const calculateStats = useCallback((input: string, passage: string, timeElapsed: number) => {
        const correctChars = input.split("").filter((char, index) => char === passage[index]).length;
        const incorrectChars = input.length - correctChars;
        const totalChars = input.length;
        const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;

        const wordsTyped = correctChars / 5;
        const timeInMinutes = timeElapsed / 60;
        const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;

        return {
            wpm,
            accuracy: Math.round(accuracy),
            correctChars,
            incorrectChars,
            totalChars,
        };
    }, []);

    //socket io connections and events
    useEffect(() => {
        if (!user) {
            setError('Please log in to join the room');
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const newSocket = io(socketUrl, { autoConnect: true, transports: ['websocket', 'polling'] });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join-room', { roomCode, user });
        });

        newSocket.on('joined-room', async ({ room }) => {
            setRoom(room);
            setIsHost(room?.host?.id && user?.id ? room.host.id === user.id : false);

            // Join user in database after successful socket room join
            try {
                const response = await axios.post(`/api/rooms/${roomCode}`, {
                    userId: user?.id,
                    userName: user?.name
                });
            } catch (error) {
                console.error('Error joining room in database:', error);
                setError('Failed to join room in database. Please try again.');
            }
        });

        newSocket.on('room-updated', ({ participants, settings, gameState }) => {
            setParticipants(participants || []);
            setGameState(
                gameState === 'waiting' ? 'setup' :
                    gameState === 'active' ? 'typing' :
                        gameState || 'setup'
            );
        });

        newSocket.on('game-starting', ({ passage }) => {
            setCurrentPassage(passage || '');
            setUserInput("");
            setCurrentCharIndex(0);
            setStats({
                wpm: 0,
                accuracy: 0,
                correctChars: 0,
                incorrectChars: 0,
                totalChars: 0,
            });
        });

        newSocket.on('countdown', (count) => {
            setGameState('countdown');
            setCountdown(count || 3);
        });

        newSocket.on('game-started', ({ startTime, timeLimit }) => {
            setGameState('typing');
            setStartTime(startTime || Date.now());
            setTimeLeft(timeLimit || 30);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        submitResult();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            setTimeout(() => {
                submitResult();
            }, (timeLimit || 30) * 1000);

            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        });

        newSocket.on('live-update', ({ userId, progress, wpm, accuracy }) => {
            setParticipants(prev =>
                prev.map(p =>
                    p.id === userId
                        ? { ...p, progress: progress || 0, currentWpm: wpm || 0, currentAccuracy: accuracy || 0 }
                        : p
                )
            );
        });

        newSocket.on('game-finished', ({ results, winner }) => {
            setGameState('finished');
            setFinalResults(results || []);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        });

        newSocket.on('room-reset', ({ participants, settings, gameState }) => {
            setGameState(gameState === 'waiting' ? 'setup' : gameState);
            setParticipants(participants || []);
            setCurrentPassage("");
            setUserInput("");
            setCurrentCharIndex(0);
            setFinalResults([]);
            setStats({
                wpm: 0,
                accuracy: 0,
                correctChars: 0,
                incorrectChars: 0,
                totalChars: 0,
            });
            setTimeLeft(room?.settings?.timeLimit || 30);
        });

        newSocket.on('error', ({ message }) => {
            console.error('Socket error:', message);
            setError(message);
        });

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            newSocket.disconnect();
        };
    }, [roomCode, user]);

    useEffect(() => {
        if (gameState === "finished" && finalResults.length > 0) {
            saveCompetitionResult();
        }
    }, [gameState, finalResults]);

    const copyInviteLink = () => {
        navigator.clipboard.writeText(roomUrl);
    };

    const toggleReady = () => {
        socket?.emit('toggle-ready', { roomCode });
    };

    const getRandonText = async () => {
        const res = await axios.get("/api/random-text");
        const text = res.data;
        return text;
    }
    const startGame = async () => {
        if (isHost && room) {
            // const passages = room.settings?.passageType === 'text' ? textPassages : codeSnippets;
            // const passage = passages[Math.floor(Math.random() * passages.length)];
            const passage = await getRandonText()
            socket?.emit('start-game', { roomCode, passage });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (gameState !== "typing") return;

        const value = e.target.value;
        setUserInput(value);
        setCurrentCharIndex(value.length);

        const timeElapsed = (Date.now() - startTime) / 1000;
        const newStats = calculateStats(value, currentPassage, timeElapsed);
        setStats(newStats);

        const progress = currentPassage.length > 0 ? (value.length / currentPassage.length) * 100 : 0;
        socket?.emit('progress-update', {
            roomCode,
            progress,
            wpm: newStats.wpm,
            accuracy: newStats.accuracy
        });

        if (value.length >= currentPassage.length || timeLeft <= 0) {
            submitResult();
        }
    };

    const submitResult = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const finalStats = calculateStats(userInput, currentPassage, (Date.now() - startTime) / 1000);
        socket?.emit('submit-result', {
            roomCode,
            result: {
                ...finalStats,
                userId: user?.id,
                completedAt: Date.now()
            }
        });
    };

    const saveCompetitionResult = async () => {
        try {
            // Only host should save competition results
            if (!isHost) {
                return;
            }

            if (finalResults.length === 0) {
                console.warn('No results to save');
                return;
            }

            const response = await axios.post('/api/competitions', {
                roomCode,
                results: finalResults,
                passage: currentPassage,
                timeLimit: room?.settings?.timeLimit,
                passageType: room?.settings?.passageType
            });

        } catch (error) {
            console.error('Error saving competition result:', error);
        }
    };

    const resetRoom = () => {
        socket?.emit('reset-room', { roomCode });
    };

    const renderPassageText = useMemo(() => {
        return currentPassage.split("").map((char, index) => {
            const isTyped = index < userInput.length
            const isCurrent = index === currentCharIndex
            const isCorrect = isTyped && userInput[index] === char
            const isIncorrect = isTyped && userInput[index] !== char

            let className = "relative transition-colors duration-75 ease-out"

            if (isTyped) {
                if (isCorrect) {
                    className += " text-emerald-600 dark:text-emerald-500"
                } else {
                    className += " text-red-600 dark:text-red-500 bg-red-500/20 dark:bg-red-400/20 rounded-sm"
                }
            } else {
                className += " text-gray-700 dark:text-gray-500"
            }

            return (
                <span key={index} className={className}>
                    {/* Typing cursor - vertical line that blinks */}
                    {isCurrent && (
                        <motion.span
                            className="absolute -left-0.5 top-0 w-0.5 h-full bg-yellow-500 dark:bg-yellow-400 rounded-full transition-all duration-150"
                            initial={{ opacity: 1 }}
                            animate={{
                                opacity: [1, 1, 0, 0],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                                times: [0, 0.1, 0.9, 1]
                            }}
                        />
                    )}
                    {char}
                </span>
            )
        })
    }, [currentPassage, userInput, currentCharIndex])

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"
                >
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <KeyboardIcon className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <h1 className="text-xl font-bold">Compete-Monkey</h1>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </div>
                    </div>
                </motion.header>
                <main className="flex-1 container mx-auto px-6 py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-destructive">{error}</p>
                            <Button onClick={() => router.push('/dashboard')} className="mt-4">
                                Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"
            >
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <KeyboardIcon className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl font-bold">Compete-Monkey - Room {roomCode}</h1>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                            <Home className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </div>
                </div>
            </motion.header>

            <main className="flex-1 container mx-auto px-6 py-8 max-w-[85vw]">
                <AnimatePresence mode="wait">
                    {gameState === "setup" && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="w-5 h-5" />
                                                Room {roomCode}
                                            </CardTitle>
                                            <p className="text-muted-foreground">
                                                Waiting for players to join...
                                            </p>
                                        </div>
                                        {isHost && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Crown className="w-3 h-3" />
                                                Host
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                            </Card>

                            <div className="grid md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="w-4 h-4" />
                                            Game Settings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Time Limit:</span>
                                                <span className="font-medium">{room?.settings?.timeLimit || 30}s</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Content Type:</span>
                                                <span className="font-medium capitalize">{room?.settings?.passageType || 'text'}</span>
                                            </div>
                                        </div>
                                        {isHost && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Time Limit</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={room?.settings?.timeLimit === 30 ? "default" : "outline"}
                                                            onClick={() => socket?.emit('update-settings', { roomCode, settings: { timeLimit: 30 } })}
                                                        >
                                                            30s
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={room?.settings?.timeLimit === 60 ? "default" : "outline"}
                                                            onClick={() => socket?.emit('update-settings', { roomCode, settings: { timeLimit: 60 } })}
                                                        >
                                                            60s
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Content Type</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={room?.settings?.passageType === 'text' ? "default" : "outline"}
                                                            onClick={() => socket?.emit('update-settings', { roomCode, settings: { passageType: 'text' } })}
                                                        >
                                                            Text
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={room?.settings?.passageType === 'code' ? "default" : "outline"}
                                                            disabled
                                                        >
                                                            Code (Coming Soon)
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Invite Friends</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-muted rounded-lg text-sm font-mono break-all">
                                                {roomUrl}
                                            </div>
                                            <Button onClick={copyInviteLink} className="w-full" variant="default">
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy Invite Link
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Players ({participants.length}/8)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {participants.map((participant) => (
                                                <div key={participant.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            {participant.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {participant.name}
                                                            {participant.id === room?.host?.id && (
                                                                <Crown className="w-3 h-3 inline ml-1" />
                                                            )}
                                                        </span>
                                                    </div>
                                                    <Badge variant={participant.isReady ? "default" : "outline"}>
                                                        {participant.isReady ? "Ready" : "Not Ready"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button onClick={toggleReady} variant="outline">
                                    {participants.find(p => p.id === user?.id)?.isReady ? "Not Ready" : "Ready Up"}
                                </Button>
                                {isHost && (
                                    <Button
                                        onClick={startGame}
                                        disabled={!participants.every(p => p.isReady)}
                                        className="px-8"
                                    >
                                        Start Competition
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {gameState === "countdown" && (
                        <motion.div
                            key="countdown"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-center min-h-[60vh]"
                        >
                            <motion.div
                                key={countdown}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="text-center"
                            >
                                <div className="text-8xl font-bold text-primary mb-4">{countdown || "GO!"}</div>
                                <p className="text-xl text-muted-foreground">{countdown ? "Get ready..." : "Start typing!"}</p>
                            </motion.div>
                        </motion.div>
                    )}

                    {gameState === "typing" && (
                        <motion.div
                            key="typing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-full space-y-6"
                        >
                            <div className="flex w-ful items-center justify-between bg-card border rounded-lg p-4">
                                <div className="flex items-center gap-6">
                                    <div className="relative flex items-center gap-2">
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute -inset-2 rounded-md ring-2 ring-primary/25 animate-pulse"
                                        />
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-mono text-xl md:text-2xl font-semibold tracking-tight">
                                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">WPM:</span>
                                        <span className="font-semibold ml-1">{stats.wpm}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Accuracy:</span>
                                        <span className="font-semibold ml-1">{stats.accuracy}%</span>
                                    </div>
                                </div>
                                <Progress value={(userInput.length / currentPassage.length) * 100 * 1.0} className="w-32" />
                            </div>

                            <Card className="p-6 md:p-10 relative w-full">
                                <div
                                    className={cn(
                                        "w-full max-w-full min-h-[55vh] grid place-items-center mb-8 p-6 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 cursor-text transition-colors"
                                    )}
                                    onClick={() => inputRef.current?.focus()}
                                    role="textbox"
                                    aria-label="Typing area"
                                    tabIndex={0}
                                >
                                    <div className="w-full text-center">
                                        <motion.div
                                            key="passage"
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="inline-block text-pretty text-2xl md:text-3xl leading-relaxed font-medium tracking-wide letterspacing-wide"
                                        >
                                            {renderPassageText}
                                        </motion.div>
                                    </div>
                                </div>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    className="absolute -left-[9999px] opacity-0 w-1 h-1"
                                    autoComplete="off"
                                    spellCheck="false"
                                    autoFocus
                                />

                                <div className="text-center text-muted-foreground text-sm">
                                    <motion.div
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                    >
                                        Click the area above and start typing to begin the test...
                                    </motion.div>
                                </div>
                            </Card>

                            <div className="lg:col-span-1">
                                <Card className="p-4 sticky top-24">
                                    <CardHeader className="p-0 mb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Trophy className="w-4 h-4" />
                                            Live Rankings
                                        </CardTitle>
                                    </CardHeader>
                                    <div className="space-y-3">
                                        {participants
                                            .sort((a, b) => (b.currentWpm || 0) - (a.currentWpm || 0))
                                            .map((participant, index) => (
                                                <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={index === 0 ? "default" : "outline"} className="w-6 h-6 text-xs p-0">
                                                            {index + 1}
                                                        </Badge>
                                                        <span className={cn(
                                                            "text-sm truncate max-w-20",
                                                            participant.id === user?.id && "font-bold text-primary"
                                                        )}>
                                                            {participant.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-right text-xs">
                                                        <div className="font-semibold">{participant.currentWpm || 0} WPM</div>
                                                        <div className="text-muted-foreground">{Math.round(participant.progress || 0)}%</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "finished" && (
                        <motion.div
                            key="finished"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                                    <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold">Competition Complete!</h2>
                                    <p className="text-muted-foreground">Final Results</p>
                                </motion.div>
                            </div>

                            <Card className="max-w-4xl mx-auto">
                                <CardHeader>
                                    <CardTitle className="text-center">Final Leaderboard</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {finalResults.length > 0 ? (
                                            finalResults.map((result, index) => (
                                                <div key={result?.userId} className={cn(
                                                    "flex items-center justify-between p-4 rounded-lg",
                                                    index === 0 && "bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20",
                                                    index === 1 && "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/20",
                                                    index === 2 && "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/20",
                                                    index > 2 && "bg-muted/50",
                                                    result?.userId === user?.id && "ring-2 ring-primary/50"
                                                )}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-full flex items-center justify-center font-bold",
                                                            index === 0 && "bg-amber-500 text-white",
                                                            index === 1 && "bg-gray-400 text-white",
                                                            index === 2 && "bg-amber-600 text-white",
                                                            index > 2 && "bg-muted text-muted-foreground"
                                                        )}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">
                                                                {participants.find(p => p.id === result?.userId)?.name || 'Unknown'}
                                                                {result?.userId === user?.id && " (You)"}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {result?.accuracy}% accuracy
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold">{result.wpm} WPM</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {result?.correctChars}/{result?.totalChars} chars
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-muted-foreground">No results available.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                        <div className="text-3xl font-bold text-primary mb-2">{stats.wpm}</div>
                                        <div className="text-sm text-muted-foreground">Your WPM</div>
                                    </Card>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <Card className="p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                                        <div className="text-3xl font-bold text-accent mb-2">{stats.accuracy}%</div>
                                        <div className="text-sm text-muted-foreground">Your Accuracy</div>
                                    </Card>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <Card className="p-6 text-center">
                                        <div className="text-3xl font-bold text-green-500 mb-2">
                                            {finalResults.findIndex(r => r.userId === user?.id) + 1 || '-'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Your Position</div>
                                    </Card>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                    <Card className="p-6 text-center">
                                        <div className="text-3xl font-bold text-blue-500 mb-2">{participants.length}</div>
                                        <div className="text-sm text-muted-foreground">Total Players</div>
                                    </Card>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center"
                            >
                                <Badge variant="secondary" className="text-lg px-4 py-2">
                                    {finalResults.findIndex(r => r.userId === user?.id) === 0
                                        ? "🏆 Champion!"
                                        : finalResults.findIndex(r => r.userId === user?.id) < 3
                                            ? "🥉 Podium Finish!"
                                            : stats.wpm >= 60
                                                ? "⚡ Fast Typer!"
                                                : "💪 Keep Practicing!"}
                                </Badge>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex justify-center gap-4"
                            >
                                {isHost && (
                                    <Button onClick={resetRoom} variant="outline" size="lg">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        New Round
                                    </Button>
                                )}
                                <Button onClick={() => router.push('/dashboard')} size="lg">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
}