"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";

export default function Header() {
    const { user, loading } = useUser();
    const [photoUrl, setPhotoUrl] = useState("");
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.classList.add(savedTheme);
    }, []);

    useEffect(() => {
        const fetchPhotoUrl = async () => {
            if (user?.photo_url) {
                try {
                    const { data } = await supabase.storage
                        .from("student-photos")
                        .createSignedUrl(user.photo_url, 3600);
                    setPhotoUrl(data?.signedUrl || "");
                } catch (error) {
                    console.error("Error fetching photo URL:", error.message);
                }
            } else {
                try {
                    const { data } = await supabase.storage
                        .from("student-photos")
                        .createSignedUrl("placeHolder/avatarPlaceHolder.png", 3600);
                    setPhotoUrl(data?.signedUrl || "");
                } catch (error) {
                    console.error("Error fetching placeholder photo URL:", error.message);
                }
            }
        };

        fetchPhotoUrl();
    }, [user?.photo_url]);

    // Dark Mode Toggle
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newTheme);
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-800 flex items-center justify-center md:justify-between px-6 shadow">
            {/* User Profile (Centered on Mobile, Left on Desktop) */}
            <div className="flex items-center space-x-2">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        <img
                            src={photoUrl}
                            alt="User Profile"
                            className="h-12 w-12 rounded-full border dark:border-gray-700"
                        />
                        <span className="font-medium text-gray-700 dark:text-white hidden md:inline">
                            {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                        </span>
                    </>
                )}
            </div>

            {/* Dark Mode Toggle (Right Side) */}
            <button
                onClick={toggleTheme}
                className="px-3 py-1 border rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white absolute right-6 md:relative"
            >
                {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
            </button>
        </header>
    );


}
