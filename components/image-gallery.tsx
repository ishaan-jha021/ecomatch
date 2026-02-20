"use client"

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
    const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

    return (
        <>
            {/* Gallery grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 rounded-xl overflow-hidden">
                {/* Main image */}
                <button
                    onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
                    className={`relative overflow-hidden group ${images.length === 1 ? 'col-span-4' : 'col-span-2 row-span-2'}`}
                >
                    <img
                        src={images[0]}
                        alt={`${name} - main photo`}
                        className="w-full h-64 sm:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>

                {/* Thumbnails */}
                {images.slice(1, 5).map((src, i) => (
                    <button
                        key={i}
                        onClick={() => { setCurrentIndex(i + 1); setLightboxOpen(true); }}
                        className="relative overflow-hidden group hidden sm:block"
                    >
                        <img
                            src={src}
                            alt={`${name} photo ${i + 2}`}
                            className="w-full h-[152px] object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                        {/* Show all photos overlay on last thumbnail */}
                        {i === 3 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">+{images.length - 5} more</span>
                            </div>
                        )}
                    </button>
                ))}

                {/* Show all button for single image */}
                {images.length > 1 && (
                    <button
                        onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
                        className="sm:hidden text-sm font-medium text-gray-600 py-2 hover:text-gray-900"
                    >
                        Show all {images.length} photos
                    </button>
                )}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 left-4 z-10 text-white hover:text-white/70 transition-colors flex items-center gap-2 text-sm"
                    >
                        <X className="h-5 w-5" />
                        Close
                    </button>

                    <div className="absolute top-4 right-4 text-white/50 text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>

                    <div className="relative max-w-5xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[currentIndex]}
                            alt={`${name} photo ${currentIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain"
                        />
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:scale-105 transition-transform"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:scale-105 transition-transform"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
