"use client"

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { CheckCircle2, Send, Building2 } from "lucide-react";

export default function ListSpacePage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        venueName: "",
        venueType: "coworking",
        city: "",
        message: "",
    });

    const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) setSubmitted(true);
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <main className="pt-16 flex items-center justify-center min-h-screen px-4">
                    <div className="text-center space-y-5 max-w-md">
                        <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-gray-900">You're in! 🎉</h1>
                        <p className="text-gray-500">
                            We've received your listing request for <strong className="text-gray-900">{form.venueName}</strong>. We'll reach out to <strong className="text-gray-900">{form.email}</strong> within 24 hours.
                        </p>
                        <a href="/search" className="inline-block px-6 py-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors">
                            Browse Spaces
                        </a>
                    </div>
                </main>
            </div>
        );
    }

    const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all";

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-24 pb-20 container mx-auto px-4 max-w-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                        List your space on ecomatch
                    </h1>
                    <p className="text-gray-500">
                        Get discovered by thousands of startup founders. Free to list.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-gray-900">Your details</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} />
                            <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" className={inputClass} />
                        </div>
                        <input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" className={inputClass} />
                    </div>

                    <hr />

                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-gray-900">Space details</p>
                        <input required value={form.venueName} onChange={(e) => update("venueName", e.target.value)} placeholder="Space name" className={inputClass} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <select value={form.venueType} onChange={(e) => update("venueType", e.target.value)} className={inputClass + " cursor-pointer"}>
                                <option value="coworking">Co-Working Space</option>
                                <option value="incubator">Incubator</option>
                                <option value="accelerator">Accelerator</option>
                            </select>
                            <input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City" className={inputClass} />
                        </div>

                        <textarea
                            value={form.message}
                            onChange={(e) => update("message", e.target.value)}
                            placeholder="Tell us about your space (optional)"
                            rows={3}
                            className={inputClass + " resize-none"}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit listing"}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        We'll verify your space and add it within 48 hours.
                    </p>
                </form>
            </main>
        </div>
    );
}
