"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, RotateCcw, Home, Trophy, Target, Zap, KeyboardIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import axios from "axios"

const textPassages = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. It has been used for decades to test typewriters and keyboards. The sentence is memorable and flows naturally when typed.",
    "In the heart of the bustling city, where skyscrapers touch the clouds and the streets never sleep, people from all walks of life pursue their dreams. Technology advances at breakneck speed, connecting us in ways previously unimaginable.",
    "Programming is the art of telling another human what one wants the computer to do. It requires logical thinking, attention to detail, and the ability to break down complex problems into smaller, manageable pieces.",
]

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
}`,
]

interface TypingStats {
    wpm: number
    accuracy: number
    correctChars: number
    incorrectChars: number
    totalChars: number
}

export function TypingTest() {
    const [gameState, setGameState] = useState<"setup" | "countdown" | "typing" | "finished">("setup")
    const [timeLimit, setTimeLimit] = useState<30 | 60>(30)
    const [passageType, setPassageType] = useState<"text" | "code">("text")
    const [currentPassage, setCurrentPassage] = useState("")
    const [userInput, setUserInput] = useState("")
    const [timeLeft, setTimeLeft] = useState(30)
    const [countdown, setCountdown] = useState(3)
    const router = useRouter()

    const [stats, setStats] = useState<TypingStats>({
        wpm: 0,
        accuracy: 0,
        correctChars: 0,
        incorrectChars: 0,
        totalChars: 0,
    })
    const [currentCharIndex, setCurrentCharIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)
    const [startTime, setStartTime] = useState<number>(0)

    const calculateStats = useCallback((input: string, passage: string, timeElapsed: number) => {
        const correctChars = input.split("").filter((char, index) => char === passage[index]).length
        const incorrectChars = input.length - correctChars
        const totalChars = input.length
        const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0

        // Fix WPM calculation: use characters/5 as words and actual elapsed time in minutes
        const wordsTyped = correctChars / 5 // Standard: 5 characters = 1 word
        const timeInMinutes = timeElapsed / 60
        const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0

        return {
            wpm,
            accuracy: Math.round(accuracy),
            correctChars,
            incorrectChars,
            totalChars,
        }
    }, [])

    // Clear all timers helper function
    const clearAllTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
        }
    }, [])

    useEffect(() => {
        const getRandonText = async () => {
            const res = await axios.get("/api/random-text");
            const text = res.data;
            setCurrentPassage(text);
        }
        if (gameState === "setup") {
            getRandonText()
        }
    }, [gameState])

    const startTest = () => {
        // Clear any existing timers first
        clearAllTimers()

        // const passages = passageType === "text" ? textPassages : codeSnippets
        // const randomPassage = passages[Math.floor(Math.random() * passages.length)]
        // setCurrentPassage(randomPassage)
        setTimeLeft(timeLimit)
        setUserInput("")
        setCurrentCharIndex(0)
        setGameState("countdown")
        setCountdown(3)
        setStartTime(0)
        setStats({
            wpm: 0,
            accuracy: 0,
            correctChars: 0,
            incorrectChars: 0,
            totalChars: 0,
        })

        // Start countdown
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearAllTimers()
                    setGameState("typing")
                    setStartTime(Date.now())

                    // Small delay to ensure the input is focused after state change
                    setTimeout(() => {
                        inputRef.current?.focus()
                    }, 100)

                    // Start main timer
                    timerRef.current = setInterval(() => {
                        setTimeLeft((prevTime) => {
                            if (prevTime <= 1) {
                                clearAllTimers()
                                setGameState("finished")
                                return 0
                            }
                            return prevTime - 1
                        })
                    }, 1000)

                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const resetTest = () => {
        clearAllTimers()
        setGameState("setup")
        setUserInput("")
        setCurrentCharIndex(0)
        setStartTime(0)
        setCurrentPassage("")
        setTimeLeft(timeLimit)
        setCountdown(3)
        setStats({
            wpm: 0,
            accuracy: 0,
            correctChars: 0,
            incorrectChars: 0,
            totalChars: 0,
        })
    }

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (gameState !== "typing") return

        const value = e.target.value
        setUserInput(value)
        setCurrentCharIndex(value.length)

        const timeElapsed = (Date.now() - startTime) / 1000 // seconds
        const newStats = calculateStats(value, currentPassage, timeElapsed)
        setStats(newStats)

        // Check if test is complete
        if (value.length >= currentPassage.length) {
            clearAllTimers()
            setGameState("finished")
            await saveTestResult(newStats)
        }
    }

    const renderPassageText = useMemo(() => {
        return currentPassage.split("").map((char, index) => {
            const isTyped = index < userInput.length
            const isCurrent = index === currentCharIndex
            const isCorrect = isTyped && userInput[index] === char
            const isIncorrect = isTyped && userInput[index] !== char

            let className = "relative transition-colors duration-75 ease-out"

            if (isTyped) {
                if (isCorrect) {
                    // Correct characters - subtle green tint
                    className += " text-emerald-600 dark:text-emerald-500"
                } else {
                    // Incorrect characters - red with background
                    className += " text-red-600 dark:text-red-500 bg-red-500/20 dark:bg-red-400/20 rounded-sm"
                }
            } else {
                // Untyped characters - much more visible
                className += " text-gray-700 dark:text-gray-500"
            }

            return (
                <span key={index} className={className}>
                    {/* Typing cursor - vertical line that blinks */}
                    {isCurrent && (
                        <motion.span
                            className="absolute -left-0.5 top-0 w-0.5 h-full bg-yellow-500 dark:bg-yellow-400 rounded-full"
                            initial={{ opacity: 1 }}
                            animate={{
                                opacity: [1, 1, 0, 0],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    )}
                    {char}
                </span>
            )
        })
    }, [currentPassage, userInput, currentCharIndex])

    const saveTestResult = async (finalStats: TypingStats) => {
        try {
            const res = await axios.post("/api/typing-test", {
                wpm: finalStats.wpm,
                accuracy: finalStats.accuracy,
                timeLimit,
                passageType,
            })
            if (!res.data?.success) {
                console.log("error");
            }
        }
        catch (error) {
            console.log("Error saving test result:", error);
        }
    }

    const finishTest = async () => {
        clearAllTimers()
        setGameState("finished")

        // Save results to database
        await saveTestResult(stats)
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAllTimers()
        }
    }, [clearAllTimers])

    // Update timeLeft when timeLimit changes
    useEffect(() => {
        if (gameState === "setup") {
            setTimeLeft(timeLimit)
        }
        if (gameState === "finished") {
            finishTest()
        }
    }, [timeLimit, gameState])

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
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
                        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                            <Home className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </div>
                </div>
            </motion.header>

            <main className="flex-1 container mx-auto px-6 py-8 max-w-[85vw] w-full">
                <AnimatePresence mode="wait">
                    {gameState === "setup" && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                                    <h2 className="text-3xl font-bold text-balance">Ready to Test Your Speed?</h2>
                                    <p className="text-muted-foreground text-lg">Configure your typing test and show your skills</p>
                                </motion.div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                {/* Time Selection */}
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                    <Card className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-primary" />
                                                <h3 className="font-semibold">Time Limit</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant={timeLimit === 30 ? "default" : "outline"}
                                                    onClick={() => setTimeLimit(30)}
                                                    className="h-12"
                                                >
                                                    30 seconds
                                                </Button>
                                                <Button
                                                    variant={timeLimit === 60 ? "default" : "outline"}
                                                    onClick={() => setTimeLimit(60)}
                                                    className="h-12"
                                                >
                                                    60 seconds
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* Passage Type Selection */}
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                    <Card className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-5 h-5 text-accent" />
                                                <h3 className="font-semibold">Content Type</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant={passageType === "text" ? "default" : "outline"}
                                                    onClick={() => setPassageType("text")}
                                                    className="h-12"
                                                >
                                                    Text
                                                </Button>
                                                <Button
                                                    variant={passageType === "code" ? "default" : "outline"}
                                                    // onClick={() => setPassageType("code")}
                                                    disabled
                                                    className="h-12"
                                                >
                                                    Code (coming soon)
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-center"
                            >
                                <Button onClick={startTest} size="lg" className="px-8 py-3 text-lg">
                                    <Zap className="w-5 h-5 mr-2" />
                                    Start Test
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}

                    {gameState === "countdown" && (
                        <motion.div
                            key="countdown"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
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
                                        "w-full max-w-full min-h-[55vh] grid place-items-center mb-8 p-6 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 cursor-text transition-colors",
                                        passageType === "code" && "font-mono",
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
                        </motion.div>
                    )}

                    {gameState === "finished" && (
                        <motion.div
                            key="finished"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                                    <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold">Test Complete!</h2>
                                    <p className="text-muted-foreground">Here are your results</p>
                                </motion.div>
                            </div>

                            {/* Results */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                        <div className="text-3xl font-bold text-primary mb-2">{stats.wpm}</div>
                                        <div className="text-sm text-muted-foreground">Words per Minute</div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <Card className="p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                                        <div className="text-3xl font-bold text-accent mb-2">{stats.accuracy}%</div>
                                        <div className="text-sm text-muted-foreground">Accuracy</div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <Card className="p-6 text-center">
                                        <div className="text-3xl font-bold text-green-500 mb-2">{stats.correctChars}</div>
                                        <div className="text-sm text-muted-foreground">Correct Characters</div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                    <Card className="p-6 text-center">
                                        <div className="text-3xl font-bold text-destructive mb-2">{stats.incorrectChars}</div>
                                        <div className="text-sm text-muted-foreground">Incorrect Characters</div>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Performance Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center"
                            >
                                <Badge variant="secondary" className="text-lg px-4 py-2">
                                    {stats.wpm >= 80
                                        ? "🔥 Speed Demon!"
                                        : stats.wpm >= 60
                                            ? "⚡ Fast Typer!"
                                            : stats.wpm >= 40
                                                ? "👍 Good Job!"
                                                : "💪 Keep Practicing!"}
                                </Badge>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex justify-center gap-4"
                            >
                                <Button onClick={resetTest} variant="outline" size="lg">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button onClick={() => window.history.back()} size="lg">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}