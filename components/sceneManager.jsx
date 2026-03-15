import React, { useState } from "react"
import AppTour from "./mascotScenes/appTour"

export default function SceneManager({ scene, user }) {
    const [currentScene, setCurrentScene] = useState(scene)

    if (currentScene === "appTour") {
        return <AppTour user={user} onFinish={() => setCurrentScene(null)} />
    }

    return null
}