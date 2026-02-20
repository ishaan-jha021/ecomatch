"use client"

import { useState, useEffect } from "react";

export function SplashScreen() {
    const [phase, setPhase] = useState<"logo" | "tagline" | "exit">("logo");
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase("tagline"), 600);
        const t2 = setTimeout(() => setPhase("exit"), 2200);
        const t3 = setTimeout(() => setVisible(false), 2900);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center transition-all duration-700 ${phase === "exit" ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
                }`}
        >
            {/* Logo */}
            <div className={`transition-all duration-700 ease-out ${phase === "logo" ? "scale-90 opacity-0" : "scale-100 opacity-100"
                }`}>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    eco<span className="text-rose-500">match</span>
                </h1>
            </div>

            {/* Tagline */}
            <p className={`mt-3 text-sm md:text-base text-gray-400 tracking-wide transition-all duration-700 delay-200 ${phase === "tagline" || phase === "exit" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}>
                Where founders find their launchpad
            </p>

            {/* Smooth bouncing dots */}
            <div className={`flex gap-2 mt-8 transition-all duration-500 delay-300 ${phase === "tagline" ? "opacity-100" : "opacity-0"
                }`}>
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="block h-2 w-2 rounded-full"
                        style={{
                            backgroundColor: `hsl(${350 + i * 8}, 80%, ${60 + i * 5}%)`,
                            animation: "dotBounce 1.4s ease-in-out infinite",
                            animationDelay: `${i * 160}ms`,
                        }}
                    />
                ))}
            </div>

            {/* Keyframes injected via style tag */}
            <style jsx>{`
                @keyframes dotBounce {
                    0%, 80%, 100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.4;
                    }
                    40% {
                        transform: translateY(-12px) scale(1.3);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
