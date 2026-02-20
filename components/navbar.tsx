import Link from "next/link";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="shrink-0">
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                        eco<span className="text-rose-500">match</span>
                    </span>
                </Link>

                {/* Center nav */}
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

                {/* Right */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href="/signin"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/list-space"
                        className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Get started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
