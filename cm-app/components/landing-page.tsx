"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navigation/navbar"
import { Users, Timer, ArrowRight, Play, Sparkles, Gauge } from "lucide-react"
import Link from "next/link"
import SplitText from "@/components/split-text"

export function LandingPage() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    }

    const floatingVariants: Variants = {
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
            },
        },
    }

    const rotatingVariants: Variants = {
        animate: {
            rotate: [0, 360],
            transition: {
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
            },
        },
    }

    const pulseVariants: Variants = {
        animate: {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            transition: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
            },
        },
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0">
                {/* Primary gradient orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-accent/30 via-accent/20 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-r from-primary/25 via-transparent to-accent/25 rounded-full blur-3xl animate-pulse" />

                {/* Additional gradient layers for depth */}
                <div
                    className="absolute top-1/3 right-0 w-72 h-72 bg-gradient-to-bl from-primary/15 via-accent/10 to-transparent rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
                <div
                    className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-to-tr from-accent/20 via-primary/15 to-transparent rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                />

                {/* Mesh gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <div className="absolute inset-0 bg-gradient-to-tl from-accent/5 via-transparent to-primary/5" />
            </div>

            {/* Geometric floating elements */}
            <motion.div variants={floatingVariants} animate="animate" className="absolute top-32 right-20 hidden lg:block">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/40 rounded-2xl backdrop-blur-sm border border-primary/20 shadow-xl" />
            </motion.div>

            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-64 left-20 hidden lg:block"
                style={{ animationDelay: "0.5s" }}
            >
                <div className="w-16 h-16 bg-gradient-to-tr from-accent/20 to-primary/40 rounded-full backdrop-blur-sm border border-accent/20 shadow-xl" />
            </motion.div>

            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute bottom-40 left-10 hidden lg:block"
                style={{ animationDelay: "1s" }}
            >
                <div className="w-24 h-24 bg-gradient-to-bl from-primary/20 to-accent/40 rounded-xl backdrop-blur-sm border border-primary/15 shadow-xl" />
            </motion.div>

            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute bottom-80 right-16 hidden lg:block"
                style={{ animationDelay: "1.5s" }}
            >
                <div className="w-18 h-18 bg-gradient-to-tl from-accent/20 to-primary/40 rounded-2xl backdrop-blur-sm border border-accent/15 shadow-xl" />
            </motion.div>

            <motion.div variants={rotatingVariants} animate="animate" className="absolute top-1/4 left-1/2 hidden xl:block">
                <div className="w-12 h-12 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg backdrop-blur-sm border border-primary/10 shadow-lg" />
            </motion.div>

            <motion.div
                variants={rotatingVariants}
                animate="animate"
                className="absolute bottom-1/4 right-1/3 hidden xl:block"
                style={{ animationDelay: "10s" }}
            >
                <div className="w-14 h-14 bg-gradient-to-l from-accent/30 to-primary/30 rounded-full backdrop-blur-sm border border-accent/10 shadow-lg" />
            </motion.div>

            <motion.div variants={pulseVariants} animate="animate" className="absolute top-1/2 right-1/4 hidden lg:block">
                <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
            </motion.div>

            <motion.div
                variants={pulseVariants}
                animate="animate"
                className="absolute bottom-1/2 left-10 hidden lg:block"
                style={{ animationDelay: "1.5s" }}
            >
                <div className="w-28 h-28 bg-gradient-to-tl from-accent/20 to-primary/20 rounded-full blur-xl" />
            </motion.div>

            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.5)_1px,_transparent_0)] bg-[length:50px_50px]" />

            <div className="flex w-full fixed top-0 justify-center z-50">
                <Navbar />
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pt-24">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 md:pt-20 md:pb-10 pt-10 pb-5 text-center">
                    <motion.div variants={itemVariants} className="mb-12">
                        <Badge
                            variant="secondary"
                            className="mb-8 px-6 py-3 text-sm bg-primary/10 text-foreground border-primary/20"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            The Ultimate Typing Arena
                        </Badge>

                        <h1 className="text-6xl md:text-9xl flex flex-col gap-y-5 font-black mb-8 h-full leading-none tracking-tight">
                            <motion.span
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                                className="block text-foreground"
                            >
                                Type.
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                                className="block text-foreground"
                            >
                                Compete.
                            </motion.span>
                            <SplitText
                                text="Dominate. "
                                className="block text-accent"
                                delay={300}
                                duration={0.8}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                                onLetterAnimationComplete={() => { }}
                            />
                        </h1>

                        <p className="text-lg md:text-xl pt-16 text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
                            The most competitive typing platform where milliseconds matter and every keystroke counts. Join elite
                            typists in real-time battles and prove your supremacy.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                        <Button
                            asChild
                            size="lg"
                            className="text-xl px-12 py-8 h-auto rounded-xl bg-gradient-to-r from-primary to-primary/90 border-2 border-primary/20 hover:border-primary/40 backdrop-blur-sm"
                        >
                            <Link href="/typing-test">
                                <Play className="w-6 h-6 mr-3" />
                                Start Test
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="text-lg px-10 py-8 h-auto rounded-xl border-2 border-primary/20 hover:border-primary/40 bg-background/50 backdrop-blur-sm"
                        >
                            <Link href="/room">
                                <Users className="w-6 h-6 mr-3" />
                                Join Room
                                <ArrowRight className="w-5 h-5 ml-3" />
                            </Link>
                        </Button>
                    </motion.div>
                </section>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="">
                {/* CTA Section */}
                <section className="max-w-7xl mx-auto px-6">
                    <motion.div variants={itemVariants}>
                        <Card className="p-16 text-center bg-gradient-to-br from-primary/10 via-background/50 to-accent/10 backdrop-blur-xl border-primary/20 rounded-3xl">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <Timer className="w-12 h-12 text-primary-foreground" />
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black mb-8 text-foreground">Ready to Compete?</h2>
                            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                                Join the elite community of competitive typists and discover your true potential.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Button
                                    asChild
                                    size="lg"
                                    className="text-xl px-12 py-8 h-auto rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-xl hover:shadow-2xl"
                                >
                                    <Link href="/dashboard">
                                        <Gauge className="w-6 h-6 mr-3" />
                                        Enter Arena
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="text-xl px-12 py-8 h-auto rounded-xl border-2 border-primary/20 hover:border-primary/40 bg-background/50 backdrop-blur-sm"
                                >
                                    <Link href="/typing-test">
                                        <Play className="w-6 h-6 mr-3" />
                                        Quick Test
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </section>
            </motion.div>

            {/* Footer */}
            <footer className="border-t border-border/30 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 pt-12 pb-2 text-center">
                    <p className="text-muted-foreground text-sm">&copy; 2025 Compete Monkey.</p>
                </div>
            </footer>
        </div>
    )
}
