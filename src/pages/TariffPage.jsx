import { useState, useEffect, useMemo } from 'react';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import ParticleBackground from '../components/ParticleBackground';

export default function TariffPage() {
    // Read the carousel array: [{ id, src, duration }, ...]
    // Read the carousel array: [{ id, src, duration }, ...]
    const [tariffImages] = useFirebaseSync('arcadia_tariff_images', []);
    const [tariffBanners] = useFirebaseSync('arcadia_tariff_banners', []);
    const [tariffTopBanners] = useFirebaseSync('arcadia_tariff_top_banners', []); // Read Top Banners
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter images based on current day of the week
    const [filteredImages, setFilteredImages] = useState([]);

    useEffect(() => {
        if (!tariffImages) return;

        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
        const active = tariffImages.filter(img => {
            // If activeDays is missing, assume it's active (backward compatibility)
            return img.activeDays ? img.activeDays.includes(today) : true;
        });

        // Plain assignment - no duplication needed for instant cuts
        setFilteredImages(active);
    }, [tariffImages]);

    useEffect(() => {
        if (filteredImages.length === 0) return;

        // Ensure index is valid
        if (currentIndex >= filteredImages.length) setCurrentIndex(0);

        const currentImage = filteredImages[currentIndex];
        if (!currentImage) return;

        // Default to 10 seconds if duration is invalid or 0
        const duration = (currentImage.duration || 10) * 1000;

        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredImages.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, filteredImages]);

    // --- Banner Logic ---
    // --- Banner Logic ---
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const activeBanners = useMemo(() =>
        tariffBanners?.filter(b => b.text.trim() && b.active !== false) || [],
        [tariffBanners]);

    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const currentBanner = activeBanners[currentBannerIndex];
        const duration = (currentBanner?.duration || 7) * 1000;

        const timer = setTimeout(() => {
            setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [activeBanners, currentBannerIndex]);

    // Ensure index is valid when banners change
    useEffect(() => {
        if (currentBannerIndex >= activeBanners.length) {
            setCurrentBannerIndex(0);
        }
    }, [activeBanners.length, currentBannerIndex]);

    const currentBanner = activeBanners[currentBannerIndex];
    // Heuristic: If text is longer than ~60 chars, it might overflow 1080p width at 4xl.
    const isLongBanner = currentBanner?.text.length > 60;

    // --- Top Banner Logic ---
    const [currentTopBannerIndex, setCurrentTopBannerIndex] = useState(0);
    const activeTopBanners = useMemo(() =>
        tariffTopBanners?.filter(b => b.text.trim() && b.active !== false) || [],
        [tariffTopBanners]);

    useEffect(() => {
        if (activeTopBanners.length <= 1) return;

        const currentTopBanner = activeTopBanners[currentTopBannerIndex];
        const duration = (currentTopBanner?.duration || 7) * 1000;

        const timer = setTimeout(() => {
            setCurrentTopBannerIndex(prev => (prev + 1) % activeTopBanners.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [activeTopBanners, currentTopBannerIndex]);

    useEffect(() => {
        if (currentTopBannerIndex >= activeTopBanners.length) {
            setCurrentTopBannerIndex(0);
        }
    }, [activeTopBanners.length, currentTopBannerIndex]);

    const currentTopBanner = activeTopBanners[currentTopBannerIndex];
    const isLongTopBanner = currentTopBanner?.text.length > 60;

    return (
        <div className="min-h-screen bg-slate-900 overflow-hidden relative">
            <ParticleBackground />

            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
                {filteredImages.length > 0 ? (
                    // Carousel Display
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        {filteredImages.map((img, index) => (
                            <img
                                key={`${img.id}-${index}`}
                                src={img.src}
                                alt={`Tariff Slide ${index}`}
                                className={`absolute inset-0 w-full h-full object-contain ${index === currentIndex ? 'block' : 'hidden'}`}
                            />
                        ))}
                    </div>
                ) : (
                    // Loading / Empty State
                    <div className="text-center text-slate-500 animate-pulse">
                        <h1 className="text-4xl font-bold mb-4">Tarifario no disponible</h1>
                        <p>Esperando contenido del administrador...</p>
                    </div>
                )}
            </div>

            {/* --- Footer Banner --- */}
            {currentBanner && (
                <div className="absolute bottom-0 inset-x-0 h-20 bg-black z-50 flex items-center overflow-hidden border-t-4 border-purple-600 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] justify-center">
                    <div
                        key={currentBanner.id} // Key to trigger animation reset on change
                        className={`whitespace-nowrap px-4 font-bold text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] ${isLongBanner ? 'animate-marquee inline-block min-w-full' : 'animate-fade-in'}`}
                    >
                        {currentBanner.text}
                    </div>
                </div>
            )}

            {/* --- Top Banner --- */}
            {currentTopBanner && (
                <div className="absolute top-0 inset-x-0 h-20 bg-black z-50 flex items-center overflow-hidden border-b-4 border-neon-pink shadow-[0_10px_40px_rgba(0,0,0,0.8)] justify-center">
                    <div
                        key={currentTopBanner.id} // Key to trigger animation reset
                        className={`whitespace-nowrap px-4 font-bold text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] ${isLongTopBanner ? 'animate-marquee inline-block min-w-full' : 'animate-fade-in'}`}
                    >
                        {currentTopBanner.text}
                    </div>
                </div>
            )}
        </div>
    );
}
