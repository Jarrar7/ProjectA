"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// Create the UserContext
const UserContext = createContext();

// Hook to use the UserContext
export const useUser = () => {
    return useContext(UserContext);
};

// Provider Component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // User data
    const [loading, setLoading] = useState(true); // Loading state
    const router = useRouter();

    useEffect(() => {
        // Function to fetch the user's session and profile
        const fetchUser = async () => {
            setLoading(true);

            // Fetch session from Supabase
            const { data: session, error: sessionError } = await supabase.auth.getSession();

            if (session?.session) {
                // Fetch user profile from `profiles` table
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.session.user.id)
                    .single();

                if (profile && !profileError) {
                    setUser({ ...session.session.user, ...profile });
                } else {
                    console.error("Failed to fetch user profile:", profileError);
                }
            } else if (sessionError) {
                console.error("Failed to fetch session:", sessionError);
            }

            setLoading(false);
        };

        fetchUser();

        // Listen to authentication state changes
        const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth event:", event);
            console.log("Session data:", session);


            if (session) {
                // User signed in, fetch profile
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (profile && !error) {
                    setUser({ ...session.user, ...profile });
                } else {
                    console.error("Failed to fetch user profile during auth change:", error);
                }
            } else if (event === "SIGNED_OUT") {
                // User signed out, reset user state
                setUser(null);
                router.push("/");
            }
        });

        // Cleanup listener on unmount
        return () => {
            subscription?.unsubscribe?.();
        };
    }, [router]);

    // Logout function
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/");
    };

    // Provide context to children
    return (
        <UserContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
};
