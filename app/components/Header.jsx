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
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <svg
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.438L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                </button>
            </div>
        </header>
    );
}
