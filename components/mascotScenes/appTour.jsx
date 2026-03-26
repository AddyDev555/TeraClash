import React, { useState } from "react"
import Mascot from "../mascot"

export default function AppTour({ onFinish, user }) {    
    const steps = [
    {
        mood: "hi",
        message: `Hello ${user.first_name} 👋 Welcome to the TeraClash`,
        highlight: null
    },
    {
        mood: "normal",
        message: "I Tracks Daily Steps, KM Walked, and Calories. 🏃‍♂️",
        highlight: { x: 20, y: 95, width: 320, height: 38, borderColor: 'cyan' }
    },
    {
        mood: "normal",
        message: "You'll see your conquered Arenas on the Map! 🗺️",
        highlight: { x: 20, y: 150, width: 320, height: 550, borderColor: 'cyan' }
    },
    {
        mood: "charm",
        message: "Collect Sweats to unlock Powerups, Arenas and more! 💪",
        highlight: { x: 200, y: 38, width: 40, height: 30, borderColor: 'cyan' }
    },
    {
        mood: "normal",
        message: "Shop for powerups from the Store using sweats! 🛒",
        highlight: { x: 253, y: 38, width: 40, height: 30, borderColor: 'cyan' }
    },
    {
        mood: "hii",
        message: "Manage your profile from the Profile Page!",
        highlight: { x: 300, y: 38, width: 35, height: 30, borderColor: 'cyan' }
    },
    {
        mood: "normal",
        message: "See in-depth stats and history from Analysis Page!",
        highlight: { x: 140, y: 720, width: 80, height: 35, borderColor: 'cyan' }
    },
    {
        mood: "normal",
        message: "Stay motivated to see yourself on the leaderboard page 🏆",
        highlight: { x: 255, y: 720, width: 80, height: 35, borderColor: 'cyan' }
    },
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