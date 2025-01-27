"use client";
import React from "react";
import { UserProvider } from "./context/UserContext";

export default function ClientLayout({ children }) {
    return <UserProvider>{children}</UserProvider>;
}
