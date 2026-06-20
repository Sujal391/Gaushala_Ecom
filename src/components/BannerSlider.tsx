"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: number;
  imageUrl: string;
}

interface BannerSliderProps {
  banners: Banner[];
  autoSlideInterval?: number; // in milliseconds
}

const BannerSlider: React.FC<BannerSliderProps> = ({ 
  banners, 
  autoSlideInterval = 10000 
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, autoSlideInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [banners.length, autoSlideInterval]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      {/* Images Container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex-shrink-0 w-full h-full flex items-center justify-center bg-gray-100"
          >
            <img
              src={banner.imageUrl}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-banner.jpg";
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 md:p-2 rounded-full transition-all z-10 backdrop-blur-sm"
            aria-label="Previous banner"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 md:p-2 rounded-full transition-all z-10 backdrop-blur-sm"
            aria-label="Next banner"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 md:space-x-2 bg-black/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-200 ${
                index === currentIndex
                  ? "w-4 md:w-6 h-1.5 md:h-2 bg-white rounded-full"
                  : "w-1.5 md:w-2 h-1.5 md:h-2 bg-white/50 hover:bg-white/75 rounded-full"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;