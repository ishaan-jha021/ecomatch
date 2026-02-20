import { Navbar } from "@/components/navbar";
import { getVenueById, getVenues } from "@/lib/db";
import { TrustScoreChart } from "@/components/trust-score-chart";
import { ImageGallery } from "@/components/image-gallery";
import { VenueSidebar } from "@/components/venue-sidebar";
import { MapPin, CheckCircle2, XCircle, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const venue = await getVenueById(id);

    if (!venue) return notFound();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-20 pb-16">
                {/* Back link */}
                <div className="container mx-auto px-6 mb-4">
                    <Link href="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Back to search
                    </Link>
                </div>

                {/* Image Gallery */}
                {venue.images && venue.images.length > 0 && (
                    <div className="container mx-auto px-6 mb-8">
                        <ImageGallery images={venue.images} name={venue.name} />
                    </div>
                )}

                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header */}
                            <div>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{venue.name}</h1>
                                        <p className="text-gray-500 flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {venue.location.address || `${venue.location.area}, ${venue.location.city}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Star className="h-5 w-5 fill-gray-900 text-gray-900" />
                                        <span className="text-lg font-bold text-gray-900">{venue.trustScore}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                                        {venue.type}
                                    </span>
                                    <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-700">
                                        ✓ {venue.officialStatus}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* About */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this space</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Located in {venue.location.area}, {venue.location.city}, {venue.name} offers a productive environment for startups and growing teams.
                                    {venue.equityTerms
                                        ? ` This incubator follows a ${venue.equityTerms.percentage === 0 ? "zero equity" : "founder-friendly"} model.`
                                        : " A great blend of community and focus for professionals."}
                                </p>
                            </div>

                            {/* Key numbers */}
                            {venue.capacity && (
                                <>
                                    <hr className="border-gray-100" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{venue.capacity.available || '—'}</div>
                                            <div className="text-sm text-gray-500">Available</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{venue.capacity.total}</div>
                                            <div className="text-sm text-gray-500">Total seats</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{venue.capacity.meetingRooms || '—'}</div>
                                            <div className="text-sm text-gray-500">Meeting rooms</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <hr className="border-gray-100" />

                            {/* Amenities */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">What this space offers</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {venue.amenities?.length > 0 ? venue.amenities.map(amenity => (
                                        <div key={amenity.id} className="flex items-center gap-3 py-2">
                                            {amenity.verified
                                                ? <CheckCircle2 className="h-5 w-5 text-gray-900 shrink-0" />
                                                : <XCircle className="h-5 w-5 text-gray-300 shrink-0" />}
                                            <span className={cn("text-sm", amenity.verified ? "text-gray-700" : "text-gray-400 line-through")}>
                                                {amenity.name}
                                            </span>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 text-sm col-span-2">Amenity information not available.</p>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Reviews */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Reviews
                                    {venue.reviews?.length > 0 && <span className="font-normal text-gray-400 ml-1">· {venue.reviews.length}</span>}
                                </h2>
                                {venue.reviews?.length > 0 ? (
                                    <div className="space-y-5">
                                        {venue.reviews.map((review, i) => (
                                            <div key={i}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                                                        {review.user.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{review.user}</div>
                                                        <div className="text-xs text-gray-400">{review.date}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 mb-1.5">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} className={cn("h-3.5 w-3.5", j < Math.floor(review.rating) ? "fill-gray-900 text-gray-900" : "text-gray-200")} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No reviews yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Right sidebar — Client component with working buttons */}
                        <VenueSidebar
                            venueName={venue.name}
                            venueType={venue.type}
                            pricing={venue.pricing}
                            equityTerms={venue.equityTerms}
                            website={venue.website}
                            trustScore={venue.trustScore}
                            reviewsCount={(venue.reviews?.length || 0) * 12 + 45}
                            officialStatus={venue.officialStatus}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export async function generateStaticParams() {
    const venues = await getVenues();
    return venues.map((venue) => ({ id: venue.id }));
}
