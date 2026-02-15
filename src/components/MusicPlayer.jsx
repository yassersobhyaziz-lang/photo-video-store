import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon, Repeat, Shuffle } from 'lucide-react';

const MusicPlayer = ({ currentTrack, onNext, onPrev }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = React.useRef(null);

    React.useEffect(() => {
        if (currentTrack) {
            setIsPlaying(true);
            audioRef.current?.play();
        } else {
            setIsPlaying(false);
            audioRef.current?.pause();
        }
    }, [currentTrack]);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
        setDuration(audioRef.current?.duration || 0);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        if (onNext) onNext();
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl glass rounded-2xl p-4 flex items-center gap-6 shadow-2xl shadow-black/50 border border-white/10 z-50 animate-slide-up">
            <audio
                ref={audioRef}
                src={currentTrack.url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate}
                volume={volume / 100}
            />

            {/* Track Info */}
            <div className="flex items-center gap-4 w-1/4">
                <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center overflow-hidden">
                    {currentTrack.thumbnail ? (
                        <img src={currentTrack.thumbnail} alt="Art" className="w-full h-full object-cover" />
                    ) : (
                        <MusicIcon className="text-white/80" size={20} />
                    )}
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold truncate leading-tight">{currentTrack.title}</h4>
                    <p className="text-xs text-zinc-500 truncate">{currentTrack.category || 'Unknown Artist'}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                    <button className="text-zinc-500 hover:text-white transition-colors"><Shuffle size={18} /></button>
                    <button onClick={onPrev} className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={22} fill="currentColor" /></button>
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
                    >
                        {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} className="ml-1" fill="black" />}
                    </button>
                    <button onClick={onNext} className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={22} fill="currentColor" /></button>
                    <button className="text-zinc-500 hover:text-white transition-colors"><Repeat size={18} /></button>
                </div>

                <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 font-medium">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:from-purple-400 group-hover:to-pink-400 transition-all relative"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume */}
            <div className="w-1/4 flex items-center justify-end gap-3">
                <Volume2 size={18} className="text-zinc-400" />
                <div className="w-24 h-1 bg-white/10 rounded-full cursor-pointer relative group">
                    <div
                        className="h-full bg-white/60 rounded-full"
                        style={{ width: `${volume}%` }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => {
                            setVolume(e.target.value);
                            if (audioRef.current) audioRef.current.volume = e.target.value / 100;
                        }}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;
