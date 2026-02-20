import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Venue } from "@/types";

interface ResultCardProps {
    venue: Venue;
}

export function ResultCard({ venue }: ResultCardProps) {
    return (
        <Link href={`/venue/${venue.id}`} className="block group">
            <div className="flex flex-col sm:flex-row rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 bg-white">
                {/* Image */}
                <div className="sm:w-72 shrink-0 relative overflow-hidden">
                    {venue.images && venue.images.length > 0 ? (
                        <img
                            src={venue.images[0]}
                            alt={venue.name}
                            className="h-52 sm:h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-52 sm:h-full w-full bg-gray-100 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-gray-300" />
                        </div>
                    )}

                    {/* Type pill */}
                    <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm capitalize">
                        {venue.type}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                        {/* Location */}
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                            {venue.location.area}, {venue.location.city}
                        </p>

                        {/* Name */}
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-2">
                            {venue.name}
                        </h3>

                        {/* Divider */}
                        <div className="w-8 h-px bg-gray-200 mb-3" />

                        {/* Features */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                            {venue.capacity && (
                                <span>{venue.capacity.available || venue.capacity.total}+ seats</span>
                            )}
                            {venue.amenities?.slice(0, 3).map((a) => (
                                <span key={a.id}>{a.name}</span>
                            ))}
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-end justify-between pt-2">
                        {/* Price */}
                        <div>
                            {venue.equityTerms ? (
                                <span className="text-base font-semibold text-gray-900">
                                    {venue.equityTerms.percentage === 0 ? "Zero Equity" : `${venue.equityTerms.percentage}% Equity`}
                                </span>
                            ) : (
                                <div>
                                    <span className="text-lg font-semibold text-gray-900">₹{venue.pricing.amount.toLocaleString()}</span>
                                    <span className="text-sm text-gray-400 font-normal"> / month</span>
                                </div>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-gray-900 text-gray-900" />
                            <span className="text-sm font-semibold text-gray-900">{venue.trustScore}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
