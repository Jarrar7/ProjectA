"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // User data
    const [loading, setLoading] = useState(true); // Loading state
    const router = useRouter();

    // **First useEffect: Fetch user on initial load**
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);

                // Fetch session from Supabase
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                console.log("Session on app load:", session);

                if (session) {
                    // Fetch user profile from `profiles` table
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", session.user.id)
                        .single();

                    if (profile && !profileError) {
                        const userData = { ...session.user, ...profile };
                        setUser(userData);
                        console.log("User after profile fetch:", userData);
                    } else {
                        console.error("Failed to fetch user profile:", profileError);
                    }
                } else if (sessionError) {
                    console.error("Failed to fetch session:", sessionError);
                }
            } catch (error) {
                console.error("Error in fetchUser:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); // Empty dependency array ensures this runs once on mount

    // **Second useEffect: Listen for auth state changes**
    useEffect(() => {
        // Listen to authentication state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session);

            if (session && session.user) {
                try {
                    // Fetch user profile from `profiles` table
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", session.user.id)
                        .single();

                    if (profile && !profileError) {
                        const userData = { ...session.user, ...profile };
                        setUser(userData);
                        console.log("User after auth state change:", userData);
                    } else {
                        console.error("Failed to fetch user profile during auth change:", profileError);
                    }
                } catch (error) {
                    console.error("Error during auth state change:", error);
                }
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                router.push("/"); // Redirect to login page
            }
        });

        console.log("Subscription initialized:", subscription);

        // Cleanup listener on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    // **Logout function remains the same**
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            console.log("User has been logged out successfully");
            setUser(null);
            router.push("/"); // Redirect to login page
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    // Provide context to children
    return (
        <UserContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
};
