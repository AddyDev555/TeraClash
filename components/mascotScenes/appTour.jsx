import React, { useState } from "react"
import Mascot from "../mascot"

export default function AppTour({ onFinish, user }) {
    const steps = [
    {
        mood: "hi",
        message: `Hello ${user.first_name} ${user.last_name} 👋 Welcome to the TeraClash Arena!`,
        highlight: null
    },
    {
        mood: "normal",
        message: "Let's have a quick tour of the App!",
        highlight: null 
    },
    {
        mood: "builder",
        message: "I Tracks Daily Steps, KM Walked, and Calories. 🏃‍♂️",
        highlight: { x: 20, y: 95, width: 320, height: 38, borderColor: 'cyan' }
    },
    {
        mood: "charm",
        message: "Collect Sweats to unlock Powerups, Arenas and more! 💪",
        highlight: { x: 20, y: 200, width: 180, height: 55, borderColor: 'cyan' }
    },
    {
        mood: "normal",
        message: "Shop for powerups from the Store using sweats! 🛒",
        highlight: { x: 20, y: 200, width: 180, height: 55, borderColor: 'cyan' }
    }
]

    const [step, setStep] = useState(0)

    const next = () => setStep(current => Math.min(current + 1, steps.length - 1))
    const prev = () => setStep(current => Math.max(current - 1, 0))

    return (
        <Mascot
            mood={steps[step].mood}
            message={steps[step].message}
            highlight={steps[step].highlight}
            onNext={next}
            onPrev={prev}
            onEnd={onFinish}
            isFirst={step === 0}
            isLast={step === steps.length - 1}
        />
    )
}