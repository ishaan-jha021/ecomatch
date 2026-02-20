"use client"

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="shrink-0">
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                        eco<span className="text-rose-500">match</span>
                    </span>
                </Link>

                {/* Center nav — desktop */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Explore
                    </Link>
                    <Link href="/search?type=coworking" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Co-working
                    </Link>
                    <Link href="/search?type=incubator" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Incubators
                    </Link>
                    <Link href="/list-space" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        List your space
                    </Link>
                </div>

                {/* Right — desktop */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href="/signin"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/list-space"
                        className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors hidden sm:block"
                    >
                        Get started
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 animate-fade-in-up">
                    <div className="flex flex-col gap-1 py-2">
                        <Link
                            href="/search"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/search?type=coworking"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Co-working
                        </Link>
                        <Link
                            href="/search?type=incubator"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Incubators
                        </Link>
                        <Link
                            href="/list-space"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            List your space
                        </Link>
                        <div className="h-px bg-gray-100 my-1" />
                        <Link
                            href="/signin"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/list-space"
                            onClick={() => setMobileOpen(false)}
                            className="mx-3 mt-1 text-sm font-medium bg-gray-900 text-white px-4 py-2.5 rounded-full hover:bg-gray-800 transition-colors text-center"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
