import React, { createContext, useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API } from '@/utils/api'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useColorScheme } from '@/hooks/use-color-scheme'

export const AppDataContext = createContext({});

export function AppDataProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [userLocation, setUserLocation] = useState([]);
    const [userFlags, setUserFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    // Flag to disable entry/mount animations across the app
    const [disableEntryAnimations] = useState(true);

    // Theme preference: 'system' | 'light' | 'dark'
    const [themePreference, setThemePreference] = useState('system');

    const systemScheme = useColorScheme();

    const effectiveScheme = themePreference === 'system' ? systemScheme : themePreference;

    const fetchAll = useCallback(async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (!storedUser) {
                setUser(null);
                setUserInfo(null);
                setUserLocation([]);
                setUserFlags([]);
                return;
            }

            const parsed = JSON.parse(storedUser);
            setUser(parsed);

            try {
                const infoRes = await API.get(`/api/user_info/${parsed.id}`);
                setUserInfo(infoRes);
            } catch (e) {
                console.log('fetch userInfo error', e);
            }

            try {
                const locRes = await API.get('/api/locations');
                setUserLocation(locRes);
            } catch (e) {
                console.log('fetch locations error', e);
            }

            try {
                const flagsRes = await API.get(`/api/flags/${parsed.id}`);
                setUserFlags(flagsRes?.flags || []);
            } catch (e) {
                console.log('fetch flags error', e);
            }

            // load theme preference
            try {
                const t = await AsyncStorage.getItem('theme_pref');
                if (t) setThemePreference(t);
            } catch (e) {
                console.log('load theme pref error', e);
            }

        } catch (e) {
            console.log('app data load error', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Customize themes so card backgrounds match app design
    const darkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            card: '#0a0f1a',
        },
    }

    const lightTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            card: '#f8fafc',
        },
    }

    return (
        <AppDataContext.Provider
            value={{
                user,
                setUser,
                userInfo,
                setUserInfo,
                userLocation,
                setUserLocation,
                userFlags,
                setUserFlags,
                disableEntryAnimations,
                loading,
                refreshAppData: fetchAll,
                themePreference,
                setThemePreference: async (pref) => {
                    try {
                        await AsyncStorage.setItem('theme_pref', pref);
                        setThemePreference(pref);
                    } catch (e) {
                        console.log('save theme pref error', e);
                    }
                },
            }}
        >
            <ThemeProvider value={effectiveScheme === 'dark' ? darkTheme : lightTheme}>
                {children}
            </ThemeProvider>
        </AppDataContext.Provider>
    );
}

export default AppDataProvider;