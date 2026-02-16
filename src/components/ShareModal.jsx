import React from 'react';
import { X, MessageCircle, Send, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const ShareModal = ({ item, onClose }) => {
    const [copied, setCopied] = useState(false);
    if (!item) return null;

    const shareUrl = item.url;
    const shareTitle = `Check out this ${item.type}: ${item.title}`;

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareTitle);

    const platforms = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle size={24} />,
            color: 'bg-[#25D366]',
            url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        },
        {
            name: 'Telegram',
            icon: <Send size={24} />,
            color: 'bg-[#0088cc]',
            url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        },
        {
            name: 'Messenger',
            icon: <Share2 size={24} />,
            color: 'bg-[#0084FF]',
            url: `https://www.facebook.com/dialog/send?app_id=123456789&link=${encodedUrl}&redirect_uri=${encodedUrl}`, // Note: Desktop Messenger needs App ID, mobile handles better
            fallback: `fb-messenger://share/?link=${encodedUrl}`
        },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePlatformClick = (platform) => {
        if (platform.name === 'Messenger' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            window.location.href = platform.fallback;
        } else {
            window.open(platform.url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleNativeShare = async () => {
        if (!navigator.share) {
            alert('Your browser does not support native sharing.');
            return;
        }

        try {
            // Fetch the file and create a File object
            const response = await fetch(item.url);
            const blob = await response.blob();
            const fileName = (item.title || 'media-file') + (item.type === 'video' ? '.mp4' : item.type === 'audio' ? '.mp3' : '.jpg');
            const file = new File([blob], fileName, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: item.title,
                    text: 'Check out this media file!',
                });
            } else {
                // Fallback to text sharing if file sharing is not supported
                await navigator.share({
                    title: item.title,
                    text: 'Check out this media!',
                    url: item.url
                });
            }
        } catch (error) {
            console.error('Sharing failed:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="glass w-full max-w-sm rounded-[2rem] overflow-hidden animate-scale-in relative z-10 border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Share Media</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-4 mb-8 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden glass shrink-0">
                            <img src={item.thumbnail || item.url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">{item.type}</p>
                            <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {platforms.map(platform => (
                            <button
                                key={platform.name}
                                onClick={() => handlePlatformClick(platform)}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`${platform.color} p-4 rounded-[1.5rem] text-white shadow-lg group-hover:scale-110 transition-transform active:scale-95`}>
                                    {platform.icon}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{platform.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Native Share Button - Highly Visible for File Sharing */}
                    {navigator.share && (
                        <button
                            onClick={handleNativeShare}
                            className="w-full mb-8 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider"
                        >
                            <Share2 size={20} />
                            <span>Share Actual File (WhatsApp/Telegram)</span>
                        </button>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-14 text-sm text-zinc-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute right-2 top-2 bottom-2 px-3 bg-purple-500 rounded-xl text-white hover:bg-purple-600 transition-colors active:scale-95"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white/5 text-center">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                        Sharing links will grant view access to anyone with the link.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
