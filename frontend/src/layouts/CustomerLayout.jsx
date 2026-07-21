import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from '../components/customer/CustomerNavbar';
import CustomerFooter from '../components/customer/CustomerFooter';
import SplashScreen from '../components/customer/SplashScreen';

export default function CustomerLayout() {
    // Show splash only once per session tab
    const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('ab_splash_seen'));

    const handleSplashComplete = () => {
        sessionStorage.setItem('ab_splash_seen', '1');
        setShowSplash(false);
    };

    return (
        <>
            {showSplash && (
                <SplashScreen onComplete={handleSplashComplete} />
            )}
            <div className="min-h-screen flex flex-col">
                <CustomerNavbar />
                <main className="flex-1">
                    <Outlet />
                </main>
                <CustomerFooter />
            </div>
        </>
    );
}

