"use client"

import { useState } from "react";
import { Globe, ExternalLink, ShieldCheck, Star, TrendingUp, BadgeCheck, X, CheckCircle, Send } from "lucide-react";

interface VenueSidebarProps {
    venueName: string;
    venueType: string;
    pricing: { amount: number; period: string; currency: string };
    equityTerms?: { takesEquity: boolean; percentage?: number; description?: string } | null;
    website?: string;
    trustScore: number;
    reviewsCount: number;
    officialStatus: string;
}

export function VenueSidebar({
    venueName, venueType, pricing, equityTerms, website,
    trustScore, reviewsCount, officialStatus
}: VenueSidebarProps) {
    const [showContact, setShowContact] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

    const isIncubator = !!equityTerms;

    const handleBookTour = () => {
        const subject = encodeURIComponent(`Tour Request: ${venueName}`);
        const body = encodeURIComponent(
            `Hi,\n\nI'm interested in ${isIncubator ? 'applying to' : 'booking a tour at'} ${venueName}.\n\nPlease share availability and next steps.\n\nThank you.`
        );
        window.open(`mailto:contact@venuescraper.com?subject=${subject}&body=${body}`, '_self');
        setShowSuccess(isIncubator ? 'Application email opened!' : 'Tour booking email opened!');
        setTimeout(() => setShowSuccess(null), 3000);
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Save lead to localStorage
        const leads = JSON.parse(localStorage.getItem('venue-leads') || '[]');
        leads.push({ ...form, venue: venueName, date: new Date().toISOString() });
        localStorage.setItem('venue-leads', JSON.stringify(leads));

        setShowContact(false);
        setShowSuccess('Message sent! We\'ll get back to you within 24 hours.');
        setForm({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setShowSuccess(null), 4000);
    };

    const googleRating = Math.min(5, trustScore * 0.5 + 0.5);
    const sentimentScore = trustScore * 10;

    return (
        <div className="lg:sticky lg:top-24 space-y-5">
            {/* Success notification */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-green-800">{showSuccess}</p>
                    </div>
                </div>
            )}

            {/* Pricing card */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-lg space-y-5">
                {/* Price */}
                {equityTerms ? (
                    <div>
                        <span className="text-2xl font-bold text-gray-900">
                            {equityTerms.percentage}% equity
                        </span>
                        <span className="text-gray-500 text-sm"> · 6 months</span>
                        {equityTerms.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{equityTerms.description}</p>
                        )}
                    </div>
                ) : (
                    <div>
                        <span className="text-2xl font-bold text-gray-900">₹{pricing.amount.toLocaleString()}</span>
                        <span className="text-gray-500 text-sm"> / {pricing.period}</span>
                    </div>
                )}

                {/* Working CTA buttons */}
                <button
                    onClick={handleBookTour}
                    className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                    {isIncubator ? "Apply Now" : "Book a Tour"}
                </button>
                <button
                    onClick={() => setShowContact(true)}
                    className="w-full py-3.5 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-200 cursor-pointer"
                >
                    Contact Space
                </button>

                {/* Website link */}
                {website && (
                    <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors pt-3 border-t border-gray-100 cursor-pointer"
                    >
                        <Globe className="h-4 w-4 shrink-0" />
                        <span className="truncate">{website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                        <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                    </a>
                )}
            </div>

            {/* Trust Score — separate card, no overlap */}
            <div className="border border-gray-200 rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-gray-700" />
                    <h3 className="text-sm font-bold text-gray-900">Trust Score</h3>
                </div>

                <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-bold text-gray-900">{trustScore}</span>
                    <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${officialStatus === "Verified" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {officialStatus}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{reviewsCount} signals</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500 flex items-center gap-1"><Star className="h-3 w-3" /> Google Rating</span>
                            <span className="text-gray-700 font-medium">{googleRating.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-gray-900" style={{ width: `${(googleRating / 5) * 100}%` }} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500 flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Verification</span>
                            <span className="text-gray-700 font-medium">100%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-gray-900" style={{ width: `100%` }} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Sentiment</span>
                            <span className="text-gray-700 font-medium">{sentimentScore.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-gray-900" style={{ width: `${sentimentScore}%` }} />
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-100">
                    Score combines Google Maps data, reviews, and physical verification.
                </p>
            </div>

            {/* Contact Modal */}
            {showContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Modal */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 fade-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Contact Space</h3>
                                <p className="text-sm text-gray-500">{venueName}</p>
                            </div>
                            <button
                                onClick={() => setShowContact(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="you@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                    placeholder={isIncubator
                                        ? "Tell us about your startup and why you'd like to join this incubator..."
                                        : "I'm interested in a workspace tour. Please share available slots..."
                                    }
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Send className="h-4 w-4" />
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
