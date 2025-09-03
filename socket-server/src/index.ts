import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';

config();

interface User {
    id: string;
    name: string;
    imageUrl?: string;
}

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

interface Room {
    code: string;
    host: User;
    participants: Map<string, Participant>;
    settings: RoomSettings;
    gameState: 'waiting' | 'countdown' | 'active' | 'finished';
    passage: string;
    results: Map<string, any>;
    startTime: number | null;
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL || "http://localhost:3000",
            "https://compete-monkey.vercel.app"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Socket server is running.');
});

// Room state management
const rooms = new Map<string, Room>();

function createRoom(roomCode: string, host: User): Room {
    return {
        code: roomCode,
        host: host,
        participants: new Map(),
        settings: {
            timeLimit: 30,
            passageType: 'text'
        },
        gameState: 'waiting',
        passage: '',
        results: new Map(),
        startTime: null
    };
}

function resetRoom(room: Room) {
    room.gameState = 'waiting';
    room.passage = '';
    room.results.clear();
    room.startTime = null;
    room.participants.forEach(p => {
        p.isReady = false;
        p.progress = 0;
        p.currentWpm = 0;
        p.currentAccuracy = 0;
    });
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', async ({ roomCode, user }: { roomCode: string; user: User }) => {
        console.log('Join-room received:', { roomCode, user, server: process.env.RENDER_INSTANCE_ID });
        try {
            socket.join(roomCode);

            if (!rooms.has(roomCode)) {
                rooms.set(roomCode, createRoom(roomCode, user));
            }

            const room = rooms.get(roomCode)!;

            room.participants.set(socket.id, {
                ...user,
                socketId: socket.id,
                isReady: false,
                progress: 0
            });

            // Emitting event to frontend to handle database operation
            socket.emit('join-user-in-db', {
                roomCode,
                user
            });

            // Notify all participants
            io.to(roomCode).emit('room-updated', {
                participants: Array.from(room.participants.values()),
                settings: room.settings,
                gameState: room.gameState
            });

            socket.emit('joined-room', {
                roomCode,
                room: {
                    ...room,
                    participants: Array.from(room.participants.values())
                }
            });

        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    // Update room settings (host only)
    socket.on('update-settings', ({ roomCode, settings }: { roomCode: string; settings: Partial<RoomSettings> }) => {
        const room = rooms.get(roomCode);
        if (room && room.participants.get(socket.id)?.id === room.host.id) {
            room.settings = { ...room.settings, ...settings };
            io.to(roomCode).emit('settings-updated', room.settings);
        }
    });

    // Player ready toggle
    socket.on('toggle-ready', ({ roomCode }: { roomCode: string }) => {
        const room = rooms.get(roomCode);
        if (room && room.participants.has(socket.id)) {
            const participant = room.participants.get(socket.id)!;
            participant.isReady = !participant.isReady;

            io.to(roomCode).emit('room-updated', {
                participants: Array.from(room.participants.values()),
                settings: room.settings,
                gameState: room.gameState
            });
        }
    });

    // Start game (host only)
    socket.on('start-game', ({ roomCode, passage }: { roomCode: string; passage: string }) => {
        const room = rooms.get(roomCode);
        if (room && room.participants.get(socket.id)?.id === room.host.id) {
            room.gameState = 'countdown';
            room.passage = passage;
            room.results.clear();

            io.to(roomCode).emit('game-starting', { passage });

            // 3-second countdown
            let countdown = 3;
            const countdownInterval = setInterval(() => {
                io.to(roomCode).emit('countdown', countdown);
                countdown--;

                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    room.gameState = 'active';
                    room.startTime = Date.now();
                    io.to(roomCode).emit('game-started', {
                        startTime: room.startTime,
                        timeLimit: room.settings.timeLimit
                    });

                    // Force game end after time limit + buffer
                    setTimeout(() => {
                        if (room.gameState === 'active') {
                            const finalResults = Array.from(room.participants.values()).map(participant => {
                                const existingResult = room.results.get(participant.socketId);
                                return {
                                    userId: participant.id,
                                    wpm: existingResult?.wpm || participant.currentWpm || 0,
                                    accuracy: existingResult?.accuracy || participant.currentAccuracy || 0,
                                    correctChars: existingResult?.correctChars || 0,
                                    incorrectChars: existingResult?.incorrectChars || 0,
                                    totalChars: existingResult?.totalChars || 0,
                                    completedAt: existingResult?.completedAt || Date.now()
                                };
                            });

                            const sortedResults = finalResults
                                .sort((a, b) => {
                                    if (a.wpm !== b.wpm) return b.wpm - a.wpm;
                                    return b.accuracy - a.accuracy;
                                })
                                .map((result, index) => ({ ...result, position: index + 1 }));

                            room.gameState = 'finished';
                            io.to(roomCode).emit('game-finished', {
                                results: sortedResults,
                                winner: sortedResults[0]
                            });

                            // Automatically reset room after 5 seconds
                            // setTimeout(() => {
                            //     if (rooms.has(roomCode)) {
                            //         resetRoom(room);
                            //         io.to(roomCode).emit('room-reset', {
                            //             participants: Array.from(room.participants.values()),
                            //             settings: room.settings,
                            //             gameState: room.gameState
                            //         });
                            //     }
                            // }, 5000); // 5-second delay to show results
                        }
                    }, (room.settings.timeLimit + 2) * 1000);
                }
            }, 1000);
        }
    });

    // Live progress updates
    socket.on('progress-update', ({
        roomCode,
        progress,
        wpm,
        accuracy
    }: {
        roomCode: string;
        progress: number;
        wpm: number;
        accuracy: number;
    }) => {
        const room = rooms.get(roomCode);
        if (room && room.participants.has(socket.id)) {
            const participant = room.participants.get(socket.id)!;
            participant.progress = progress;
            participant.currentWpm = wpm;
            participant.currentAccuracy = accuracy;

            io.to(roomCode).emit('live-update', {
                userId: participant.id,
                progress,
                wpm,
                accuracy
            });
        }
    });

    // Submit test results
    socket.on('submit-result', ({ roomCode, result }: { roomCode: string; result: any }) => {
        const room = rooms.get(roomCode);
        if (room) {
            const participant = room.participants.get(socket.id);
            room.results.set(socket.id, {
                ...result,
                userId: participant?.id,
                submittedAt: Date.now()
            });

            const totalParticipants = room.participants.size;
            const completedResults = room.results.size;

            if (completedResults === totalParticipants) {
                const finalResults = Array.from(room.participants.values()).map(participant => {
                    const existingResult = room.results.get(participant.socketId);
                    return {
                        userId: participant.id,
                        wpm: existingResult?.wpm || participant.currentWpm || 0,
                        accuracy: existingResult?.accuracy || participant.currentAccuracy || 0,
                        correctChars: existingResult?.correctChars || 0,
                        incorrectChars: existingResult?.incorrectChars || 0,
                        totalChars: existingResult?.totalChars || 0,
                        completedAt: existingResult?.completedAt || Date.now()
                    };
                });

                const sortedResults = finalResults
                    .sort((a, b) => {
                        if (a.wpm !== b.wpm) return b.wpm - a.wpm;
                        return b.accuracy - a.accuracy;
                    })
                    .map((result, index) => ({ ...result, position: index + 1 }));

                room.gameState = 'finished';
                io.to(roomCode).emit('game-finished', {
                    results: sortedResults,
                    winner: sortedResults[0]
                });
                // Automatically reset room after 5 seconds
                // setTimeout(() => {
                //     if (rooms.has(roomCode)) {
                //         resetRoom(room);
                //         io.to(roomCode).emit('room-reset', {
                //             participants: Array.from(room.participants.values()),
                //             settings: room.settings,
                //             gameState: room.gameState
                //         });
                //     }
                // }, 5000);
            }
        }
    });

    // Reset room (host only)
    socket.on('reset-room', ({ roomCode }: { roomCode: string }) => {
        const room = rooms.get(roomCode);
        if (room && room.participants.get(socket.id)?.id === room.host.id) {
            resetRoom(room);
            io.to(roomCode).emit('room-reset', {
                participants: Array.from(room.participants.values()),
                settings: room.settings,
                gameState: room.gameState
            });
        }
    });

    // Leave room
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        for (const [roomCode, room] of rooms.entries()) {
            if (room.participants.has(socket.id)) {
                const wasHost = room.host.id === socket.id;
                room.participants.delete(socket.id);

                if (room.participants.size === 0) {
                    rooms.delete(roomCode);
                } else {
                    if (wasHost && room.participants.size > 0) {
                        // Only change host if the disconnected user was the host
                        const newHost = Array.from(room.participants.values())[0];
                        room.host = { id: newHost?.id || "", name: newHost?.name || "" };
                        console.log(`New host set: ${newHost?.name || ""}`);
                    }
                    io.to(roomCode).emit('room-updated', {
                        participants: Array.from(room.participants.values()),
                        settings: room.settings,
                        gameState: room.gameState,
                        host: room.host // Send updated host info
                    });
                }
                break;
            }
        }
    });
});

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket server running on port ${PORT}`);
});