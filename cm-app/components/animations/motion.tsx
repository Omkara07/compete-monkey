"use client"

import { motion, AnimatePresence } from "framer-motion"
import React from "react"

type MotionFadeInProps = {
    children: React.ReactNode
    className?: string
    delay?: number
    from?: "up" | "down" | "left" | "right" | "none"
}

export function MotionFadeIn({ children, className, delay = 0, from = "up" }: MotionFadeInProps) {
    const offset = 16
    const initial =
        from === "up"
            ? { opacity: 0, y: offset }
            : from === "down"
                ? { opacity: 0, y: -offset }
                : from === "left"
                    ? { opacity: 0, x: offset }
                    : from === "right"
                        ? { opacity: 0, x: -offset }
                        : { opacity: 0 }

    return (
        <motion.div
            className={className}
            initial={initial}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut", delay }}
        >
            {children}
        </motion.div>
    )
}

type StaggerProps = {
    children: React.ReactNode
    className?: string
    delayChildren?: number
    staggerChildren?: number
}

export function MotionStagger({ children, className, delayChildren = 0.05, staggerChildren = 0.05 }: StaggerProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
                hidden: {},
                show: {
                    transition: { staggerChildren, delayChildren },
                },
            }}
        >
            {children}
        </motion.div>
    )
}

export function MotionItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35, ease: "easeOut", delay }}
        >
            {children}
        </motion.div>
    )
}

export const MotionPresence = AnimatePresence


