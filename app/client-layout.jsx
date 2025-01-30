"use client";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./context/UserContext";

export default function ClientLayout({ children }) {
    return (
        <UserProvider>
            <ToastContainer position="top-right" autoClose={3000} />
            {children}
        </UserProvider>
    );
}
