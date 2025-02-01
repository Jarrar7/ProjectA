"use client";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./context/UserContext";

export default function ClientLayout({ children }) {
    return (
        <UserProvider>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Main App Wrapper */}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all">
                {children}
            </div>
        </UserProvider>
    );
}
