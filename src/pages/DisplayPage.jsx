import { useEffect, useState } from 'react';
import ParticleBackground from '../components/ParticleBackground';
import DigitalClock from '../components/DigitalClock';
import GlowText from '../components/GlowText';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { Wifi, MessageCircle, Trophy, Calendar, Megaphone, Gift, Info, AlertCircle, Gamepad2, Star } from 'lucide-react';
import { NEON_COLORS, FONTS, ICONS } from '../utils/constants';
import logoArcadia from '../assets/logo_arcadia.png';
import arcadiaGaming from '../assets/arcadia_gaming.png';
import qrWhatsappDefault from '../assets/qr_whatsapp.jpg';
import qrWifiDefault from '../assets/qr_wifi.jpg';

export default function DisplayPage() {
    const [dailyGiveaways, , , giveawaysError] = useFirebaseSync('arcadia_daily_giveaways', { slots: [] });
    const [announcements] = useFirebaseSync('arcadia_announcements_list', []);


    const [qrs] = useFirebaseSync('arcadia_qrs', { wifi: null, whatsapp: null, ssid: '', password: '', whatsappMessage: '' });
    const [monthlyWinners] = useFirebaseSync('arcadia_monthly_winners', [
        { id: 1, rank: 1, winner: null, points: 0 },
        { id: 2, rank: 2, winner: null, points: 0 },
        { id: 3, rank: 3, winner: null, points: 0 }
    ]);
    const [winnersPanelVisible] = useFirebaseSync('arcadia_winners_panel_visible', true);
    const [monthlySubtitle] = useFirebaseSync('arcadia_monthly_subtitle', 'TOP 3 JUGADORES');
    const [benefitsText] = useFirebaseSync('arcadia_benefits_text', '• Descuentos exclusivos\n• Acceso a torneos\n• Horas gratis acumulables');
    const [benefitsTitle] = useFirebaseSync('arcadia_benefits_title', 'BENEFICIOS EXCLUSIVOS\nCOMUNIDAD ARCADIA');
    const [benefitsTitleFontSize] = useFirebaseSync('arcadia_benefits_title_font_size', 24);
    const [benefitsTextFontSize] = useFirebaseSync('arcadia_benefits_text_font_size', 18);
    const [displayConfig] = useFirebaseSync('arcadia_display_config', {
        logo: null,
        scale: 1,
        x: 0,
        y: 0
    });
    const [titleConfig] = useFirebaseSync('arcadia_title_config', {
        text: 'GAMING CENTER ARCADIA',
        scale: 1,
        x: 0,
        y: 0
    });
    const [bottomLogoConfig] = useFirebaseSync('arcadia_bottom_logo_config_v2', {
        logo: null,
        scale: 1,
        x: 0,
        y: 0
    });
    const [particleCount] = useFirebaseSync('arcadia_particle_count', 150);
    const [qrPanelConfig] = useFirebaseSync('arcadia_qr_panel_config_v2', {
        scale: 1,
        x: 0,
        y: 0
    });
    const [qrPanelVisible] = useFirebaseSync('arcadia_qr_panel_visible', true);

    // --- Visibility States ---
    const [displayVisible] = useFirebaseSync('arcadia_display_visible', true);
    const [titleVisible] = useFirebaseSync('arcadia_title_visible', true);
    const [bottomLogoVisible] = useFirebaseSync('arcadia_bottom_logo_visible', true);
    const [particlesVisible] = useFirebaseSync('arcadia_particles_visible', true);
    const [dateTimeVisible] = useFirebaseSync('arcadia_date_time_visible', true);

    const [winnerPanelConfig] = useFirebaseSync('arcadia_winner_panel_config', {
        scale: 1,
        x: 0,
        y: 0
    });

    const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'wifi'
    const [activeWinnerTab, setActiveWinnerTab] = useState('daily'); // 'daily' | 'monthly'

    // Loop toggle every 10 seconds if idle? No, user requested buttons. 
    // Let's stick to buttons as requested for manual interaction, but maybe auto-switch? 
    // The request said "preciomar el otro boton", so manual interaction is key.

    useEffect(() => {
        // Auto-switch is less relevant now that the whole panel disappears, but let's keep it clean
        // or just allow persistence of last tab. Let's remove the auto-switch since the whole panel toggles.
    }, []);

    // Helper for 12h format
    const formatTime12h = (time24h) => {
        if (!time24h) return '';
        const [hours, minutes] = time24h.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${minutes} ${ampm}`;
    };

    return (
        <div className="relative w-full min-h-screen text-white overflow-hidden bg-transparent font-sans selection:bg-neon-pink selection:text-white">
            {particlesVisible && <ParticleBackground particleCount={particleCount} />}

            {/* Header: Date & Clock */}
            {dateTimeVisible && (
                <div className="absolute top-0 w-full p-8 flex justify-between items-start z-10 transition-opacity duration-500 animate-fade-in">
                    <div className="text-white font-mono text-4xl font-bold tracking-widest drop-shadow-[0_0_15px_rgba(0,243,255,0.9)]">
                        {new Date().toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}
                    </div>
                    <DigitalClock />
                </div>
            )}

            {/* Main Content (Hero) */}
            <div className="relative z-10 flex flex-col items-center justify-center h-screen w-full pointer-events-none -mt-24">
                {/* Levitating Logo */}
                {/* User Transform Wrapper */}
                {displayVisible && (
                    <div
                        className="mb-16 will-change-transform transition-transform duration-300 ease-out"
                        style={{
                            transform: `translate(${displayConfig.x}px, ${displayConfig.y}px) scale(${displayConfig.scale})`
                        }}
                    >
                        {/* Levitating Logo */}
                        <div className="animate-levitate">
                            <img
                                src={displayConfig.logo || logoArcadia}
                                alt="Arcadia Logo"
                                className="max-w-[240px] h-auto object-contain drop-shadow-[0_0_20px_white]"
                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                        </div>
                    </div>
                )}

                {/* RGB Flow Text */}
                {titleVisible && (
                    <div
                        className="will-change-transform transition-transform duration-300 ease-out"
                        style={{
                            transform: `translate(${titleConfig.x}px, ${titleConfig.y}px) scale(${titleConfig.scale})`
                        }}
                    >
                        <GlowText text={titleConfig.text || "GAMING CENTER ARCADIA"} />
                    </div>
                )}

                {/* Announcement Text (Multiple) */}
                {announcements.map((announcement) => {
                    const colorParams = (NEON_COLORS[announcement.config.color] || NEON_COLORS['yellow']);
                    const fontClass = (FONTS[announcement.config.font] && FONTS[announcement.config.font].class) || 'font-sans';
                    const iconConfig = ICONS[announcement.config.icon || 'megaphone'];
                    const IconComp = (iconConfig && iconConfig.component) || Megaphone;

                    return (
                        announcement.visible && (
                            <div
                                key={announcement.id}
                                className={`absolute top-[75%] px-10 py-4 border-2 bg-black/80 backdrop-blur-md rounded-2xl transition-transform duration-300 animate-fade-in-up flex items-center space-x-6 pointer-events-auto origin-center ${colorParams.border}`}
                                style={{
                                    transform: `translate(${announcement.config.x}px, ${announcement.config.y}px) scale(${announcement.config.scale})`,
                                    boxShadow: `0 0 40px ${colorParams.value}40`
                                }}
                            >
                                <div className={`${colorParams.bg} text-black p-3 rounded-full ${colorParams.shadow} animate-bounce-custom`}>
                                    <IconComp size={32} strokeWidth={2.5} />
                                </div>
                                <p
                                    className={`font-black tracking-widest animate-pulse uppercase whitespace-pre-wrap text-center ${colorParams.text} ${colorParams.glow} ${fontClass}`}
                                    style={{ fontSize: `${announcement.config.fontSize}px` }}
                                >
                                    {announcement.text}
                                </p>
                            </div>
                        )
                    );
                })}

            </div>

            {/* Bottom Centered Logo */}
            {bottomLogoVisible && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto group">
                    <div
                        className="relative transition-transform duration-300 ease-out"
                        style={{
                            transform: `translate(${bottomLogoConfig.x}px, ${bottomLogoConfig.y}px) scale(${bottomLogoConfig.scale})`
                        }}
                    >
                        <img
                            key={bottomLogoConfig.logo || 'default'}
                            src={bottomLogoConfig.logo || arcadiaGaming}
                            alt="Arcadia Gaming"
                            className="w-40 h-auto block opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-110"
                        />
                    </div>
                </div>
            )}

            {/* Left Sidebar: Connect Panel with Toggle */}
            {qrPanelVisible && (
                <div
                    className="absolute left-10 top-1/2 z-30 w-80 p-6 bg-black/60 backdrop-blur-xl border border-neon-blue/30 rounded-2xl shadow-[0_0_30px_rgba(0,243,255,0.1)] transition-colors duration-300 hover:border-neon-blue/50 will-change-transform ease-out"
                    style={{
                        transform: `translate(${qrPanelConfig.x}px, calc(-50% + ${qrPanelConfig.y}px)) scale(${qrPanelConfig.scale})`
                    }}
                >

                    {/* Header / Tabs */}
                    <div className="flex space-x-2 mb-6 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setActiveTab('whatsapp')}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300 ${activeTab === 'whatsapp'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                                : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <MessageCircle size={18} />
                            <span className="font-bold tracking-wide">WHATSAPP</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('wifi')}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300 ${activeTab === 'wifi'
                                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                                : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Wifi size={18} />
                            <span className="font-bold tracking-wide">WIFI</span>
                        </button>
                    </div>


                    {/* Content Area */}
                    <div className="flex flex-col items-center text-center min-h-[300px] justify-center transition-opacity duration-500">

                        {activeTab === 'whatsapp' && (
                            <div className="animate-fade-in flex flex-col items-center w-full">
                                <div className="relative group cursor-pointer mb-6">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative w-48 h-48 bg-black rounded-xl p-3 flex items-center justify-center">
                                        {qrs.whatsapp || qrWhatsappDefault ? (
                                            <img src={qrs.whatsapp || qrWhatsappDefault} alt="WhatsApp QR" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-slate-500 text-sm">No QR Loaded</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Comunidad oficial</h3>
                                <p className="text-sm text-green-400 font-medium tracking-wide border-t border-green-500/30 pt-3 w-full whitespace-pre-wrap">
                                    {qrs.whatsappMessage || "Únete al grupo de WhatsApp\nArcadia Gaming Center"}
                                </p>
                            </div>
                        )}

                        {activeTab === 'wifi' && (
                            <div className="animate-fade-in flex flex-col items-center w-full">
                                <div className="relative group cursor-pointer mb-6">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative w-48 h-48 bg-black rounded-xl p-3 flex items-center justify-center">
                                        {qrs.wifi || qrWifiDefault ? (
                                            <img src={qrs.wifi || qrWifiDefault} alt="WiFi QR" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-slate-500 text-sm">No QR Loaded</span>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full space-y-4 bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                    <div className="flex flex-col items-center border-b border-white/5 pb-3">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Red Wi-Fi</span>
                                        <span className="text-neon-blue font-mono font-bold text-lg leading-tight">{qrs.ssid || '---'}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Contraseña</span>
                                        <span className="text-neon-pink font-mono font-bold text-lg tracking-widest">{qrs.password || '---'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Right Sidebar: Winners (Daily Giveaways) */}
            {/* Right Sidebar: Winners (Daily & Monthly Tabs) */}
            {/* Right Sidebar: Winners (Daily & Monthly Tabs) */}
            {dailyGiveaways.active !== false && winnersPanelVisible && (
                <div
                    className="absolute right-[170px] top-1/2 z-10 w-80 p-6 bg-black/40 backdrop-blur-md border border-neon-pink/20 rounded-xl transition-colors duration-300 hover:border-neon-pink/40 will-change-transform ease-out"
                    style={{
                        transform: `translate(${winnerPanelConfig.x}px, calc(-50% + ${winnerPanelConfig.y}px)) scale(${winnerPanelConfig.scale})`
                    }}
                >

                    {/* Header / Tabs */}
                    <div className="flex flex-col space-y-2 mb-6 border-b border-white/10 pb-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveWinnerTab('daily')}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300 ${activeWinnerTab === 'daily'
                                    ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                                    : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Calendar size={18} />
                                <span className="font-bold tracking-wide text-xs">DIARIOS</span>
                            </button>
                            <button
                                onClick={() => setActiveWinnerTab('monthly')}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300 ${activeWinnerTab === 'monthly'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                    : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Trophy size={18} />
                                <span className="font-bold tracking-wide text-xs">MENSUALES</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setActiveWinnerTab('benefits')}
                            className={`w-full py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300 ${activeWinnerTab === 'benefits'
                                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                                : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Gift size={18} />
                            <span className="font-bold tracking-wide text-xs">BENEFICIOS DE SER USUARIO</span>
                        </button>
                    </div>

                    {/* DAILY GIVEAWAYS CONTENT */}
                    {activeWinnerTab === 'daily' && (
                        <div className="animate-fade-in custom-scrollbar overflow-y-auto max-h-[60vh]">
                            <h2 className="text-xl font-bold text-neon-pink mb-1 tracking-wider text-center">GANADORES DEL DIA</h2>
                            <div className="text-xl font-bold text-neon-pink font-mono text-center mb-4 border-b border-neon-pink/30 pb-2">
                                {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                            <div className="space-y-4">
                                {dailyGiveaways.slots && dailyGiveaways.slots.length > 0 ? (
                                    dailyGiveaways.slots.filter(s => s.enabled !== false).map((slot) => (
                                        <div key={slot.id} className="bg-white/5 p-3 rounded border-l-4 border-neon-pink min-h-[80px] flex flex-col justify-center transition-all hover:bg-white/10">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-neon-pink/70 uppercase tracking-widest">Sorteo {formatTime12h(slot.time) || '--:--'}</span>
                                                {slot.winner && <span className="text-lg animate-bounce">🏆</span>}
                                            </div>
                                            {slot.winner ? (
                                                <div className="animate-fade-in">
                                                    <div className="font-bold text-white text-xl truncate">{slot.winner.nickname}</div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 italic text-sm animate-pulse">
                                                    Esperando resultados...
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-center italic py-4">
                                        Cargando sorteos...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MONTHLY WINNERS CONTENT */}
                    {activeWinnerTab === 'monthly' && (
                        <div className="animate-fade-in custom-scrollbar overflow-y-auto max-h-[60vh]">
                            <h2 className="text-xl font-bold text-purple-400 mb-0 tracking-wider text-center">GANADORES DEL MES</h2>
                            <div className="text-xl font-bold text-purple-400/80 mb-4 border-b border-purple-500/30 pb-2 tracking-wider text-center">
                                {monthlySubtitle}
                            </div>
                            <div className="space-y-4">
                                {monthlyWinners.filter(slot => slot.enabled !== false).map((slot) => (
                                    <div key={slot.id} className={`bg-white/5 rounded border-l-4 flex flex-col justify-center transition-all hover:bg-white/10 ${slot.rank > 3 ? 'py-2 px-3' : 'p-3'} ${slot.rank === 1 ? 'border-yellow-400 shadow-[inset_0_0_20px_rgba(250,204,21,0.1)]' :
                                        slot.rank === 2 ? 'border-slate-400' :
                                            slot.rank === 3 ? 'border-amber-700' :
                                                'border-red-600' // 4th and 5th place Red
                                        }`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs uppercase tracking-widest font-bold ${slot.rank === 1 ? 'text-yellow-400' :
                                                slot.rank === 2 ? 'text-slate-400' :
                                                    slot.rank === 3 ? 'text-amber-700' :
                                                        'text-red-500' // 4th and 5th place Red
                                                }`}>
                                                {slot.rank}º LUGAR
                                            </span>
                                            {slot.winner && slot.rank <= 3 && <Trophy size={16} className={
                                                slot.rank === 1 ? 'text-yellow-400' :
                                                    slot.rank === 2 ? 'text-slate-400' :
                                                        'text-amber-700'
                                            } />}
                                        </div>
                                        {slot.winner ? (
                                            <div className="animate-fade-in">
                                                <div className={`font-bold text-white text-xl truncate ${slot.rank > 3 ? 'text-base' : ''}`}>{slot.winner.nickname}</div>
                                                {slot.rank <= 3 && (
                                                    <div className="flex justify-end items-end mt-1">
                                                        <span className="text-sm font-mono text-purple-300 font-bold">{slot.points} PTS</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-gray-600 italic text-sm">
                                                Vacante
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BENEFITS CONTENT */}
                    {activeWinnerTab === 'benefits' && (
                        <div className="animate-fade-in custom-scrollbar overflow-y-auto max-h-[60vh]">
                            <h2
                                className="font-bold text-pink-400 mb-4 tracking-wider text-center whitespace-pre-wrap leading-tight border-b border-pink-500/30 pb-2"
                                style={{ fontSize: `${benefitsTitleFontSize}px` }}
                            >
                                {benefitsTitle || 'BENEFICIOS EXCLUSIVOS\nCOMUNIDAD ARCADIA'}
                            </h2>
                            <div className="bg-white/5 p-4 rounded-lg border-l-4 border-pink-500 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)]">
                                <p
                                    className="text-white font-medium whitespace-pre-wrap leading-relaxed text-center"
                                    style={{ fontSize: `${benefitsTextFontSize}px` }}
                                >
                                    {benefitsText || 'Consulta en recepción por los beneficios vigentes.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Connection Status Indicator */}
            <div className="absolute bottom-4 right-4 z-[9999] pointer-events-none opacity-20 hover:opacity-100 transition-opacity">
                <div className={`w-2 h-2 rounded-full ${giveawaysError ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
            </div>
        </div>
    );
}
