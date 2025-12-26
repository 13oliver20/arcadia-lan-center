
import {
    Trash2, Edit2, Plus, Minus, Upload, Download, Save, Trophy, Users as UsersIcon, QrCode, X, Wifi, MessageCircle, MessageSquare, Monitor, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Image as ImageIcon, Type, GripVertical, LogOut, Eye, EyeOff, Pencil, ToggleLeft, ToggleRight, AlertCircle, Info, Megaphone, DollarSign, Package, Briefcase, Landmark, Coffee, CalendarDays, Sparkles, Gamepad2, Star
} from 'lucide-react';

export const NEON_COLORS = {
    yellow: { value: '#FACC15', name: 'Amarillo', text: 'text-yellow-400', border: 'border-yellow-400/50', shadow: 'shadow-[0_0_15px_rgba(250,204,21,0.8)]', glow: 'drop-shadow-[0_0_20px_rgba(250,204,21,0.9)]', bg: 'bg-yellow-400', ring: 'ring-yellow-400' },
    blue: { value: '#22D3EE', name: 'Azul', text: 'text-cyan-400', border: 'border-cyan-400/50', shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.8)]', glow: 'drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]', bg: 'bg-cyan-400', ring: 'ring-cyan-400' },
    pink: { value: '#F472B6', name: 'Rosa', text: 'text-pink-400', border: 'border-pink-400/50', shadow: 'shadow-[0_0_15px_rgba(244,114,182,0.8)]', glow: 'drop-shadow-[0_0_20px_rgba(244,114,182,0.9)]', bg: 'bg-pink-400', ring: 'ring-pink-400' },
    green: { value: '#4ADE80', name: 'Verde', text: 'text-green-400', border: 'border-green-400/50', shadow: 'shadow-[0_0_15px_rgba(74,222,128,0.8)]', glow: 'drop-shadow-[0_0_20px_rgba(74,222,128,0.9)]', bg: 'bg-green-400', ring: 'ring-green-400' },
    purple: { value: '#A855F7', name: 'Morado', text: 'text-purple-400', border: 'border-purple-400/50', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.8)]', glow: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]', bg: 'bg-purple-400', ring: 'ring-purple-400' },
};

export const FONTS = {
    sans: { name: 'Básica', class: 'font-sans' },
    serif: { name: 'Elegante', class: 'font-serif' },
    mono: { name: 'Código', class: 'font-mono' },
    cyber: { name: 'Cyber', class: 'font-[Orbitron,sans-serif]' },
    hand: { name: 'Manuscrita', class: 'font-[Caveat,cursive]' }
};

export const ICONS = {
    megaphone: { name: 'Megáfono', component: Megaphone },
    info: { name: 'Info', component: Info },
    alert: { name: 'Alerta', component: AlertCircle },
    gamepad: { name: 'Gaming', component: Gamepad2 },
    star: { name: 'Estrella', component: Star }
};

export const DEFAULT_ANNOUNCEMENT_CONFIG = {
    scale: 1,
    x: 0,
    y: 0,
    fontSize: 24,
    color: 'yellow',
    font: 'sans',
    icon: 'megaphone'
};
