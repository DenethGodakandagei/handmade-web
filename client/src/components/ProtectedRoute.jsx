
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '@/components/ui/Spinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, fetchMe, logout } = useAuth();
    const [isChecking, setIsChecking] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const verifySession = async () => {
            if (isAuthenticated) {
                try {
                    await fetchMe();
                } catch (error) {
                    console.error("Session verification failed", error);
                    logout();
                }
            }
            setIsChecking(false);
        };

        verifySession();
    }, [isAuthenticated, fetchMe, logout]);

    if (isChecking) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-white">
                <Spinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login, but save the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
