"use client"

import { SplashScreen } from "@/components/splash-screen";

export function ClientShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SplashScreen />
            {children}
        </>
    );
}
