"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useEffect, useState } from "react";

const withRoleProtection = (Component, allowedRoles) => {
    const RoleProtectedComponent = (props) => {
        const { user, loading } = useUser();
        const router = useRouter();
        const [hasRedirected, setHasRedirected] = useState(false);

        useEffect(() => {
            if (!loading && !hasRedirected) {
                if (!user) {
                    console.log("User not logged in, redirecting to login");
                    router.push("/");
                    setHasRedirected(true);
                } else if (!allowedRoles.includes(user.role)) {
                    console.log("Unauthorized access, redirecting to /unauthorized");
                    router.push("/unauthorized");
                    setHasRedirected(true);
                }
            }
        }, [user, loading, router, hasRedirected]);

        // Render nothing while loading or user access is being validated
        if (loading || !user || !allowedRoles.includes(user.role)) {
            return null;
        }

        // Render the protected component if the user has access
        return <Component {...props} />;
    };

    return RoleProtectedComponent;
};

export default withRoleProtection;
