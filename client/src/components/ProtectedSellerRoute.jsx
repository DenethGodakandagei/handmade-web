
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '@/components/ui/Spinner';

const ProtectedSellerRoute = ({ children }) => {
    const { isAuthenticated, user, fetchMe } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (isAuthenticated) {
                 await fetchMe();
            }
            setIsChecking(false);
        };
        checkStatus();
    }, [isAuthenticated, fetchMe]);

    if (isChecking) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <Spinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Strict check: must be a seller AND approved
    if (!user || user.sellerRequestStatus !== 'approved') {
        return <Navigate to="/artisans/apply" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedSellerRoute;
