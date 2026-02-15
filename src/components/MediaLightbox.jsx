import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Download, Share2 } from 'lucide-react';

const MediaLightbox = ({ items, initialIndex, onClose, onShare }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentItem = items[currentIndex];

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                handleNext();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentIndex]);

    const handleNext = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const togglePlay = (e) => {
        e?.stopPropagation();
        setIsPlaying(!isPlaying);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === ' ') togglePlay();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!currentItem) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
            {/* Controls */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
                <div className="text-white">
                    <h3 className="text-lg font-bold">{currentItem.title}</h3>
                    <p className="text-sm text-zinc-400">{currentIndex + 1} of {items.length}</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlay}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                        title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                        title="Download"
                    >
                        <Download size={20} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare(currentItem);
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                        title="Share"
                    >
                        <Share2 size={20} />
                    </button>

                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white transition-all backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-10">
                <button
                    onClick={handlePrev}
                    className="absolute left-4 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-40 hidden sm:block"
                >
                    <ChevronLeft size={32} />
                </button>

                <div className="relative max-w-full max-h-full flex items-center justify-center">
                    {currentItem.type === 'video' ? (
                        <video
                            src={currentItem.url}
                            controls
                            autoPlay={isPlaying}
                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                        />
                    ) : (
                        <img
                            src={currentItem.url}
                            alt={currentItem.title}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                    )}
                </div>

                <button
                    onClick={handleNext}
                    className="absolute right-4 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-40 hidden sm:block"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Thumbnail Strip (Optional, can be added later) */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 px-4 overflow-x-auto">
                {items.map((item, idx) => (
                    <div
                        key={item.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === idx ? 'border-purple-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                            }`}
                    >
                        <img
                            src={item.type === 'video' ? item.thumbnail : item.url}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MediaLightbox;
