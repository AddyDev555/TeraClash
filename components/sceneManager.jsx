import React, { useEffect, useState } from "react"
import AppTour from "./mascotScenes/appTour"
import { API } from "@/utils/api";

export default function SceneManager({ userFlags, user }) {
    const [currentScene, setCurrentScene] = useState(null);

    useEffect(() => {
        if (userFlags?.mascot_status) {
            setCurrentScene(userFlags.mascot_status);
        }
    }, [userFlags]);

    const createFlags = async (mascotStatus) => {
        try {
            setCurrentScene(mascotStatus);
            const payload = {
                data: {
                    user_id: user.id,
                    mascot_status: mascotStatus
                }
            };
            const response = await API.post("/api/flags", payload);
            console.log("Success:", response);
        } catch (error) {
            console.error("Error creating flags:", error.message);
        }
    };

    if (currentScene === "appTour") {
        return <AppTour user={user} onFinish={() => createFlags("appTourDone")} />
    }

    return null
}