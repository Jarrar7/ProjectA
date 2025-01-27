"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../context/UserContext"; // Adjust the import path as needed

export default function Header() {
    const { user, loading } = useUser(); // Access the user and loading state from UserContext
    const [photoUrl, setPhotoUrl] = useState(""); // Default to placeholder image

    useEffect(() => {
        const fetchPhotoUrl = async () => {
            if (user?.photo_url) {
                try {
                    // Generate a signed URL for the user's photo in the private bucket
                    const { data, error } = await supabase.storage
                        .from("student-photos")
                        .createSignedUrl(user.photo_url, 3600); // URL valid for 1 hour

                    if (data?.signedUrl) {
                        setPhotoUrl(data.signedUrl); // Use the signed URL
                    } else {
                        console.error("Error generating signed URL:", error?.message);
                    }
                } catch (error) {
                    console.error("Error fetching photo URL:", error.message);
                }
            } else {
                // If no photo_url, use the placeholder photo in the private bucket
                try {
                    const { data, error } = await supabase.storage
                        .from("student-photos")
                        .createSignedUrl("placeHolder/avatarPlaceHolder.png", 3600); // Placeholder image path

                    if (data?.signedUrl) {
                        setPhotoUrl(data.signedUrl); // Use the signed URL for the placeholder
                    } else {
                        console.error("Error generating signed URL for placeholder:", error?.message);
                    }
                } catch (error) {
                    console.error("Error fetching placeholder photo URL:", error.message);
                }
            }
        };

        fetchPhotoUrl();
    }, [user?.photo_url]);

    return (
        <header className="h-16 bg-white flex items-center justify-between px-6 shadow">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    {/* Show spinner if loading, otherwise show the user's profile image and name */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <>
                            <img
                                src={photoUrl} // Dynamically fetched signed URL or fallback to placeholder
                                alt="User Profile"
                                className="h-12 w-12 rounded-full" // Increased size
                            />
                            <span className="font-medium text-gray-700">
                                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </header>
    );

}
