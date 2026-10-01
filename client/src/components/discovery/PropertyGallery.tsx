import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Camera,
} from 'lucide-react';

interface GalleryImage {
  url: string;
  label: string;
  category: 'Exterior' | 'Interior' | 'Amenities' | 'Entrance' | 'Plan' | string;
  altText: string;
}

interface PropertyGalleryProps {
  coverImage: string;
  gallery: GalleryImage[];
  propertyTitle: string;
  propertyCode: string;
  propertySubtype: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  coverImage,
  gallery,
  propertyTitle,
  propertyCode,
  propertySubtype,
}) => {
  // Normalize gallery: ensure at least one image exists (cover)
  const images: GalleryImage[] =
    gallery && gallery.length > 0
      ? gallery
      : [
          {
            url: coverImage,
            label: propertyTitle,
            category: 'Exterior',
            altText: propertyTitle,
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const touchStartXRef = useRef<number | null>(null);

  const currentImage = images[activeIndex] || images[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation for gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Mobile Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="space-y-3 text-left">
      {/* 1. Large Primary Hero Display */}
      <div
        className="relative h-72 sm:h-96 md:h-[420px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group cursor-pointer select-none"
        onClick={() => setIsLightboxOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image */}
        <img
          src={currentImage.url}
          alt={currentImage.altText || propertyTitle}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="eager"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/20 to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
          <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-400/30 shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {propertySubtype}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-slate-300 border border-white/10 uppercase tracking-wider">
            {currentImage.category}
          </span>
        </div>

        {/* Top Right: Code & Fullscreen Toggle Button */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
          <span className="px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md text-xs font-mono font-bold text-slate-200 border border-slate-700">
            {propertyCode}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg transition-colors cursor-pointer"
            title="Expand Fullscreen Gallery"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Left & Right Prev/Next Navigation Controls */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="pointer-events-auto p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-white/15 backdrop-blur-md opacity-80 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-lg"
              title="Previous Image (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="pointer-events-auto p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-white/15 backdrop-blur-md opacity-80 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-lg"
              title="Next Image (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Bar: Image Label, Caption & Counter */}
        <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white z-10 pointer-events-none">
          <div className="space-y-0.5 max-w-[70%]">
            <p className="text-xs sm:text-sm font-extrabold text-white drop-shadow-md truncate">
              {currentImage.label}
            </p>
            <p className="text-[11px] text-slate-300 drop-shadow truncate font-normal">
              {propertyTitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-amber-300 shadow-md">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Thumbnail Selector Strip */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2.5">
          {images.map((img, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative h-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 group cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText || img.label}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 transition-colors ${
                    isSelected
                      ? 'bg-amber-400/10'
                      : 'bg-black/40 group-hover:bg-transparent'
                  }`}
                />
                <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-white truncate drop-shadow-md text-left">
                  {img.category}
                </span>
                {isSelected && (
                  <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-xs" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULLSCREEN / LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 text-white"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Lightbox Header */}
          <div
            className="flex items-center justify-between z-10 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                  {propertySubtype}
                </span>
                <span className="text-sm font-extrabold text-white">
                  {propertyTitle}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({propertyCode})
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentImage.label}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 font-bold">
                {activeIndex + 1} of {images.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image with Left/Right Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center my-2 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.url}
              alt={currentImage.altText || propertyTitle}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
            />

            {/* Lightbox Prev / Next Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-2xl"
                  title="Previous Photo (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-2xl"
                  title="Next Photo (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Lightbox Strip */}
          <div
            className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 max-w-2xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-14 w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activeIndex === idx
                    ? 'border-amber-400 scale-105 ring-2 ring-amber-400/40'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
