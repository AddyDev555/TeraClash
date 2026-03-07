const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function apiRequest(endpoint, method = "GET", data = null, token = null) {
    try {
        const config = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "API request failed");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export const API = {
    get: (endpoint, token) => apiRequest(endpoint, "GET", null, token),
    post: (endpoint, data, token) => apiRequest(endpoint, "POST", data, token),
    put: (endpoint, data, token) => apiRequest(endpoint, "PUT", data, token),
    delete: (endpoint, token) => apiRequest(endpoint, "DELETE", null, token),
};