"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext"; // Adjust the path if needed

const withRoleBasedRedirect = (Component) => {
    const RoleBasedRedirect = (props) => {
        const { user, loading } = useUser(); // Access user and loading state
        const router = useRouter();

        useEffect(() => {
            if (!loading) {
                if (user) {
                    const role = user?.role;
                    if (role === "student") {
                        router.push("/student");
                    } else if (role === "teacher") {
                        router.push("/teacher");
                    } else if (role === "admin") {
                        router.push("/administration");
                    } else {
                        console.error("Unknown or invalid role:", role);
                    }
                } else {
                    console.log("No user logged in");
                }
            }
        }, [user, loading, router]);


        if (loading) {
            return <div>Loading...</div>; // Show loading spinner or placeholder
        }

        return user ? null : <Component {...props} />;
    };

    return RoleBasedRedirect;
};

export default withRoleBasedRedirect;
