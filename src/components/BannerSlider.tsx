// components/BannerSlider.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getAllBanners } from '../lib/api/auth';
import { API_BASE_URL } from '../lib/api/config';

interface Banner {
  id: number;
  imageUrl: string;
  createdAt: string;
}

interface BannerSliderProps {
  onClose: () => void;
}

const BannerSlider: React.FC<BannerSliderProps> = ({ onClose }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (banners.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [banners.length, onClose]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getAllBanners();
      
      if (response.success && response.data && response.data.length > 0) {
        setBanners(response.data);
      } else {
        setError('No banners available');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners');
      console.error('Error fetching banners:', err);
      setTimeout(() => onClose(), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || banners.length <= 1) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

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

  // Construct full image URL
  const getFullImageUrl = (imageUrl: string): string => {
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 touch-none"
      onClick={onClose}
    >
      {/* Close button - repositioned for mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-10 md:right-20 z-50 bg-black/60 hover:bg-black/80 text-white p-2.5 md:p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white shadow-lg backdrop-blur-sm"
        aria-label="Close banner"
      >
        <X size={20} className="md:w-6 md:h-6" />
      </button>

      {/* Main image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images slider */}
        <div className="relative w-full h-full overflow-hidden">
          <div 
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex-shrink-0 w-full h-full flex items-center justify-center p-4 md:p-8"
              >
                <img
                  src={getFullImageUrl(banner.imageUrl)}
                  alt={`Banner ${banner.id}`}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg md:rounded-none"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-banner.jpg';
                    target.onerror = null;
                  }}
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows - hidden on mobile, show on tablet/desktop */}
          {banners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white shadow-lg z-30"
                aria-label="Previous banner"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white shadow-lg z-30"
                aria-label="Next banner"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Dots indicator - improved for mobile */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2.5 md:space-x-2 bg-black/40 backdrop-blur-sm px-4 py-2.5 md:px-3 md:py-2 rounded-full z-30">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-200 ${
                    index === currentIndex
                      ? 'w-6 md:w-6 h-2.5 md:h-2 bg-white rounded-full'
                      : 'w-2.5 md:w-2 h-2.5 md:h-2 bg-white/50 hover:bg-white/75 rounded-full'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Swipe hint for mobile */}
          {banners.length > 1 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden">
              <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white/80 text-xs animate-pulse">
                  ← Swipe to navigate →
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard hint - hidden on mobile */}
      {banners.length > 1 && (
        <div className="absolute bottom-20 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full hidden md:block z-40 backdrop-blur-sm">
          Use ← → arrow keys • ESC to close
        </div>
      )}
    </div>
  );
};

export default BannerSlider;