"use client";
import { useUser } from "../context/UserContext"; // Adjust the import path as needed

export default function Header() {
    const { user, loading } = useUser(); // Access the user and loading state from UserContext

    return (
        <header className="h-16 bg-white flex items-center justify-between px-6 shadow">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <img
                        src={user?.avatar_url || "https://via.placeholder.com/150"} // Use avatar_url if available
                        alt="User Profile"
                        className="h-8 w-8 rounded-full"
                    />
                    <span className="font-medium text-gray-700">
                        {loading ? "Loading..." : user ? `${user.firstName} ${user.lastName}` : "Guest"}
                    </span>
                </div>
            </div>
        </header>
    );
}
