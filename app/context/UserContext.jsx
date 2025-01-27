"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    const fetchUser = async () => {
        setLoading(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.session.user.id)
                    .single();
                setUser({ ...session.session.user, ...profile });
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Error fetching user:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();

        const { subscription } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => subscription?.unsubscribe();
    }, [router]);

    const logout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            router.push("/");
        } catch (err) {
            console.error("Logout error:", err.message);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
};
