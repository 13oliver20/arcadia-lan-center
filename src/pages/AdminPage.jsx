import { useState, useEffect } from 'react';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, Plus, Minus, Upload, Download, Save, Trophy, Users as UsersIcon, QrCode, X, Wifi, MessageCircle, MessageSquare, Monitor, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Image as ImageIcon, Type, GripVertical, LogOut, Eye, EyeOff, Pencil, ToggleLeft, ToggleRight, AlertCircle, Info, Megaphone, DollarSign, Package, Briefcase, Landmark, Coffee, CalendarDays, Sparkles, Gamepad2, Star } from 'lucide-react';
import Modal from '../components/Modal';
import GlowText from '../components/GlowText';
import { processImage } from '../utils/imageHandler';
import arcadiaGaming from '../assets/arcadia_gaming.png';
import { read, utils, writeFile } from 'xlsx';
import { NEON_COLORS, FONTS, ICONS, DEFAULT_ANNOUNCEMENT_CONFIG } from '../utils/constants';

export default function AdminPage() {
    const navigate = useNavigate();

    // --- State Management ---
    const [users, setUsers, , usersError] = useFirebaseSync('arcadia_users', []);

    // --- Daily Giveaways State (New) ---
    const [dailyGiveaways, setDailyGiveaways] = useFirebaseSync('arcadia_daily_giveaways', {
        date: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`,
        active: true,
        slots: [
            { id: 1, time: '13:00', winner: null, enabled: true },
            { id: 2, time: '17:00', winner: null, enabled: true },
            { id: 3, time: '21:00', winner: null, enabled: false }
        ]

    });

    const [winnerHistory, setWinnerHistory] = useFirebaseSync('arcadia_winner_history', []);
    const [monthlyWinners, setMonthlyWinners] = useFirebaseSync('arcadia_monthly_winners', [
        { id: 1, rank: 1, winner: null, points: 0 },
        { id: 2, rank: 2, winner: null, points: 0 },
        { id: 3, rank: 3, winner: null, points: 0 },
        { id: 4, rank: 4, winner: null, points: 0, enabled: false }
    ]);

    const [monthlySubtitle, setMonthlySubtitle] = useFirebaseSync('arcadia_monthly_subtitle', 'TOP 3 JUGADORES');
    // --- Announcement Manager State (Multiple) ---
    const [announcements, setAnnouncements] = useFirebaseSync('arcadia_announcements_list', []);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
    const [tempAnnouncementState, setTempAnnouncementState] = useState({
        text: '',
        visible: true,
        config: { scale: 1, x: 0, y: 0, fontSize: 24 }
    });
    const [qrs, setQrs] = useFirebaseSync('arcadia_qrs', { wifi: null, whatsapp: null, ssid: '', password: '', whatsappMessage: '' });
    const [benefitsText, setBenefitsText] = useFirebaseSync('arcadia_benefits_text', '• Descuentos exclusivos\n• Acceso a torneos\n• Horas gratis acumulables');
    const [benefitsTitle, setBenefitsTitle] = useFirebaseSync('arcadia_benefits_title', 'BENEFICIOS EXCLUSIVOS\nCOMUNIDAD ARCADIA');
    const [benefitsTitleFontSize, setBenefitsTitleFontSize] = useFirebaseSync('arcadia_benefits_title_font_size', 24); // px
    const [benefitsTextFontSize, setBenefitsTextFontSize] = useFirebaseSync('arcadia_benefits_text_font_size', 18); // px

    const [displayConfig, setDisplayConfig] = useFirebaseSync('arcadia_display_config', {
        logo: null, // Base64 image
        scale: 1,
        x: 0,
        y: 0
    });

    const [isEditingDisplay, setIsEditingDisplay] = useState(false);
    const [tempDisplayConfig, setTempDisplayConfig] = useState({
        logo: null,
        scale: 1,
        x: 0,
        y: 0
    });

    const [titleConfig, setTitleConfig] = useFirebaseSync('arcadia_title_config', {
        text: 'GAMING CENTER ARCADIA',
        scale: 1,
        x: 0,
        y: 0
    });

    const [bottomLogoConfig, setBottomLogoConfig] = useFirebaseSync('arcadia_bottom_logo_config_v2', {
        logo: null,
        scale: 1,
        x: 0,
        y: 0
    });

    const [particleCount, setParticleCount] = useFirebaseSync('arcadia_particle_count', 150);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitleConfig, setTempTitleConfig] = useState({
        text: 'GAMING CENTER ARCADIA',
        scale: 1,
        x: 0,
        y: 0
    });

    const [isEditingBottomLogo, setIsEditingBottomLogo] = useState(false);
    const [tempBottomLogoConfig, setTempBottomLogoConfig] = useState({
        logo: null,
        scale: 1,
        x: 0,
        y: 0
    });

    const [isEditingParticles, setIsEditingParticles] = useState(false);
    const [tempParticleCount, setTempParticleCount] = useState(150);

    const [qrPanelConfig, setQrPanelConfig] = useFirebaseSync('arcadia_qr_panel_config_v2', {
        scale: 1,
        x: 0,
        y: 0
    });
    const [qrPanelVisible, setQrPanelVisible] = useFirebaseSync('arcadia_qr_panel_visible', true);
    // --- Visibility States ---
    const [displayVisible, setDisplayVisible] = useFirebaseSync('arcadia_display_visible', true);
    const [titleVisible, setTitleVisible] = useFirebaseSync('arcadia_title_visible', true);
    const [bottomLogoVisible, setBottomLogoVisible] = useFirebaseSync('arcadia_bottom_logo_visible', true);
    const [particlesVisible, setParticlesVisible] = useFirebaseSync('arcadia_particles_visible', true);
    const [dateTimeVisible, setDateTimeVisible] = useFirebaseSync('arcadia_date_time_visible', true);

    const [isEditingDateTime, setIsEditingDateTime] = useState(false);
    const [tempDateTimeVisible, setTempDateTimeVisible] = useState(true);

    const [winnersPanelVisible, setWinnersPanelVisible] = useFirebaseSync('arcadia_winners_panel_visible', true);

    const [winnerPanelConfig, setWinnerPanelConfig] = useFirebaseSync('arcadia_winner_panel_config', {
        scale: 1,
        x: 0,
        y: 0
    });

    const [isEditingQrPanel, setIsEditingQrPanel] = useState(false);
    const [tempQrPanelConfig, setTempQrPanelConfig] = useState({
        scale: 1,
        x: 0,
        y: 0
    });

    const [isEditingWinnerPanel, setIsEditingWinnerPanel] = useState(false);
    const [tempWinnerPanelConfig, setTempWinnerPanelConfig] = useState({
        scale: 1,
        x: 0,
        y: 0
    });

    const [isEditingBenefitsTitle, setIsEditingBenefitsTitle] = useState(false);
    const [isEditingBenefitsText, setIsEditingBenefitsText] = useState(false);

    // Temporary state for editing
    const [tempBenefitsTitle, setTempBenefitsTitle] = useState('');
    const [tempBenefitsText, setTempBenefitsText] = useState('');

    // --- Announcement Edit State (Converted to Multiple) ---
    // State removed in favor of `tempAnnouncementState` and `editingAnnouncementId`

    // --- Monthly Reset Tracker ---
    // Stores the last month we saw (format: "MM/YYYY")
    const [lastResetMonth, setLastResetMonth] = useFirebaseSync('arcadia_last_reset_month', new Date().toLocaleDateString('es-ES', { month: '2-digit', year: 'numeric' }));

    // --- Tariff Page State ---
    // --- Tariff Page State (Carousel) ---
    // [ { id, src, duration: 10 } ]
    const [tariffImages, setTariffImages] = useFirebaseSync('arcadia_tariff_images', []);
    const [tempTariffImage, setTempTariffImage] = useState(null); // Used for new uploads before adding to list
    const [showTariffConfirm, setShowTariffConfirm] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null); // For Drag and Drop
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [editingBannerId, setEditingBannerId] = useState(null); // ID of banner currently being edited
    // const [editingImageId, setEditingImageId] = useState(null); // Removed in favor of Modal

    // --- Tariff Image Modal State ---
    const [tariffModal, setTariffModal] = useState({ isOpen: false, type: null, data: null, index: null });
    // --- Giveaway Delete Modal State ---
    const [giveawayDeleteModal, setGiveawayDeleteModal] = useState({ isOpen: false, slotId: null });



    // --- Tariff Banner State ---
    const [tariffBanners, setTariffBanners] = useFirebaseSync('arcadia_tariff_banners', []);
    const [tariffTopBanners, setTariffTopBanners] = useFirebaseSync('arcadia_tariff_top_banners', []); // New Top Banner State
    const [editingTopBannerId, setEditingTopBannerId] = useState(null);

    const [monthlyServices, setMonthlyServices] = useFirebaseSync('arcadia_finance_services', [
        { id: 1, concept: 'Alquiler local', date: '', amount: '' },
        { id: 2, concept: 'Electricidad 1', date: '', amount: '' },
        { id: 3, concept: 'Electricidad 2', date: '', amount: '' },
        { id: 4, concept: 'Agua', date: '', amount: '' },
        { id: 5, concept: 'Servicio internet 1', date: '', amount: '' },
        { id: 6, concept: 'Servicio internet 2', date: '', amount: '' },
        { id: 7, concept: 'Servicio internet 3', date: '', amount: '' },
        { id: 8, concept: 'Personal', date: '', amount: '' },
        { id: 9, concept: 'Otros', date: '', amount: '' }
    ]);

    const [editingServices, setEditingServices] = useState({}); // { [id]: boolean }
    const [openDatePickerId, setOpenDatePickerId] = useState(null); // Track which row has date picker open

    const toggleServiceEdit = (id) => {
        setEditingServices(prev => ({ ...prev, [id]: !prev[id] }));
        setOpenDatePickerId(null); // Close picker when toggling edit
    };

    const updateService = (id, field, value) => {
        setMonthlyServices(monthlyServices.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleDateSelect = (id, day) => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        // Format as YYYY-MM-DD
        const formattedDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        updateService(id, 'date', formattedDate);
        setOpenDatePickerId(null);
    };

    const addService = () => {
        const newService = { id: Date.now(), concept: '', date: '', amount: '' };
        setMonthlyServices([...monthlyServices, newService]);
        // Automatically enter edit mode for new service
        setEditingServices(prev => ({ ...prev, [newService.id]: true }));
    };

    const deleteService = (id) => {
        // Only allow deleting custom added services (id > 9) or just clear fields? 
        // User asked to add "rows", imply they can delete? 
        // For now, let's allow deleting any if needed, or maybe just custom ones.
        // Let's implement full delete for flexibility.
        if (window.confirm('¿Eliminar esta fila?')) {
            setMonthlyServices(monthlyServices.filter(s => s.id !== id));
        }
    };

    const calculateTotalServices = () => {
        return monthlyServices.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toFixed(2);
    };

    // --- History Cleanup Logic (3 Months) ---

    // --- History Cleanup Logic (3 Months) ---
    useEffect(() => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const cleanHistory = winnerHistory.filter(record => new Date(record.timestamp) > threeMonthsAgo);
        if (cleanHistory.length !== winnerHistory.length) {
            setWinnerHistory(cleanHistory);
        }
    }, [winnerHistory, setWinnerHistory]);

    // --- Daily Reset Logic ---
    useEffect(() => {
        // Use stable YYYY-MM-DD format to avoid locale issues
        const d = new Date();
        const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

        // Check if stored date differs from today
        // Note: We also handle the legacy format (DD/MM/YYYY) by ensuring we only reset if it's definitely a different day
        if (dailyGiveaways.date !== today) {
            // Special check: if the stored date is in legacy format (e.g. 22/12/2025) and matches today visually, 
            // we should NOT clear the winners, but just update the format.
            // However, implementing that parsing is complex. 
            // Simplest path: If dates don't match string-for-string, we reset.
            // This will cause ONE reset upon deployment, which is acceptable cleanup.

            setDailyGiveaways({
                date: today,
                slots: dailyGiveaways.slots.map(s => ({ ...s, winner: null }))
            });
        }
    }, [dailyGiveaways, setDailyGiveaways]);

    // --- Monthly Reset Logic ---
    useEffect(() => {
        const checkMonthlyReset = () => {
            const currentMonth = new Date().toLocaleDateString('es-ES', { month: '2-digit', year: 'numeric' });

            if (lastResetMonth !== currentMonth) {
                // It's a new month! Reset winners.
                const resetWinners = monthlyWinners.map(slot => ({
                    ...slot,
                    winner: null,
                    points: 0 // Reset points too? Usually yes for new month.
                }));

                setMonthlyWinners(resetWinners);
                setLastResetMonth(currentMonth);
                setMonthlySubtitle('TOP 3 JUGADORES'); // Reset subtitle to default

                // Notify User
                setImportResultModal({
                    isOpen: true,
                    title: 'Nuevo Mes Iniciado',
                    message: `¡Bienvenido a ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}!\n\nSe han restablecido los ganadores mensuales y los puntos para comenzar el nuevo ciclo.`,
                    type: 'info'
                });
            }
        };

        // Check on mount
        checkMonthlyReset();

        // Check every minute (in case the app is open during the transition)
        const interval = setInterval(checkMonthlyReset, 60000);
        return () => clearInterval(interval);
    }, [lastResetMonth, setLastResetMonth, monthlyWinners, setMonthlyWinners, setMonthlySubtitle]);

    const [newUser, setNewUser] = useState({ name: '', nickname: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);

    // --- Winner Search Interface State ---

    const [winnerSearchQuery, setWinnerSearchQuery] = useState('');
    const [isWinnerSearchOpen, setIsWinnerSearchOpen] = useState(null); // stores slot ID (or monthly ID) being edited
    const [selectedSlotId, setSelectedSlotId] = useState(null); // ID of slot we are selecting a winner for
    const [selectedMonthlyId, setSelectedMonthlyId] = useState(null); // ID of monthly slot being edited
    const [pendingWinner, setPendingWinner] = useState(null); // User object selected but not saved
    const [editingMonthlyWinners, setEditingMonthlyWinners] = useState({}); // { id: boolean } to track edit mode per slot
    const [changingMonthlyUser, setChangingMonthlyUser] = useState({}); // { id: boolean } to track user-change mode per slot
    const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);

    // --- Success/Import Modal State ---
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [importResultModal, setImportResultModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // --- User Confirmation State ---
    const [userConfirmation, setUserConfirmation] = useState({
        isOpen: false,
        type: null, // 'ADD', 'EDIT_START', 'DELETE'
        data: null
    });

    // --- QR Editing State ---
    const [isEditingWifi, setIsEditingWifi] = useState(false);
    const [wifiForm, setWifiForm] = useState({ ssid: '', password: '' });

    const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
    const [whatsappForm, setWhatsappForm] = useState({ message: '' });

    // Initialize form when qrs changes (if not editing)
    useEffect(() => {
        if (!isEditingWifi) {
            setWifiForm({ ssid: qrs.ssid || '', password: qrs.password || '' });
        }
    }, [qrs, isEditingWifi]);

    useEffect(() => {
        if (!isEditingWhatsapp) {
            setWhatsappForm({ message: qrs.whatsappMessage || '' });
        }
    }, [qrs, isEditingWhatsapp]);

    const handleWifiSave = () => {
        setQrs({ ...qrs, ssid: wifiForm.ssid, password: wifiForm.password });
        setIsEditingWifi(false);
    };

    const handleWifiCancel = () => {
        setWifiForm({ ssid: qrs.ssid || '', password: qrs.password || '' });
        setIsEditingWifi(false);
    };

    const handleWhatsappSave = () => {
        setQrs({ ...qrs, whatsappMessage: whatsappForm.message });
        setIsEditingWhatsapp(false);
    };

    const handleWhatsappCancel = () => {
        setWhatsappForm({ message: qrs.whatsappMessage || '' });
        setIsEditingWhatsapp(false);
    };

    // --- Error State ---
    const [errorMsg, setErrorMsg] = useState('');

    // --- User CRUD ---
    const addUser = (e) => {
        if (e) e.preventDefault();
        setErrorMsg(''); // Clear previous errors

        if (!newUser.name || !newUser.nickname) {
            setErrorMsg('Por favor complete todos los campos.');
            return;
        }

        // 1. Capacity Check
        if (users.length >= 1000) {
            setErrorMsg('Error: Se ha alcanzado el límite máximo de 1000 usuarios.');
            return;
        }

        // 2. Duplicate Nickname Check
        const nicknameExists = users.some(u => u.nickname.toLowerCase() === newUser.nickname.toLowerCase());
        if (nicknameExists) {
            setErrorMsg(`Error: El nickname "${newUser.nickname}" ya está registrado.`);
            return;
        }

        // If explicitly confirmed or just checking
        if (userConfirmation.isOpen && userConfirmation.type === 'ADD') {
            const user = { id: Date.now().toString(), ...newUser };
            setUsers([...users, user]);
            setNewUser({ name: '', nickname: '' });
            setUserConfirmation({ isOpen: false, type: null, data: null });
        } else {
            // Trigger confirmation
            setUserConfirmation({
                isOpen: true,
                type: 'ADD',
                data: { ...newUser }
            });
        }
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        setErrorMsg(''); // Clear previous errors
        if (!newUser.name || !newUser.nickname) return;

        if (editingUserId) {
            // Check for duplicate nickname (excluding current user)
            const nicknameExists = users.some(u =>
                u.id !== editingUserId &&
                u.nickname.toLowerCase() === newUser.nickname.toLowerCase()
            );

            if (nicknameExists) {
                setErrorMsg(`Error: El nickname "${newUser.nickname}" ya está en uso por otro usuario.`);
                return;
            }

            setUsers(users.map(u => u.id === editingUserId ? { ...u, ...newUser } : u));
            setEditingUserId(null);
            setNewUser({ name: '', nickname: '' });
        }
    };

    const startEditing = (user) => {
        setErrorMsg('');
        if (userConfirmation.isOpen && userConfirmation.type === 'EDIT_START') {
            setNewUser({ name: user.name, nickname: user.nickname });
            setEditingUserId(user.id);
            setUserConfirmation({ isOpen: false, type: null, data: null });
        } else {
            setUserConfirmation({
                isOpen: true,
                type: 'EDIT_START',
                data: user
            });
        }
    };

    const cancelEdit = () => {
        setNewUser({ name: '', nickname: '' });
        setEditingUserId(null);
        setErrorMsg('');
    };

    const deleteUser = (id) => {
        setErrorMsg('');
        const userToDelete = users.find(u => u.id === id);
        if (userConfirmation.isOpen && userConfirmation.type === 'DELETE') {
            setUsers(users.filter(u => u.id !== id));
            setUserConfirmation({ isOpen: false, type: null, data: null });
        } else {
            setUserConfirmation({
                isOpen: true,
                type: 'DELETE',
                data: userToDelete
            });
        }
    };

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = utils.sheet_to_json(ws);

                // Normalize keys to find columns regardless of casing/trimming
                const normalizeKey = (key) => key.toString().trim().toLowerCase();

                let addedCount = 0;
                let duplicateCount = 0;
                let invalidFormatCount = 0;
                const newUsers = [];

                data.forEach((row, index) => {
                    const keys = Object.keys(row);
                    // Find actual keys in the row that match our expected headers
                    const userKey = keys.find(k => ['usuario', 'user', 'nickname'].includes(normalizeKey(k)));
                    const nameKey = keys.find(k => ['nombre', 'name', 'full name'].includes(normalizeKey(k)));

                    const nickname = userKey ? row[userKey] : null;
                    const name = nameKey ? row[nameKey] : null;

                    if (nickname && name) {
                        // Basic duplication check against CURRENT state + NEW batch
                        const existsInCurrent = users.some(u => u.nickname.toLowerCase() === nickname.toString().toLowerCase());
                        const existsInBatch = newUsers.some(u => u.nickname.toLowerCase() === nickname.toString().toLowerCase());

                        if (!existsInCurrent && !existsInBatch) {
                            newUsers.push({
                                id: (Date.now() + index).toString(), // Sequential numeric ID
                                nickname: nickname.toString(),
                                name: name.toString()
                            });
                            addedCount++;
                        } else {
                            duplicateCount++;
                        }
                    } else {
                        invalidFormatCount++;
                    }
                });

                if (newUsers.length > 0) {
                    // Check capacity
                    if (users.length + newUsers.length > 1000) {
                        setErrorMsg(`Error: La importación excedería el límite de 1000 usuarios. Capacidad disponible: ${1000 - users.length}`);
                        return;
                    }
                    setUsers(prev => [...prev, ...newUsers]);
                    setImportResultModal({
                        isOpen: true,
                        title: 'Importación Completada',
                        message: `Agregados: ${addedCount}\nDuplicados omitidos: ${duplicateCount}\nFormato inválido: ${invalidFormatCount}`,
                        type: 'success'
                    });
                } else {
                    let msg = 'No se agregaron usuarios.';
                    if (duplicateCount > 0) msg += `\n- ${duplicateCount} usuarios ya existían (duplicados).`;
                    if (invalidFormatCount > 0) msg += `\n- ${invalidFormatCount} filas no tenían las columnas 'USUARIO' y 'NOMBRE'.`;

                    setImportResultModal({
                        isOpen: true,
                        title: 'Resultado de Importación',
                        message: msg,
                        type: 'info'
                    });
                }

            } catch (err) {
                console.error("Excel Import Error:", err);
                setErrorMsg('Error al procesar el archivo Excel. Verifica el formato.');
            }
        };
        reader.readAsBinaryString(file);
    };



    const handleExcelExport = () => {
        try {
            // Prepare data for export (USUARIO, NOMBRE column format)
            const exportData = users.map(u => ({
                USUARIO: u.nickname,
                NOMBRE: u.name
            }));

            const ws = utils.json_to_sheet(exportData);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Usuarios");

            // Generate filename with current date
            const dateStr = new Date().toISOString().slice(0, 10);
            writeFile(wb, `Arcadia_Usuarios_${dateStr}.xlsx`);
        } catch (error) {
            console.error("Export Error:", error);
            setErrorMsg('Error al exportar usuarios.');
        }
    };

    const filteredUsers = users
        .filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.id - a.id); // Sort by Newest First (descending ID)

    const [currentView, setCurrentView] = useState('users'); // 'users', 'giveaways', 'qrs'

    const [isMenuOpen, setIsMenuOpen] = useState(false); // Client Screen Menu
    const [isTariffMenuOpen, setIsTariffMenuOpen] = useState(false); // Tariff Screen Menu
    const [isFinanceMenuOpen, setIsFinanceMenuOpen] = useState(false); // Finance Screen Menu

    // --- Announcement Manager Handlers ---

    const addAnnouncement = () => {
        const newId = Date.now();
        const newAnnouncement = {
            id: newId,
            text: 'NUEVO ANUNCIO',
            visible: true,
            config: { ...DEFAULT_ANNOUNCEMENT_CONFIG }
        };
        setAnnouncements([...announcements, newAnnouncement]);
    };

    const startEditingAnnouncement = (announcement) => {
        setTempAnnouncementState({
            text: announcement.text,
            visible: announcement.visible,
            config: { color: 'yellow', font: 'sans', icon: 'megaphone', ...announcement.config }
        });
        setEditingAnnouncementId(announcement.id);
    };

    const cancelEditingAnnouncement = () => {
        setEditingAnnouncementId(null);
        setTempAnnouncementState({ text: '', visible: true, config: {} });
    };

    const toggleAnnouncementVisibility = (id) => {
        setAnnouncements(prev => prev.map(a =>
            a.id === id ? { ...a, visible: !a.visible } : a
        ));
    };

    const handleAnnouncementSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'ANNOUNCEMENT_SAVE',
            data: {
                id: editingAnnouncementId,
                ...tempAnnouncementState,
                visible: announcements.find(a => a.id === editingAnnouncementId)?.visible ?? true
            }
        });
    };

    const handleDeleteAnnouncement = (id) => {
        setUserConfirmation({
            isOpen: true,
            type: 'ANNOUNCEMENT_DELETE',
            data: { id }
        });
    };

    // --- Mass Delete State ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteStep, setDeleteStep] = useState('confirm'); // 'confirm' | 'password'
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const handleDeleteAllClick = () => {
        setDeleteStep('confirm');
        setDeletePassword('');
        setDeleteError('');
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteStep1 = () => {
        setDeleteStep('password');
    };

    const confirmDeleteStep2 = () => {
        if (deletePassword === 'pichicome') {
            setUsers([]);
            setIsDeleteModalOpen(false);
            setSuccessModalOpen(true);
        } else {
            setDeleteError('Contraseña incorrecta');
        }
    };

    // --- Daily Giveaway Handlers ---
    // --- Ensure 3rd slot exists (Migration) ---
    // --- Ensure 3rd slot (Daily) and 4th slot (Monthly) exist (Migration) ---
    useEffect(() => {
        // Strict State Enforcement:
        // 1. Ensure Legacy Slot #3 is GONE (User request: "No debe existir").
        // 2. Ensure Slot #1 and #2 ALWAYS exist.
        // 3. Allow other dynamic slots (ID > 3, created by + button) to exist.

        let slots = dailyGiveaways.slots || [];
        let needsUpdate = false;

        // A. Remove Legacy ID 3
        if (slots.some(s => s.id === 3)) {
            slots = slots.filter(s => s.id !== 3);
            needsUpdate = true;
        }

        // B. Ensure ID 1 exists
        if (!slots.some(s => s.id === 1)) {
            slots = [...slots, { id: 1, time: '20:00', winner: null, enabled: true }];
            needsUpdate = true;
        }

        // C. Ensure ID 2 exists
        if (!slots.some(s => s.id === 2)) {
            slots = [...slots, { id: 2, time: '21:00', winner: null, enabled: true }];
            needsUpdate = true;
        }

        if (needsUpdate) {
            setDailyGiveaways(prev => ({ ...prev, slots }));
        }

        // Monthly Winners Migration: Ensure 5 slots and FORCE ENABLE them
        if (monthlyWinners.length < 5 || monthlyWinners.some(s => s.enabled === false)) {
            setMonthlyWinners(prev => {
                const currentCount = prev.length;
                let newSlots = [...prev];

                // Add missing slots
                if (currentCount < 5) {
                    for (let i = currentCount + 1; i <= 5; i++) {
                        newSlots.push({ id: i, rank: i, winner: null, points: 0, enabled: true });
                    }
                }

                // Force Enable All (Fixes hidden 4th place issue)
                newSlots = newSlots.map(s => ({ ...s, enabled: true }));

                return newSlots;
            });
        }
    }, [dailyGiveaways, setDailyGiveaways, monthlyWinners.length, setMonthlyWinners]);

    // --- Automatic Daily Reset Logic ---
    useEffect(() => {
        const checkDailyReset = () => {
            const today = new Date().toLocaleDateString('es-ES');
            // Check if stored date is different from today
            if (dailyGiveaways.date !== today) {
                setDailyGiveaways(prev => ({
                    ...prev,
                    date: today,
                    slots: prev.slots.map(s => ({ ...s, winner: null }))
                }));
            }
        };

        // Run immediately on mount to catch up if page was closed
        checkDailyReset();

        // Check every minute to catch midnight while page is open
        const interval = setInterval(checkDailyReset, 60000);
        return () => clearInterval(interval);
    }, [dailyGiveaways.date, setDailyGiveaways]);

    // Toggle Monthly Slot
    const toggleMonthlySlot = (slotId) => {
        setMonthlyWinners(prev => prev.map(slot =>
            slot.id === slotId ? { ...slot, enabled: !slot.enabled } : slot
        ));
    };

    const updateSlotTime = (slotId, time) => {
        setDailyGiveaways({
            ...dailyGiveaways,
            slots: dailyGiveaways.slots.map(s => s.id === slotId ? { ...s, time } : s)
        });
    };

    const toggleSlot = (slotId) => {
        setDailyGiveaways({
            ...dailyGiveaways,
            slots: dailyGiveaways.slots.map(s => s.id === slotId ? { ...s, enabled: !s.enabled } : s)
        });
    };

    const openWinnerSearch = (slotId) => {
        setSelectedSlotId(slotId);
        setIsWinnerSearchOpen(slotId);
        setWinnerSearchQuery('');
    };

    const selectCandidate = (user) => {
        if (selectedMonthlyId) {
            // Trigger confirmation for Monthly User Set
            setUserConfirmation({
                isOpen: true,
                type: 'MONTHLY_USER_SET',
                data: { slotId: selectedMonthlyId, user }
            });
            // Close interactions
            setSelectedMonthlyId(null);
            setIsWinnerSearchOpen(null);
        } else {
            setPendingWinner(user);
            setIsWinnerSearchOpen(null);
        }
    };

    const [editingPrizeId, setEditingPrizeId] = useState(null);

    const confirmWinner = (slotId) => {
        if (!pendingWinner) return;

        // Add to history
        const newRecord = {
            id: Date.now(),
            user: pendingWinner,
            selectionTime: new Date().toLocaleString(),
            timestamp: new Date().toISOString(),
            prize: 'Pendiente' // Default
        };
        setWinnerHistory([newRecord, ...winnerHistory]);

        setDailyGiveaways({
            ...dailyGiveaways,
            slots: dailyGiveaways.slots.map(s => s.id === slotId ? { ...s, winner: pendingWinner } : s)
        });
        setPendingWinner(null);
        setSelectedSlotId(null);
    };

    const addGiveawaySlot = () => {
        const slots = dailyGiveaways.slots;
        // Use Date.now() for unique ID to avoid collisions
        const newId = Date.now();

        // Default time: 1 hour after the last slot, or 20:00 default
        let defaultTime = "20:00";
        if (slots.length > 0) {
            const lastTime = slots[slots.length - 1].time;
            const [h, m] = lastTime.split(':').map(Number);
            let newH = h + 1;
            if (newH > 23) newH = 0;
            defaultTime = `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }

        const newSlot = {
            id: newId,
            time: defaultTime,
            winner: null,
            enabled: true,
            points: null
        };

        setDailyGiveaways({
            ...dailyGiveaways,
            slots: [...dailyGiveaways.slots, newSlot]
        });
    };

    const deleteGiveawaySlot = (id) => {
        setGiveawayDeleteModal({ isOpen: true, slotId: id });
    };

    const confirmDeleteGiveaway = () => {
        if (giveawayDeleteModal.slotId) {
            setDailyGiveaways({
                ...dailyGiveaways,
                slots: dailyGiveaways.slots.filter(s => s.id !== giveawayDeleteModal.slotId)
            });
            setGiveawayDeleteModal({ isOpen: false, slotId: null });
        }
    };

    const deleteHistoryRecord = (recordId) => {
        if (window.confirm('¿Eliminar este registro del historial?')) {
            setWinnerHistory(winnerHistory.filter(r => r.id !== recordId));
        }
    };

    const updatePrize = (recordId, newPrize) => {
        setWinnerHistory(winnerHistory.map(r => r.id === recordId ? { ...r, prize: newPrize } : r));
    };

    const clearWinner = (slotId) => {
        setDailyGiveaways({
            ...dailyGiveaways,
            slots: dailyGiveaways.slots.map(s => s.id === slotId ? { ...s, winner: null } : s)
        });
    };

    const filteredWinnerCandidates = users.filter(user => (user.nickname?.toLowerCase() || '').includes(winnerSearchQuery.toLowerCase()));

    // --- Monthly Winners Handlers ---
    const updateMonthlyPoints = (id, points) => {
        setMonthlyWinners(monthlyWinners.map(s => s.id === id ? { ...s, points } : s));
    };

    const clearMonthlyWinner = (id) => {
        const slot = monthlyWinners.find(s => s.id === id);
        if (!slot.winner) return;

        setUserConfirmation({
            isOpen: true,
            type: 'MONTHLY_CLEAR',
            data: { slotId: id, winnerName: slot.winner.nickname }
        });
    };

    const openMonthlySearch = (id) => {
        setSelectedMonthlyId(id);
        setIsWinnerSearchOpen('monthly-' + id);
        setWinnerSearchQuery('');
    };

    const toggleMonthlyEdit = (id) => {
        setEditingMonthlyWinners(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleMonthlyUserChange = (id) => {
        setChangingMonthlyUser(prev => ({ ...prev, [id]: !prev[id] }));
        if (!changingMonthlyUser[id]) {
            // If starting to change, open search immediately?
            // Optional: for now just show the input field
        } else {
            // Cancel change
            setIsWinnerSearchOpen(null);
            setSelectedMonthlyId(null);
        }
    };

    const handleMonthlyPointSaveClick = (slot) => {
        setUserConfirmation({
            isOpen: true,
            type: 'MONTHLY_POINTS_SAVE',
            data: { slotId: slot.id, points: slot.points }
        });
    };

    const toggleSubtitleEdit = () => {
        setIsEditingSubtitle(!isEditingSubtitle);
    };

    const handleSubtitleSaveClick = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'SUBTITLE_SAVE',
            data: { subtitle: monthlySubtitle } // logic uses current state as it's synced, but good for context
        });
    };

    const handleSubtitleClearClick = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'SUBTITLE_CLEAR',
            data: {}
        });
    };



    const handleAnnouncementSaveClick = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'ANNOUNCEMENT_SAVE',
            data: {
                text: tempAnnouncementText,
                visible: tempAnnouncementVisible,
                config: tempAnnouncementConfig
            }
        });
    };

    // --- Benefits Manager Helpers ---
    const startEditingBenefitsTitle = () => {
        setTempBenefitsTitle(benefitsTitle);
        setIsEditingBenefitsTitle(true);
    };

    const cancelBenefitsTitleEdit = () => {
        setTempBenefitsTitle('');
        setIsEditingBenefitsTitle(false);
    };

    const handleBenefitsTitleSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'BENEFITS_TITLE_SAVE',
            data: {}
        });
    };

    const startEditingBenefitsText = () => {
        setTempBenefitsText(benefitsText);
        setIsEditingBenefitsText(true);
    };

    const cancelBenefitsTextEdit = () => {
        setTempBenefitsText('');
        setIsEditingBenefitsText(false);
    };

    const handleBenefitsTextSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'BENEFITS_TEXT_SAVE',
            data: {}
        });
    };

    const handleBenefitsFontSizeChange = (type, increment) => {
        if (type === 'title') {
            const newSize = Math.max(12, Math.min(48, benefitsTitleFontSize + increment));
            setBenefitsTitleFontSize(newSize);
        } else {
            const newSize = Math.max(10, Math.min(32, benefitsTextFontSize + increment));
            setBenefitsTextFontSize(newSize);
        }
    };

    // --- QR Manager ---
    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrs({ ...qrs, [type]: reader.result }); // Save as Base64
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Display Manager Helpers ---
    const startEditingDisplay = () => {
        setTempDisplayConfig({ ...displayConfig });
        setIsEditingDisplay(true);
    };

    const cancelEditingDisplay = () => {
        setTempDisplayConfig({
            logo: null,
            scale: 1,
            x: 0,
            y: 0
        });
        setIsEditingDisplay(false);
    };

    const handleDisplaySave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'DISPLAY_CONFIG_SAVE',
            data: {}
        });
    };

    const handleDisplayLogoUpload = (e) => {
        if (!isEditingDisplay) return; // Only allow upload in edit mode
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempDisplayConfig({ ...tempDisplayConfig, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const updateDisplayScale = (increment) => {
        if (!isEditingDisplay) return;
        // Limit scale between 0.2 and 5.0
        const currentScale = tempDisplayConfig.scale;
        const newScale = Math.max(0.2, Math.min(5.0, currentScale + increment));
        setTempDisplayConfig({ ...tempDisplayConfig, scale: parseFloat(newScale.toFixed(2)) });
    };

    const updateDisplayPosition = (axis, change) => {
        if (!isEditingDisplay) return;
        // Axis: 'x' or 'y'
        setTempDisplayConfig({ ...tempDisplayConfig, [axis]: tempDisplayConfig[axis] + change });
    };

    const resetDisplayConfig = () => {
        // Reset only affects temp state if editing, or main state? 
        // Better to be an edit action.
        if (!isEditingDisplay) return;
        if (window.confirm('¿Restablecer configuración de imagen por defecto (Temp)?')) {
            setTempDisplayConfig({ logo: null, scale: 1, x: 0, y: 0 });
        }
    };

    // --- Title Manager Helpers ---
    const startEditingTitle = () => {
        setTempTitleConfig({ ...titleConfig });
        setIsEditingTitle(true);
    };

    const cancelEditingTitle = () => {
        setTempTitleConfig({
            text: 'GAMING CENTER ARCADIA',
            scale: 1,
            x: 0,
            y: 0
        });
        setIsEditingTitle(false);
    };

    const handleTitleSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'TITLE_CONFIG_SAVE',
            data: {}
        });
    };

    const updateTitleScale = (increment) => {
        if (!isEditingTitle) return;
        const currentScale = tempTitleConfig.scale;
        const newScale = Math.max(0.5, Math.min(3.0, currentScale + increment));
        setTempTitleConfig({ ...tempTitleConfig, scale: parseFloat(newScale.toFixed(2)) });
    };

    const updateTitlePosition = (axis, change) => {
        if (!isEditingTitle) return;
        setTempTitleConfig({ ...tempTitleConfig, [axis]: tempTitleConfig[axis] + change });
    };

    const updateTitleText = (newText) => {
        if (!isEditingTitle) return;
        setTempTitleConfig({ ...tempTitleConfig, text: newText });
    };

    const resetTitleConfig = () => {
        if (!isEditingTitle) return;
        if (window.confirm('¿Restablecer configuración de título por defecto (Temp)?')) {
            setTempTitleConfig({ text: 'GAMING CENTER ARCADIA', scale: 1, x: 0, y: 0 });
        }
    };

    // --- Bottom Logo Manager Helpers ---
    const startEditingBottomLogo = () => {
        setTempBottomLogoConfig({ ...bottomLogoConfig });
        setIsEditingBottomLogo(true);
    };

    const cancelEditingBottomLogo = () => {
        setTempBottomLogoConfig({
            logo: null,
            scale: 1,
            x: 0,
            y: 0
        });
        setIsEditingBottomLogo(false);
    };

    const handleBottomLogoSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'BOTTOM_LOGO_CONFIG_SAVE',
            data: {}
        });
    };

    const handleBottomLogoUpload = async (e) => {
        if (!isEditingBottomLogo) return;
        const file = e.target.files[0];
        if (file) {
            try {
                const processed = await processImage(file);
                setTempBottomLogoConfig({ ...tempBottomLogoConfig, logo: processed });
            } catch (err) {
                console.error("Error processing image:", err);
                alert("Error al procesar la imagen (posiblemente corrupta).");
            }
        }
    };

    const updateBottomLogoScale = (increment) => {
        if (!isEditingBottomLogo) return;
        const currentScale = tempBottomLogoConfig.scale;
        const newScale = Math.max(0.2, Math.min(5.0, currentScale + increment));
        setTempBottomLogoConfig({ ...tempBottomLogoConfig, scale: parseFloat(newScale.toFixed(2)) });
    };

    const updateBottomLogoPosition = (axis, change) => {
        if (!isEditingBottomLogo) return;
        setTempBottomLogoConfig({ ...tempBottomLogoConfig, [axis]: tempBottomLogoConfig[axis] + change });
    };

    const resetBottomLogoConfig = () => {
        if (!isEditingBottomLogo) return;
        if (window.confirm('¿Restablecer configuración de logo inferior por defecto (Temp)?')) {
            setTempBottomLogoConfig({ logo: null, scale: 1, x: 0, y: 0 });
        }
    };

    // --- QR Panel Manager Helpers ---
    const startEditingQrPanel = () => {
        setTempQrPanelConfig({
            scale: qrPanelConfig?.scale ?? 1,
            x: qrPanelConfig?.x ?? 0,
            y: qrPanelConfig?.y ?? 0
        });
        setIsEditingQrPanel(true);
    };

    const cancelEditingQrPanel = () => {
        setIsEditingQrPanel(false);
    };

    const handleQrPanelSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'QR_PANEL_CONFIG_SAVE',
            data: {}
        });
    };

    const updateQrPanelScale = (increment) => {
        if (!isEditingQrPanel) return;
        const currentScale = tempQrPanelConfig.scale ?? 1;
        const newScale = Math.max(0.2, Math.min(5.0, currentScale + increment));
        setTempQrPanelConfig({ ...tempQrPanelConfig, scale: parseFloat(newScale.toFixed(2)) });
    };

    const updateQrPanelPosition = (axis, change) => {
        if (!isEditingQrPanel) return;
        const currentVal = tempQrPanelConfig[axis] ?? 0;
        setTempQrPanelConfig({ ...tempQrPanelConfig, [axis]: currentVal + change });
    };

    const resetQrPanelConfig = () => {
        if (!isEditingQrPanel) return;
        if (window.confirm('¿Restablecer configuración de panel QR por defecto (Temp)?')) {
            setTempQrPanelConfig({ scale: 1, x: 0, y: 0 });
        }
    };

    // --- Winner Panel Manager Helpers ---
    const startEditingWinnerPanel = () => {
        setTempWinnerPanelConfig({ ...winnerPanelConfig });
        setIsEditingWinnerPanel(true);
    };

    const cancelEditingWinnerPanel = () => {
        setTempWinnerPanelConfig({
            scale: 1,
            x: 0,
            y: 0
        });
        setIsEditingWinnerPanel(false);
    };

    const handleWinnerPanelSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'WINNER_PANEL_CONFIG_SAVE',
            data: {}
        });
    };

    const updateWinnerPanelScale = (increment) => {
        if (!isEditingWinnerPanel) return;
        const currentScale = tempWinnerPanelConfig.scale;
        const newScale = Math.max(0.2, Math.min(5.0, currentScale + increment));
        setTempWinnerPanelConfig({ ...tempWinnerPanelConfig, scale: parseFloat(newScale.toFixed(2)) });
    };

    const updateWinnerPanelPosition = (axis, change) => {
        if (!isEditingWinnerPanel) return;
        setTempWinnerPanelConfig({ ...tempWinnerPanelConfig, [axis]: tempWinnerPanelConfig[axis] + change });
    };

    const resetWinnerPanelConfig = () => {
        if (!isEditingWinnerPanel) return;
        if (window.confirm('¿Restablecer configuración de panel de ganadores por defecto (Temp)?')) {
            setTempWinnerPanelConfig({ scale: 1, x: 0, y: 0 });
        }
    };

    // --- Date/Time Manager Helpers ---
    const startEditingDateTime = () => {
        setTempDateTimeVisible(dateTimeVisible);
        setIsEditingDateTime(true);
    };

    const cancelEditingDateTime = () => {
        setIsEditingDateTime(false);
    };

    const handleDateTimeSave = () => {
        setUserConfirmation({
            isOpen: true,
            type: 'DATE_TIME_SAVE',
            data: { visible: tempDateTimeVisible }
        });
    };

    const renderMenu = () => (
        <div className={`absolute top-16 left-0 bg-slate-800 border border-slate-700 shadow-2xl rounded-br-xl z-50 overflow-hidden transition-all duration-300 ${isMenuOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
            <nav className="flex flex-col p-2">
                <button
                    onClick={() => { setCurrentView('users'); setIsMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded mb-1 transition flex items-center gap-2 ${currentView === 'users' ? 'bg-neon-pink/20 text-neon-pink' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <UsersIcon size={18} /> Gestión de Usuarios
                </button>
                <button
                    onClick={() => { setCurrentView('giveaways'); setIsMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded mb-1 transition flex items-center gap-2 ${currentView === 'giveaways' ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <Trophy size={18} /> Gestor de Sorteos Diarios
                </button>
                <button
                    onClick={() => { setCurrentView('display'); setIsMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded mb-1 transition flex items-center gap-2 ${currentView === 'display' ? 'bg-cyan-500/20 text-cyan-500' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <Monitor size={18} /> Administrador de Display
                </button>

                <button
                    onClick={() => { setCurrentView('qrs'); setIsMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded transition flex items-center gap-2 ${currentView === 'qrs' ? 'bg-green-500/20 text-green-400' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <QrCode size={18} /> Gestor de QRs
                </button>
                <button
                    onClick={() => { setCurrentView('monthly'); setIsMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded transition flex items-center gap-2 ${currentView === 'monthly' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <Trophy size={18} /> Gestor de Ganadores Mensuales
                </button>
                <button
                    onClick={() => { setCurrentView('announcement'); setIsMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded transition flex items-center gap-2 ${currentView === 'announcement' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <MessageSquare size={18} /> Anuncio
                </button>
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans relative">
            <header className="mb-8 flex items-center justify-between border-b border-slate-700 pb-4 relative z-50">
                <div className="flex items-center gap-4">
                    {/* --- Client Screen Menu --- */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsMenuOpen(!isMenuOpen); setIsTariffMenuOpen(false); setIsFinanceMenuOpen(false); }}
                            className={`text-slate-300 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition flex items-center gap-2 ${isMenuOpen ? 'bg-slate-800 text-white' : ''}`}
                        >
                            {isMenuOpen ? <X size={24} /> : <UsersIcon size={24} />}
                            <span className="font-bold text-sm hidden md:inline">Pantalla Cliente</span>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 shadow-xl rounded-lg z-50 overflow-hidden animate-fade-in">
                                <button
                                    onClick={() => { setCurrentView('users'); setIsMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors ${currentView === 'users' ? 'text-neon-blue bg-white/5' : ''}`}
                                >
                                    <UsersIcon size={18} className="text-neon-blue" /> Gestión de Usuarios
                                </button>
                                <button
                                    onClick={() => { setCurrentView('qrs'); setIsMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'qrs' ? 'text-green-400 bg-white/5' : ''}`}
                                >
                                    <QrCode size={18} className="text-green-400" /> Gestor de QRs
                                </button>
                                <button
                                    onClick={() => { setCurrentView('giveaways'); setIsMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'giveaways' ? 'text-yellow-400 bg-white/5' : ''}`}
                                >
                                    <Trophy size={18} className="text-yellow-400" /> Gestor de Sorteos Diarios
                                </button>
                                <button
                                    onClick={() => { setCurrentView('monthly'); setIsMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'monthly' ? 'text-purple-400 bg-white/5' : ''}`}
                                >
                                    <Trophy size={18} className="text-purple-400" /> Gestor de Ganadores Mensuales
                                </button>
                                <button
                                    onClick={() => { setCurrentView('announcement'); setIsMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'announcement' ? 'text-cyan-400 bg-white/5' : ''}`}
                                >
                                    <MessageSquare size={18} className="text-cyan-400" /> Anuncio
                                </button>
                                <button
                                    onClick={() => { setCurrentView('benefits'); setIsMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'benefits' ? 'text-pink-400 bg-white/5' : ''}`}
                                >
                                    <Trophy size={18} className="text-pink-400" /> Beneficios cliente
                                </button>
                                <button
                                    onClick={() => { setCurrentView('display'); setIsMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'display' ? 'text-cyan-400 bg-white/5' : ''}`}
                                >
                                    <Monitor size={18} className="text-cyan-400" /> Administrador de Display
                                </button>

                            </div>
                        )}
                    </div>

                    {/* --- Tariff Screen Menu --- */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsTariffMenuOpen(!isTariffMenuOpen); setIsMenuOpen(false); setIsFinanceMenuOpen(false); }}
                            className={`text-slate-300 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition flex items-center gap-2 ${isTariffMenuOpen ? 'bg-slate-800 text-white' : ''}`}
                        >
                            {isTariffMenuOpen ? <X size={24} /> : <Monitor size={24} />}
                            <span className="font-bold text-sm hidden md:inline">Pantalla Tarifario</span>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isTariffMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isTariffMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 shadow-xl rounded-lg z-50 overflow-hidden animate-fade-in">
                                <button
                                    onClick={() => { setCurrentView('tariff-images'); setIsTariffMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors ${currentView === 'tariff-images' ? 'text-purple-400 bg-white/5' : ''}`}
                                >
                                    <ImageIcon size={18} className="text-purple-400" />
                                    Gestor de Imágenes
                                </button>
                                <button
                                    onClick={() => { setCurrentView('tariff-banner'); setIsTariffMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'tariff-banner' ? 'text-cyan-400 bg-white/5' : ''}`}
                                >
                                    <Type size={18} className="text-cyan-400" />
                                    Banner Inferior
                                </button>
                                <button
                                    onClick={() => { setCurrentView('tariff-top-banner'); setIsTariffMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'tariff-top-banner' ? 'text-neon-pink bg-white/5' : ''}`}
                                >
                                    <Type size={18} className="text-neon-pink" />
                                    Banner Superior
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- Finance Control Menu --- */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsFinanceMenuOpen(!isFinanceMenuOpen); setIsMenuOpen(false); setIsTariffMenuOpen(false); }}
                            className={`text-slate-300 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition flex items-center gap-2 ${isFinanceMenuOpen ? 'bg-slate-800 text-white' : ''}`}
                        >
                            {isFinanceMenuOpen ? <X size={24} /> : <DollarSign size={24} />}
                            <span className="font-bold text-sm hidden md:inline">Control Financiero</span>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isFinanceMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isFinanceMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 shadow-xl rounded-lg z-50 overflow-hidden animate-fade-in">
                                <button
                                    onClick={() => { setCurrentView('finance-cash'); setIsFinanceMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors ${currentView === 'finance-cash' ? 'text-green-400 bg-white/5' : ''}`}
                                >
                                    <Package size={18} className="text-green-400" />
                                    Cajas
                                </button>
                                <button
                                    onClick={() => { setCurrentView('finance-snacks'); setIsFinanceMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'finance-snacks' ? 'text-yellow-400 bg-white/5' : ''}`}
                                >
                                    <Coffee size={18} className="text-yellow-400" />
                                    Golosinas
                                </button>
                                <button
                                    onClick={() => { setCurrentView('finance-services'); setIsFinanceMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'finance-services' ? 'text-blue-400 bg-white/5' : ''}`}
                                >
                                    <Briefcase size={18} className="text-blue-400" />
                                    Servicios
                                </button>
                                <button
                                    onClick={() => { setCurrentView('finance-banks'); setIsFinanceMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-200 transition-colors border-t border-slate-700/50 ${currentView === 'finance-banks' ? 'text-purple-400 bg-white/5' : ''}`}
                                >
                                    <Landmark size={18} className="text-purple-400" />
                                    Bancos
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-neon-blue hidden md:block">
                    Arcadia Admin Panel
                </h1>

                <div className="flex gap-4">
                    {/* Connection Status Indicator */}
                    <div
                        className={`flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg border transition-colors ${usersError ? 'border-red-500/50 hover:bg-red-500/10' : 'border-slate-700'}`}
                        title={usersError ? `Error: ${usersError.message || usersError}` : 'Conexión con Firebase estable'}
                        onClick={() => usersError && alert(`Error de Firebase:\n${usersError.message || JSON.stringify(usersError)}`)}
                    >
                        <div className={`w-2 h-2 rounded-full ${usersError ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${usersError ? 'text-red-400' : 'text-slate-400'}`}>
                            {usersError ? 'Error de Sincronización' : 'Firebase Online'}
                        </span>
                        {usersError && <AlertCircle size={12} className="text-red-400 animate-pulse" />}
                    </div>
                    <a href="/tarifario" target="_blank" className="text-sm bg-slate-800 px-4 py-2 rounded hover:bg-slate-700 transition flex items-center gap-2">
                        <Monitor size={16} /> Ver Pantalla Tarifario ↗
                    </a>
                    <a href="/display" target="_blank" className="text-sm bg-slate-800 px-4 py-2 rounded hover:bg-slate-700 transition">
                        Ver Pantalla Cliente ↗
                    </a>
                    <button
                        onClick={() => {
                            localStorage.removeItem('arcadia_is_authenticated');
                            navigate('/login');
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded transition-colors border border-red-500/20"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header >

            {/* --- Tariff Menu Dropdown Actions --- */}
            {/* Removed separate renderMenu call as it's now embedded in header dropdown */}

            {/* --- Tariff Menu Dropdown Actions --- */}
            {
                isTariffMenuOpen && (
                    <div className="absolute top-16 left-0 animate-fade-in z-50">
                        {/* The menu is rendered inside the button container in header, 
                        but we need to handle the view switching. 
                        The logic is already in the onClick handlers in the header. 
                    */}
                    </div>
                )
            }

            <div className="max-w-7xl mx-auto animate-fade-in">

                {/* --- Módulos Tarifario --- */}

                {/* --- Tariff Image Manager (Carousel) --- */}
                {currentView === 'tariff-images' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
                            <Image size={24} /> Gestor de Carrusel Tarifario
                        </h2>

                        <div className="space-y-8">
                            {/* List of Existing Images */}
                            {/* List of Existing Images */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {tariffImages.map((img, index) => (
                                    <div
                                        key={img.id || index}
                                        draggable
                                        onDragStart={() => setDraggedItemIndex(index)}
                                        onDragEnter={() => setDragOverIndex(index)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverIndex(null);
                                        }}
                                        onDrop={() => {
                                            if (draggedItemIndex === null || draggedItemIndex === index) {
                                                setDraggedItemIndex(null);
                                                setDragOverIndex(null);
                                                return;
                                            }
                                            const newImages = [...tariffImages];
                                            const draggedItem = newImages.splice(draggedItemIndex, 1)[0];
                                            newImages.splice(index, 0, draggedItem);
                                            setTariffImages(newImages);
                                            setDraggedItemIndex(null);
                                            setDragOverIndex(null);
                                        }}
                                        className={`bg-slate-900 rounded-xl overflow-hidden border transition-all duration-300 relative 
                                            ${draggedItemIndex === index
                                                ? 'opacity-40 scale-95 grayscale border-dashed border-2 border-slate-500'
                                                : dragOverIndex === index
                                                    ? 'scale-105 border-2 border-neon-pink shadow-[0_0_20px_rgba(255,0,255,0.3)] z-10'
                                                    : 'border-slate-700 hover:border-purple-500/50 hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div className="absolute top-2 right-2 z-20 flex gap-2">
                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTariffModal({
                                                        isOpen: true,
                                                        type: 'EDIT',
                                                        data: { ...img },
                                                        index: index
                                                    });
                                                }}
                                                className="bg-black/50 hover:bg-cyan-600 text-slate-300 hover:text-white p-1.5 rounded-full transition-colors"
                                                title="Editar Ajustes"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTariffModal({
                                                        isOpen: true,
                                                        type: 'DELETE',
                                                        data: { ...img },
                                                        index: index
                                                    });
                                                }}
                                                className="bg-black/50 hover:bg-red-500 text-slate-300 hover:text-white p-1.5 rounded-full transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="absolute top-2 left-2 z-20 cursor-move bg-black/50 p-1.5 rounded hover:bg-black/80 text-slate-300">
                                            <GripVertical size={16} />
                                        </div>

                                        <div className="relative aspect-[9/16] bg-black group selection:bg-transparent">
                                            <img src={img.src} alt={`Slide ${index + 1}`} className="w-full h-full object-contain select-none pointer-events-none" />
                                        </div>

                                        {/* Static Info Display - Cleaner Look */}
                                        <div className="p-3 bg-slate-900/50">
                                            <div className="flex justify-between items-center text-lg text-slate-400 font-bold">
                                                <span>{img.duration || 10}s</span>
                                                <div className="flex gap-1.5">
                                                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                                                        <span key={i} className={`${(img.activeDays?.includes(i) ?? true) ? 'text-purple-400 drop-shadow-sm' : 'text-slate-800'}`}>
                                                            {d}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Card */}
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl min-h-[14rem] p-6 hover:bg-slate-900 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                try {
                                                    const processed = await processImage(file);
                                                    const newImage = {
                                                        id: Date.now().toString(), // Simple ID
                                                        src: processed,
                                                        duration: 15, // Default 15s
                                                        activeDays: [0, 1, 2, 3, 4, 5, 6] // Default all days
                                                    };
                                                    setTariffImages([...tariffImages, newImage]);
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Error subiendo imagen");
                                                }
                                            }
                                        }}
                                    />
                                    <Plus size={48} className="text-slate-500 mb-2" />
                                    <span className="text-slate-400 font-bold">Agregar Imagen</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-700">
                                <a href="/tarifario" target="_blank" className="text-purple-400 hover:text-purple-300 flex items-center gap-2">
                                    <Monitor size={16} /> Ver Carrusel en Pantalla Completa ↗
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Tariff Banner Editor --- */}
                {currentView === 'tariff-banner' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
                            <Type size={24} /> Gestor de Banner Inferior
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-400">Lista de Banners</label>
                                    <button
                                        onClick={() => {
                                            const newBanner = { id: Date.now(), text: '', duration: 7, active: true };
                                            setTariffBanners([...tariffBanners, newBanner]);
                                            setEditingBannerId(newBanner.id); // Auto-edit new banner
                                        }}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                                    >
                                        <Plus size={16} /> Agregar Banner
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {tariffBanners.length === 0 && (
                                        <p className="text-slate-500 text-sm italic text-center py-4">No hay banners creados.</p>
                                    )}
                                    {tariffBanners.map((banner, index) => (
                                        <div key={banner.id} className="flex gap-2 items-center animate-fade-in-up bg-slate-900 border border-slate-700 p-2 rounded-lg">
                                            <span className="text-slate-500 text-xs font-mono w-4 text-center">{index + 1}</span>

                                            {/* Duration Input - Compact */}
                                            <div className="flex flex-col items-center bg-slate-800 rounded p-1 border border-slate-700">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">SEG</span>
                                                <input
                                                    type="number"
                                                    min="3"
                                                    value={banner.duration || 7}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 7;
                                                        const newBanners = [...tariffBanners];
                                                        newBanners[index].duration = val;
                                                        setTariffBanners(newBanners);
                                                    }}
                                                    className="w-10 bg-transparent text-center text-cyan-400 font-bold text-sm focus:outline-none"
                                                />
                                            </div>

                                            {/* Text Input - ReadOnly unless editing */}
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={banner.text}
                                                    readOnly={editingBannerId !== banner.id}
                                                    onChange={(e) => {
                                                        const newBanners = [...tariffBanners];
                                                        newBanners[index].text = e.target.value;
                                                        setTariffBanners(newBanners);
                                                    }}
                                                    placeholder="Escribe el texto del banner..."
                                                    className={`w-full bg-slate-800 border-b ${editingBannerId === banner.id ? 'border-cyan-500 text-white' : 'border-transparent text-slate-300'} px-3 py-2 text-sm focus:outline-none transition-colors ${!banner.active && 'opacity-50'}`}
                                                />
                                                {!banner.active && <div className="absolute inset-0 bg-slate-900/50 pointer-events-none" />}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                {/* Edit Toggle */}
                                                <button
                                                    onClick={() => setEditingBannerId(editingBannerId === banner.id ? null : banner.id)}
                                                    className={`p-2 transition ${editingBannerId === banner.id ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
                                                    title={editingBannerId === banner.id ? "Terminar Edición" : "Editar Texto"}
                                                >
                                                    {editingBannerId === banner.id ? <Check size={16} /> : <Pencil size={16} />}
                                                </button>

                                                {/* Active Toggle */}
                                                <button
                                                    onClick={() => {
                                                        const newBanners = [...tariffBanners];
                                                        newBanners[index].active = !newBanners[index].active;
                                                        setTariffBanners(newBanners);
                                                    }}
                                                    className={`p-2 transition ${banner.active !== false ? 'text-green-400 hover:text-green-300' : 'text-slate-600 hover:text-slate-400'}`}
                                                    title={banner.active !== false ? "Desactivar Banner" : "Activar Banner"}
                                                >
                                                    {banner.active !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => {
                                                        const newBanners = tariffBanners.filter(b => b.id !== banner.id);
                                                        setTariffBanners(newBanners);
                                                    }}
                                                    className="text-slate-500 hover:text-red-400 p-2 transition"
                                                    title="Eliminar Banner"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 mb-2">Vista Previa (Secuencial 3s)</h3>
                                <BannerPreview banners={tariffBanners} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Tariff Top Banner Editor --- */}
                {currentView === 'tariff-top-banner' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-neon-pink">
                            <Type size={24} /> Gestor de Banner Superior
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-400">Lista de Banners Superiores</label>
                                    <button
                                        onClick={() => {
                                            const newBanner = { id: Date.now(), text: '', duration: 7, active: true };
                                            setTariffTopBanners([...tariffTopBanners, newBanner]);
                                            setEditingTopBannerId(newBanner.id); // Auto-edit new banner
                                        }}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                                    >
                                        <Plus size={16} /> Agregar Banner
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {tariffTopBanners.length === 0 && (
                                        <p className="text-slate-500 text-sm italic text-center py-4">No hay banners creados.</p>
                                    )}
                                    {tariffTopBanners.map((banner, index) => (
                                        <div key={banner.id} className="flex gap-2 items-center animate-fade-in-up bg-slate-900 border border-slate-700 p-2 rounded-lg">
                                            <span className="text-slate-500 text-xs font-mono w-4 text-center">{index + 1}</span>

                                            {/* Duration Input - Compact */}
                                            <div className="flex flex-col items-center bg-slate-800 rounded p-1 border border-slate-700">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">SEG</span>
                                                <input
                                                    type="number"
                                                    min="3"
                                                    value={banner.duration || 7}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 7;
                                                        const newBanners = [...tariffTopBanners];
                                                        newBanners[index].duration = val;
                                                        setTariffTopBanners(newBanners);
                                                    }}
                                                    className="w-10 bg-transparent text-center text-neon-pink font-bold text-sm focus:outline-none"
                                                />
                                            </div>

                                            {/* Text Input - ReadOnly unless editing */}
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={banner.text}
                                                    readOnly={editingTopBannerId !== banner.id}
                                                    onChange={(e) => {
                                                        const newBanners = [...tariffTopBanners];
                                                        newBanners[index].text = e.target.value;
                                                        setTariffTopBanners(newBanners);
                                                    }}
                                                    placeholder="Escribe el texto del banner superior..."
                                                    className={`w-full bg-slate-800 border-b ${editingTopBannerId === banner.id ? 'border-neon-pink text-white' : 'border-transparent text-slate-300'} px-3 py-2 text-sm focus:outline-none transition-colors ${!banner.active && 'opacity-50'}`}
                                                />
                                                {!banner.active && <div className="absolute inset-0 bg-slate-900/50 pointer-events-none" />}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                {/* Edit Toggle */}
                                                <button
                                                    onClick={() => setEditingTopBannerId(editingTopBannerId === banner.id ? null : banner.id)}
                                                    className={`p-2 transition ${editingTopBannerId === banner.id ? 'text-neon-pink hover:text-pink-400' : 'text-slate-500 hover:text-slate-300'}`}
                                                    title={editingTopBannerId === banner.id ? "Terminar Edición" : "Editar Texto"}
                                                >
                                                    {editingTopBannerId === banner.id ? <Check size={16} /> : <Pencil size={16} />}
                                                </button>

                                                {/* Active Toggle */}
                                                <button
                                                    onClick={() => {
                                                        const newBanners = [...tariffTopBanners];
                                                        newBanners[index].active = !newBanners[index].active;
                                                        setTariffTopBanners(newBanners);
                                                    }}
                                                    className={`p-2 transition ${banner.active !== false ? 'text-green-400 hover:text-green-300' : 'text-slate-600 hover:text-slate-400'}`}
                                                    title={banner.active !== false ? "Desactivar Banner" : "Activar Banner"}
                                                >
                                                    {banner.active !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => {
                                                        const newBanners = tariffTopBanners.filter(b => b.id !== banner.id);
                                                        setTariffTopBanners(newBanners);
                                                    }}
                                                    className="text-slate-500 hover:text-red-400 p-2 transition"
                                                    title="Eliminar Banner"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 mb-2">Vista Previa (Secuencial 3s)</h3>
                                <div className="bg-black p-4 border-t-4 border-neon-pink shadow-lg flex items-center justify-center overflow-hidden h-20">
                                    <BannerPreview banners={tariffTopBanners} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- User Management Module --- */}
                {currentView === 'users' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 flex items-center justify-between text-neon-pink">
                            <div className="flex items-center gap-2">
                                <UsersIcon size={20} /> Gestión de Usuarios
                            </div>
                            <span className={`text-sm font-mono ${users.length >= 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                                {users.length} / 1000
                            </span>
                        </h2>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm flex items-center gap-2">
                                <span className="font-bold">!</span> {errorMsg}
                            </div>
                        )}

                        {/* Add User Form */}
                        <form onSubmit={editingUserId ? handleUpdateUser : addUser} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                placeholder="Nombre Real"
                                className="bg-slate-900 border border-slate-700 px-3 py-2 rounded w-full focus:outline-none focus:border-neon-pink"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Nickname"
                                className="bg-slate-900 border border-slate-700 px-3 py-2 rounded w-full focus:outline-none focus:border-neon-pink"
                                value={newUser.nickname}
                                onChange={(e) => setNewUser({ ...newUser, nickname: e.target.value })}
                            />
                            {editingUserId ? (
                                <>
                                    <button type="submit" className="bg-green-500 text-black font-bold px-4 py-2 rounded hover:brightness-110" title="Update User">
                                        <Save size={20} />
                                    </button>
                                    <button type="button" onClick={cancelEdit} className="bg-slate-600 text-white font-bold px-4 py-2 rounded hover:bg-slate-500" title="Cancel Edit">
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <button type="submit" className="bg-neon-pink text-black font-bold px-4 py-2 rounded hover:brightness-110" title="Add User">
                                    <Plus size={20} />
                                </button>
                            )}
                        </form>

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-400">Importar/Exportar Usuarios</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExcelExport}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition shadow-lg"
                                    title="Descargar lista de usuarios"
                                >
                                    <Download size={16} /> Exportar
                                </button>
                                <button
                                    onClick={handleDeleteAllClick}
                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition shadow-lg"
                                    title="Eliminar todos los usuarios"
                                >
                                    <Trash2 size={16} /> Eliminar Todo
                                </button>
                                <label className="cursor-pointer bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition shadow-lg">
                                    <Upload size={16} /> Importar Excel
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        className="hidden"
                                        onChange={handleExcelUpload}
                                    />
                                </label>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 italic">
                            * El archivo Excel debe tener las columnas: <strong>USUARIO</strong> y <strong>NOMBRE</strong> en la primera fila.
                        </p>

                        {/* Search */}
                        <input
                            type="search"
                            placeholder="Buscar usuario..."
                            className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded mb-4 focus:outline-none focus:border-neon-blue"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* List */}
                        <div className="h-[600px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                                    {/* Info Col */}
                                    <div className="w-1/3">
                                        <div className="font-bold truncate" title={user.nickname}>{user.nickname}</div>
                                        <div className="text-xs text-slate-400 truncate" title={user.name}>{user.name}</div>
                                    </div>
                                    {/* Date Col */}
                                    <div className="flex-1 text-center text-xs sm:text-sm text-slate-300 font-mono">
                                        {new Date(Number(user.id)).toLocaleString()}
                                    </div>
                                    {/* Buttons Col */}
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => startEditing(user)} className="text-blue-400 hover:text-blue-300" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => deleteUser(user.id)} className="text-red-400 hover:text-red-300" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && <p className="text-slate-500 text-center py-4">No users found.</p>}
                        </div>
                    </div>
                )}

                {/* --- Daily Giveaway Manager Module --- */}
                {currentView === 'giveaways' && (
                    <div className={`bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg ${!dailyGiveaways.active ? 'opacity-75' : ''}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-500">
                                    <Trophy size={20} /> Gestor de Sorteos Diarios
                                </h2>
                                {/* Toggle Switch - Synchronized */}
                                <div
                                    onClick={() => {
                                        const newState = !winnersPanelVisible;
                                        setWinnersPanelVisible(newState);
                                        setDailyGiveaways({ ...dailyGiveaways, active: newState });
                                    }}
                                    className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 shadow-inner ${winnersPanelVisible ? 'bg-green-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${winnersPanelVisible ? 'translate-x-7' : 'translate-x-0'}`} />
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white pointer-events-none uppercase tracking-wider select-none">
                                        {winnersPanelVisible ? 'ON' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {dailyGiveaways.slots
                                .sort((a, b) => a.id - b.id)
                                .map((slot, index) => {
                                    // Helper for 12h format display
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
                                        <div key={slot.id} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="text-sm font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    Sorteo #{index + 1}
                                                    {/* Show AM/PM preview */}
                                                    {slot.time && <span className="text-neon-blue font-bold">({formatTime12h(slot.time)})</span>}

                                                    {/* Delete Button (Only for extra slots, index >= 2) */}
                                                    {index >= 2 && (
                                                        <div className="flex items-center gap-4 ml-4">
                                                            <button
                                                                onClick={() => deleteGiveawaySlot(slot.id)}
                                                                className="text-slate-500 hover:text-red-400 transition hover:bg-slate-700 p-1 rounded"
                                                                title="Eliminar Sorteo"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-lg">
                                                    {/* Logic to parse current time */}
                                                    {(() => {
                                                        const [h24, m] = (slot.time || '12:00').split(':');
                                                        const hour24 = parseInt(h24, 10);
                                                        const isPM = hour24 >= 12;
                                                        const hour12 = hour24 % 12 || 12;

                                                        const updateTime = (newH12, newM, newIsPM) => {
                                                            let finalH = parseInt(newH12, 10);
                                                            if (newIsPM && finalH !== 12) finalH += 12;
                                                            if (!newIsPM && finalH === 12) finalH = 0;
                                                            updateSlotTime(slot.id, `${finalH.toString().padStart(2, '0')}:${newM}`);
                                                        };

                                                        return (
                                                            <>
                                                                {/* Hour Select */}
                                                                <select
                                                                    className="bg-transparent text-xl font-bold text-white focus:outline-none appearance-none text-center w-12 cursor-pointer hover:text-yellow-500 transition-colors"
                                                                    value={hour12}
                                                                    disabled={!dailyGiveaways.active}
                                                                    onChange={(e) => updateTime(e.target.value, m, isPM)}
                                                                >
                                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                                                        <option key={h} value={h} className="bg-slate-800">{h}</option>
                                                                    ))}
                                                                </select>
                                                                <span className="text-slate-500 font-bold">:</span>
                                                                {/* Minute Select */}
                                                                <select
                                                                    className="bg-transparent text-xl font-bold text-white focus:outline-none appearance-none text-center w-12 cursor-pointer hover:text-yellow-500 transition-colors"
                                                                    value={m}
                                                                    disabled={!dailyGiveaways.active}
                                                                    onChange={(e) => updateTime(hour12, e.target.value, isPM)}
                                                                >
                                                                    {['00', '15', '30', '45'].map(min => (
                                                                        <option key={min} value={min} className="bg-slate-800">{min}</option>
                                                                    ))}
                                                                </select>
                                                                {/* AM/PM Toggle */}
                                                                <button
                                                                    onClick={() => updateTime(hour12, m, !isPM)}
                                                                    disabled={!dailyGiveaways.active}
                                                                    className={`px-2 py-1 rounded text-sm font-bold ml-1 transition-colors ${isPM ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-400'} hover:bg-white/10`}
                                                                >
                                                                    {isPM ? 'PM' : 'AM'}
                                                                </button>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {slot.winner ? (
                                                <div className="flex justify-between items-center bg-green-500/10 border border-green-500/30 p-3 rounded animate-fade-in">
                                                    <div>
                                                        <div className="text-xs text-green-400 font-bold uppercase">Ganador Seleccionado</div>
                                                        <div className="text-lg font-bold text-white flex items-center gap-2">
                                                            {slot.winner.nickname}
                                                            <span className="text-xs font-normal text-slate-400">({slot.winner.name})</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => clearWinner(slot.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-slate-700 rounded transition" title="Reset Winner">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 relative">
                                                    {selectedSlotId === slot.id && pendingWinner ? (
                                                        <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 p-2 rounded">
                                                            <div>
                                                                <span className="text-xs text-yellow-500 block">Confirmar Ganador?</span>
                                                                <span className="font-bold">{pendingWinner.nickname}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => confirmWinner(slot.id)} className="bg-green-500 text-black px-3 py-1 rounded text-sm font-bold hover:brightness-110">OK</button>
                                                                <button onClick={() => { setPendingWinner(null); setSelectedSlotId(null); }} className="bg-slate-600 px-3 py-1 rounded text-sm hover:bg-slate-500">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder={`Seleccionar Ganador Sorteo #${slot.id}...`}
                                                                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded focus:outline-none focus:border-yellow-500 placeholder:text-slate-600 disabled:opacity-50"
                                                                value={selectedSlotId === slot.id ? winnerSearchQuery : ''}
                                                                onFocus={() => openWinnerSearch(slot.id)}
                                                                onChange={(e) => setWinnerSearchQuery(e.target.value)}
                                                                disabled={!dailyGiveaways.active}
                                                            />
                                                            {selectedSlotId === slot.id && (
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Dropdown Results */}
                                                    {isWinnerSearchOpen === slot.id && winnerSearchQuery && dailyGiveaways.active && (
                                                        <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded mt-1 z-50 max-h-40 overflow-y-auto shadow-xl">
                                                            {filteredWinnerCandidates.length > 0 ? (
                                                                filteredWinnerCandidates.map(u => (
                                                                    <div
                                                                        key={u.id}
                                                                        className="p-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
                                                                        onClick={() => selectCandidate(u)}
                                                                    >
                                                                        <div className="font-bold text-sm text-white">{u.nickname}</div>
                                                                        <div className="text-xs text-slate-400">{u.name}</div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="p-2 text-slate-500 text-sm">No users found</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                            {/* Add Slot Button */}
                            <button
                                onClick={addGiveawaySlot}
                                className="w-full py-4 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-green-400 hover:border-green-400 hover:bg-slate-800/50 transition group"
                            >
                                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="ml-2 font-bold uppercase tracking-wider">Agregar Nuevo Sorteo</span>
                            </button>
                        </div>

                        {/* --- Winner History Table --- */}
                        <div className="mt-8 border-t border-slate-700 pt-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                                    <UsersIcon size={18} /> Historial de Ganadores
                                </h3>
                                <div className="text-sm font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-700">
                                    Total: <span className="text-neon-pink font-bold">{winnerHistory.length}</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-700">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-700/50 text-slate-200 uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Fecha / Hora</th>
                                            <th className="px-4 py-3">Día</th>
                                            <th className="px-4 py-3">Ganador</th>
                                            <th className="px-4 py-3">Premio</th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {winnerHistory.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-700/30 transition">
                                                <td className="px-4 py-3 font-mono text-xs">{record.selectionTime}</td>
                                                <td className="px-4 py-3 text-xs uppercase text-slate-300 font-bold">
                                                    {new Date(record.timestamp).toLocaleDateString('es-ES', { weekday: 'long' })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-white">{record.user.nickname}</div>
                                                    <div className="text-xs text-slate-500">{record.user.name}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {editingPrizeId === record.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={record.prize}
                                                                onChange={(e) => updatePrize(record.id, e.target.value)}
                                                                className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-neon-pink focus:outline-none"
                                                            >
                                                                <option value="Pendiente">Pendiente</option>
                                                                <option value="Galleta">Galleta</option>
                                                                <option value="Helado">Helado</option>
                                                                <option value="Gaseosa">Gaseosa</option>
                                                                <option value="No Entregado">No Entregado</option>
                                                                <option value="Otro">Otro</option>
                                                            </select>
                                                            <button
                                                                onClick={() => setEditingPrizeId(null)}
                                                                className="text-green-400 hover:text-green-300 p-1 hover:bg-slate-700 rounded transition"
                                                                title="Guardar"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 group">
                                                            <span className={`text-xs font-bold ${record.prize === 'Pendiente' ? 'text-yellow-400' : record.prize === 'No Entregado' ? 'text-red-400' : 'text-slate-300'}`}>
                                                                {record.prize}
                                                            </span>
                                                            <button
                                                                onClick={() => setEditingPrizeId(record.id)}
                                                                className="text-blue-400 hover:text-blue-300 p-1 opacity-0 group-hover:opacity-100 transition hover:bg-slate-700 rounded"
                                                                title="Editar Premio"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => deleteHistoryRecord(record.id)}
                                                        className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-700 rounded transition"
                                                        title="Eliminar Registro"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {winnerHistory.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center italic text-slate-500">
                                                    No hay historial de ganadores aún.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- Monthly Prize Statistics --- */}
                        <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
                                <Trophy size={20} /> Estadísticas Mensuales
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(() => {
                                    const stats = {};
                                    // Aggregate data
                                    winnerHistory.forEach(record => {
                                        // Use timestamp if available, else parsed selectionTime (less reliable but fallback)
                                        const d = record.timestamp ? new Date(record.timestamp) : new Date();
                                        const key = `${d.getFullYear()}-${d.getMonth()}`;
                                        if (!stats[key]) {
                                            stats[key] = { date: d, total: 0, prizes: {} };
                                        }
                                        const p = record.prize || 'Pendiente';
                                        // Only count "delivered" prizes in the total
                                        if (p !== 'Pendiente' && p !== 'No Entregado') {
                                            stats[key].total++;
                                        }
                                        stats[key].prizes[p] = (stats[key].prizes[p] || 0) + 1;
                                    });

                                    // Sort by date descending (newest first) and take top 3
                                    const sortedStats = Object.values(stats)
                                        .sort((a, b) => b.date - a.date)
                                        .slice(0, 3);

                                    if (sortedStats.length === 0) {
                                        return <div className="text-slate-500 italic col-span-3 text-center py-4">No hay datos suficientes aún.</div>;
                                    }

                                    return sortedStats.map((stat, idx) => (
                                        <div key={idx} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 hover:border-purple-500/50 transition">
                                            <h3 className="text-lg font-bold text-white capitalize mb-2 border-b border-slate-600 pb-2 flex justify-between">
                                                {stat.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 self-center">
                                                    {(idx === 0) ? 'Actual' : 'Pasado'}
                                                </span>
                                            </h3>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-slate-400 text-sm uppercase font-bold">Total Premios</span>
                                                <span className="text-2xl font-bold text-green-400">{stat.total}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {Object.entries(stat.prizes)
                                                    .sort(([, a], [, b]) => b - a) // Sort by count descending
                                                    .map(([prize, count]) => (
                                                        <div key={prize} className="flex justify-between text-sm bg-slate-800/50 px-2 py-1 rounded">
                                                            <span className={prize === 'Pendiente' ? 'text-yellow-400 font-bold' : prize === 'No Entregado' ? 'text-red-400' : 'text-slate-300'}>
                                                                {prize}
                                                            </span>
                                                            <span className="text-white font-mono font-bold">{count}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- QR Manager Module --- */}
                {currentView === 'qrs' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                            <QrCode size={20} /> Gestor de QRs
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* WiFi Section */}
                            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
                                        <Wifi size={16} /> WiFi Config
                                    </h3>
                                    {!isEditingWifi && (
                                        <button onClick={() => setIsEditingWifi(true)} className="text-slate-400 hover:text-green-400" title="Edit WiFi Config">
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs uppercase text-slate-400 mb-1">QR Image</label>
                                    <label className="cursor-pointer flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-600 rounded hover:border-green-400 transition bg-slate-800/50">
                                        {qrs.wifi ? (
                                            <div className="relative group w-full h-full p-2">
                                                <img src={qrs.wifi} alt="WiFi QR" className="w-full h-full object-contain" />
                                                {isEditingWifi && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                        <span className="text-xs text-white">Click to Change</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-2">
                                                <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                                                <span className="text-xs text-slate-400">Upload WiFi QR</span>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" disabled={!isEditingWifi} onChange={(e) => handleFileUpload(e, 'wifi')} />
                                    </label>
                                </div>

                                {isEditingWifi ? (
                                    <div className="space-y-3 animate-fade-in">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Network Name (SSID)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-sm focus:border-green-400 focus:outline-none"
                                                placeholder="e.g. Arcadia_5G"
                                                value={wifiForm.ssid}
                                                onChange={(e) => setWifiForm({ ...wifiForm, ssid: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Password</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-sm focus:border-green-400 focus:outline-none"
                                                placeholder="Network Password"
                                                value={wifiForm.password}
                                                onChange={(e) => setWifiForm({ ...wifiForm, password: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={handleWifiSave} className="flex-1 bg-green-500 text-black text-sm font-bold py-1.5 rounded hover:brightness-110 flex justify-center items-center gap-1">
                                                <Save size={14} /> Save
                                            </button>
                                            <button onClick={handleWifiCancel} className="bg-slate-600 text-white text-sm font-bold px-3 py-1.5 rounded hover:bg-slate-500">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <span className="block text-[10px] text-slate-500 uppercase">SSID</span>
                                            <div className="font-mono text-sm text-green-300 truncate">{qrs.ssid || 'Not Set'}</div>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <span className="block text-[10px] text-slate-500 uppercase">Password</span>
                                            <div className="font-mono text-sm text-slate-300 truncate">{qrs.password || 'Not Set'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* WhatsApp Section */}
                            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
                                        <MessageCircle size={16} /> WhatsApp Config
                                    </h3>
                                    {!isEditingWhatsapp && (
                                        <button onClick={() => setIsEditingWhatsapp(true)} className="text-slate-400 hover:text-green-400" title="Edit WhatsApp Config">
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs uppercase text-slate-400 mb-1">QR Image</label>
                                    <label className="cursor-pointer flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-600 rounded hover:border-green-400 transition bg-slate-800/50">
                                        {qrs.whatsapp ? (
                                            <div className="relative group w-full h-full p-2">
                                                <img src={qrs.whatsapp} alt="WA QR" className="w-full h-full object-contain" />
                                                {isEditingWhatsapp && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                        <span className="text-xs text-white">Click to Change</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-2">
                                                <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                                                <span className="text-xs text-slate-400">Upload WhatsApp QR</span>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" disabled={!isEditingWhatsapp} onChange={(e) => handleFileUpload(e, 'whatsapp')} />
                                    </label>
                                </div>

                                {isEditingWhatsapp ? (
                                    <div className="space-y-3 animate-fade-in">
                                        <div>
                                            <label className="block text-xs uppercase text-slate-400 mb-1">Display Message</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-sm focus:border-green-400 focus:outline-none resize-none"
                                                placeholder="Enter the text to display below the WhatsApp QR..."
                                                value={whatsappForm.message}
                                                onChange={(e) => setWhatsappForm({ ...whatsappForm, message: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={handleWhatsappSave} className="flex-1 bg-green-500 text-black text-sm font-bold py-1.5 rounded hover:brightness-110 flex justify-center items-center gap-1">
                                                <Save size={14} /> Save
                                            </button>
                                            <button onClick={handleWhatsappCancel} className="bg-slate-600 text-white text-sm font-bold px-3 py-1.5 rounded hover:bg-slate-500">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <span className="block text-[10px] text-slate-500 uppercase">Display Message</span>
                                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{qrs.whatsappMessage || 'Not Set'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'display' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-green-400">
                                    <QrCode size={24} /> Administrador de Panel QR
                                </h2>
                                <div
                                    onClick={() => setQrPanelVisible(!qrPanelVisible)}
                                    className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 shadow-inner ${qrPanelVisible ? 'bg-green-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${qrPanelVisible ? 'translate-x-7' : 'translate-x-0'}`} />
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white pointer-events-none uppercase tracking-wider select-none">
                                        {qrPanelVisible ? 'ON' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!isEditingQrPanel ? (
                                    <button
                                        onClick={startEditingQrPanel}
                                        className="text-xs bg-green-600 px-3 py-1 rounded text-black font-bold hover:bg-green-500 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                    >
                                        <Edit2 size={14} /> Editar
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleQrPanelSave}
                                            className="text-xs bg-green-500 px-3 py-1 rounded text-black font-bold hover:bg-green-400 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                        >
                                            <Save size={14} /> Guardar
                                        </button>
                                        <button
                                            onClick={cancelEditingQrPanel}
                                            className="text-xs bg-slate-700 px-3 py-1 rounded text-red-400 hover:text-red-300 hover:bg-slate-600 transition flex items-center gap-1"
                                        >
                                            <X size={14} /> Cancelar
                                        </button>
                                        <button
                                            onClick={resetQrPanelConfig}
                                            className="text-xs bg-red-900/50 px-3 py-1 rounded text-red-300 hover:text-white hover:bg-red-600 transition border border-red-500/30"
                                        >
                                            Restablecer
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className={`space-y-6 transition-opacity duration-300 ${!isEditingQrPanel ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                {/* Scaling */}
                                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                    <label className="block text-xs uppercase text-slate-400 mb-3 font-bold flex justify-between">
                                        Escala (Tamaño)
                                        <span className="text-green-400">{isEditingQrPanel ? tempQrPanelConfig.scale : qrPanelConfig.scale}x</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => updateQrPanelScale(-0.1)}
                                            className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                        >-</button>
                                        <input
                                            type="range"
                                            min="0.2"
                                            max="3"
                                            step="0.1"
                                            value={isEditingQrPanel ? tempQrPanelConfig.scale : qrPanelConfig.scale}
                                            onChange={(e) => isEditingQrPanel && setTempQrPanelConfig({ ...tempQrPanelConfig, scale: parseFloat(e.target.value) })}
                                            className="w-full accent-green-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer"
                                            disabled={!isEditingQrPanel}
                                        />
                                        <button
                                            onClick={() => updateQrPanelScale(0.1)}
                                            className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                        >+</button>
                                    </div>
                                </div>

                                {/* Positioning */}
                                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                    <label className="block text-xs uppercase text-slate-400 mb-4 font-bold">
                                        Posición (X: {isEditingQrPanel ? tempQrPanelConfig.x : qrPanelConfig.x}, Y: {isEditingQrPanel ? tempQrPanelConfig.y : qrPanelConfig.y})
                                    </label>
                                    <div className="flex flex-col items-center gap-2">
                                        <button onClick={() => updateQrPanelPosition('y', -10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                            <ChevronDown size={20} className="rotate-180" />
                                        </button>
                                        <div className="flex gap-10">
                                            <button onClick={() => updateQrPanelPosition('x', -10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                                <ChevronDown size={20} className="rotate-90" />
                                            </button>
                                            <div className="w-10 h-10 bg-green-500/20 rounded-full border border-green-500/50 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            </div>
                                            <button onClick={() => updateQrPanelPosition('x', 10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                                <ChevronDown size={20} className="-rotate-90" />
                                            </button>
                                        </div>
                                        <button onClick={() => updateQrPanelPosition('y', 10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                            <ChevronDown size={20} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Eje Horizontal (X)</span>
                                            <input
                                                type="number"
                                                value={isEditingQrPanel ? tempQrPanelConfig.x : qrPanelConfig.x}
                                                onChange={(e) => isEditingQrPanel && setTempQrPanelConfig({ ...tempQrPanelConfig, x: parseInt(e.target.value) || 0 })}
                                                className="bg-slate-900 border border-slate-600 rounded p-1 text-sm text-green-400 text-center font-mono"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Eje Vertical (Y)</span>
                                            <input
                                                type="number"
                                                value={isEditingQrPanel ? tempQrPanelConfig.y : qrPanelConfig.y}
                                                onChange={(e) => isEditingQrPanel && setTempQrPanelConfig({ ...tempQrPanelConfig, y: parseInt(e.target.value) || 0 })}
                                                className="bg-slate-900 border border-slate-600 rounded p-1 text-sm text-green-400 text-center font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden h-full min-h-[300px]">
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                <div
                                    className="w-48 h-64 bg-slate-800 rounded-xl border-2 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)] flex flex-col items-center p-4 transition-transform duration-300 ease-out will-change-transform"
                                    style={{
                                        transform: `translate(${(isEditingQrPanel ? tempQrPanelConfig.x : qrPanelConfig.x) / 5}px, ${(isEditingQrPanel ? tempQrPanelConfig.y : qrPanelConfig.y) / 5}px) scale(${(isEditingQrPanel ? tempQrPanelConfig.scale : qrPanelConfig.scale) * 0.8})`
                                    }}
                                >
                                    <div className="w-full flex gap-2 mb-4">
                                        <div className="flex-1 h-6 bg-green-500/20 rounded"></div>
                                        <div className="flex-1 h-6 bg-slate-700/50 rounded"></div>
                                    </div>
                                    <div className="w-32 h-32 bg-slate-900 rounded-lg flex items-center justify-center mb-4 border border-slate-700">
                                        <QrCode size={40} className="text-green-500/50" />
                                    </div>
                                    <div className="w-full h-2 bg-slate-700/50 rounded mb-2"></div>
                                    <div className="w-2/3 h-2 bg-slate-700/30 rounded"></div>
                                    <span className="absolute bottom-2 right-4 text-[10px] text-slate-600 font-mono">Vista Previa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Winner Panel Manager Module --- */}
                {currentView === 'display' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-purple-400">
                                    <Trophy size={24} /> Administrador de Panel de Ganadores
                                </h2>
                                {/* Toggle Switch - Synchronized */}
                                <div
                                    onClick={() => {
                                        const newState = !winnersPanelVisible;
                                        setWinnersPanelVisible(newState);
                                        setDailyGiveaways({ ...dailyGiveaways, active: newState });
                                    }}
                                    className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 shadow-inner ${winnersPanelVisible ? 'bg-green-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${winnersPanelVisible ? 'translate-x-7' : 'translate-x-0'}`} />
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white pointer-events-none uppercase tracking-wider select-none">
                                        {winnersPanelVisible ? 'ON' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!isEditingWinnerPanel ? (
                                    <button
                                        onClick={startEditingWinnerPanel}
                                        className="text-xs bg-purple-600 px-3 py-1 rounded text-white font-bold hover:bg-purple-500 transition shadow-[0_0_10px_rgba(168,85,247,0.4)] flex items-center gap-1"
                                    >
                                        <Edit2 size={14} /> Editar
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleWinnerPanelSave}
                                            className="text-xs bg-green-500 px-3 py-1 rounded text-black font-bold hover:bg-green-400 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                        >
                                            <Save size={14} /> Guardar
                                        </button>
                                        <button
                                            onClick={cancelEditingWinnerPanel}
                                            className="text-xs bg-slate-700 px-3 py-1 rounded text-red-400 hover:text-red-300 hover:bg-slate-600 transition flex items-center gap-1"
                                        >
                                            <X size={14} /> Cancelar
                                        </button>
                                        <button
                                            onClick={resetWinnerPanelConfig}
                                            className="text-xs bg-red-900/50 px-3 py-1 rounded text-red-300 hover:text-white hover:bg-red-600 transition border border-red-500/30"
                                        >
                                            Restablecer
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className={`space-y-6 transition-opacity duration-300 ${!isEditingWinnerPanel ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                {/* Scaling */}
                                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                    <label className="block text-xs uppercase text-slate-400 mb-3 font-bold flex justify-between">
                                        Escala (Tamaño)
                                        <span className="text-purple-400">{isEditingWinnerPanel ? tempWinnerPanelConfig.scale : winnerPanelConfig.scale}x</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => updateWinnerPanelScale(-0.1)}
                                            className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                        >-</button>
                                        <input
                                            type="range"
                                            min="0.2"
                                            max="3"
                                            step="0.1"
                                            value={isEditingWinnerPanel ? tempWinnerPanelConfig.scale : winnerPanelConfig.scale}
                                            onChange={(e) => isEditingWinnerPanel && setTempWinnerPanelConfig({ ...tempWinnerPanelConfig, scale: parseFloat(e.target.value) })}
                                            className="w-full accent-purple-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer"
                                            disabled={!isEditingWinnerPanel}
                                        />
                                        <button
                                            onClick={() => updateWinnerPanelScale(0.1)}
                                            className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                        >+</button>
                                    </div>
                                </div>

                                {/* Positioning */}
                                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                    <label className="block text-xs uppercase text-slate-400 mb-4 font-bold">
                                        Posición (X: {isEditingWinnerPanel ? tempWinnerPanelConfig.x : winnerPanelConfig.x}, Y: {isEditingWinnerPanel ? tempWinnerPanelConfig.y : winnerPanelConfig.y})
                                    </label>
                                    <div className="flex flex-col items-center gap-2">
                                        <button onClick={() => updateWinnerPanelPosition('y', -10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                            <ChevronDown size={20} className="rotate-180" />
                                        </button>
                                        <div className="flex gap-10">
                                            <button onClick={() => updateWinnerPanelPosition('x', -10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                                <ChevronDown size={20} className="rotate-90" />
                                            </button>
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-full border border-purple-500/50 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                            </div>
                                            <button onClick={() => updateWinnerPanelPosition('x', 10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                                <ChevronDown size={20} className="-rotate-90" />
                                            </button>
                                        </div>
                                        <button onClick={() => updateWinnerPanelPosition('y', 10)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">
                                            <ChevronDown size={20} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Eje Horizontal (X)</span>
                                            <input
                                                type="number"
                                                value={isEditingWinnerPanel ? tempWinnerPanelConfig.x : winnerPanelConfig.x}
                                                onChange={(e) => isEditingWinnerPanel && setTempWinnerPanelConfig({ ...tempWinnerPanelConfig, x: parseInt(e.target.value) || 0 })}
                                                className="bg-slate-900 border border-slate-600 rounded p-1 text-sm text-purple-400 text-center font-mono"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Eje Vertical (Y)</span>
                                            <input
                                                type="number"
                                                value={isEditingWinnerPanel ? tempWinnerPanelConfig.y : winnerPanelConfig.y}
                                                onChange={(e) => isEditingWinnerPanel && setTempWinnerPanelConfig({ ...tempWinnerPanelConfig, y: parseInt(e.target.value) || 0 })}
                                                className="bg-slate-900 border border-slate-600 rounded p-1 text-sm text-purple-400 text-center font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden h-full min-h-[300px]">
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                <div
                                    className="w-64 h-48 bg-slate-800 rounded-xl border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col items-center p-4 transition-transform duration-300 ease-out will-change-transform"
                                    style={{
                                        transform: `translate(${(isEditingWinnerPanel ? tempWinnerPanelConfig.x : winnerPanelConfig.x) / 5}px, ${(isEditingWinnerPanel ? tempWinnerPanelConfig.y : winnerPanelConfig.y) / 5}px) scale(${(isEditingWinnerPanel ? tempWinnerPanelConfig.scale : winnerPanelConfig.scale) * 0.8})`
                                    }}
                                >
                                    <div className="text-purple-400 font-bold mb-2">GANADORES</div>
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="h-8 bg-slate-700/50 rounded flex items-center px-2">
                                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                        </div>
                                        <div className="h-8 bg-slate-700/50 rounded flex items-center px-2">
                                            <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                                        </div>
                                    </div>
                                    <span className="absolute bottom-2 right-4 text-[10px] text-slate-600 font-mono">Vista Previa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Monthly Winners Module --- */}
                {currentView === 'monthly' && (
                    <div className={`bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg ${!winnersPanelVisible ? 'opacity-75' : ''}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-purple-400">
                                <Trophy size={20} /> Gestor de Ganadores Mensuales
                            </h2>
                            {/* Toggle Switch */}
                            <button
                                onClick={() => {
                                    const newState = !winnersPanelVisible;
                                    setWinnersPanelVisible(newState);
                                    setDailyGiveaways(prev => ({ ...prev, active: newState }));
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${winnersPanelVisible ? 'bg-green-500' : 'bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`${winnersPanelVisible ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        </div>

                        <div className="mb-6 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                            <label className="block text-xs uppercase text-slate-400 mb-2">Subtítulo (Visible en Pantalla)</label>
                            <div className="flex gap-2 items-center">
                                {isEditingSubtitle ? (
                                    <>
                                        <input
                                            type="text"
                                            className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded focus:outline-none focus:border-purple-500 font-bold text-lg text-purple-400 tracking-wider"
                                            value={monthlySubtitle}
                                            onChange={(e) => setMonthlySubtitle(e.target.value)}
                                            placeholder="Ej: TOP 3 JUGADORES"
                                        />
                                        <button
                                            onClick={handleSubtitleSaveClick}
                                            className="bg-green-500 text-black p-2 rounded hover:brightness-110 transition shrink-0"
                                            title="Guardar Subtítulo"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={toggleSubtitleEdit}
                                            className="bg-slate-600 text-white p-2 rounded hover:bg-slate-500 transition shrink-0"
                                            title="Cancelar"
                                        >
                                            <X size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex-1 flex justify-between items-center bg-slate-800/50 px-3 py-2 rounded border border-slate-700/50">
                                        <span className="font-bold text-lg text-purple-400 tracking-wider">
                                            {monthlySubtitle || <span className="text-slate-600 italic font-normal text-sm">Sin subtítulo</span>}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={toggleSubtitleEdit}
                                                className="text-blue-400 hover:text-blue-300 p-1 hover:bg-slate-700 rounded transition"
                                                title="Editar Subtítulo"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={handleSubtitleClearClick}
                                                className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-700 rounded transition"
                                                title="Borrar Subtítulo"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {monthlyWinners.map((slot) => (
                                <div key={slot.id} className={`bg-slate-700/30 p-4 rounded-lg border border-slate-600 flex flex-col relative transition-all ${slot.enabled === false ? 'opacity-50 grayscale' : ''}`}>
                                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-lg font-bold ${slot.rank === 1 ? 'text-yellow-400' :
                                                slot.rank === 2 ? 'text-slate-300' :
                                                    slot.rank === 3 ? 'text-amber-600' :
                                                        'text-red-500' // 4th and 5th place Red
                                                }`}>
                                                {slot.rank}º Lugar
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {slot.winner && (
                                                <>
                                                    <button
                                                        onClick={() => toggleMonthlyUserChange(slot.id)}
                                                        className={`p-1 rounded transition ${changingMonthlyUser[slot.id] ? 'bg-slate-600 text-white' : 'text-blue-400 hover:text-blue-300 hover:bg-slate-700'}`}
                                                        title={changingMonthlyUser[slot.id] ? "Cancelar Edición" : "Cambiar Usuario"}
                                                    >
                                                        {changingMonthlyUser[slot.id] ? <X size={16} /> : <Edit2 size={16} />}
                                                    </button>
                                                    <button onClick={() => clearMonthlyWinner(slot.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-700 rounded transition" title="Borrar Ganador">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {slot.winner && !changingMonthlyUser[slot.id] ? (
                                        <div className="bg-slate-800 p-3 rounded mb-4 text-center border border-slate-700">
                                            <div className="font-bold text-white text-lg">{slot.winner.nickname}</div>
                                            <div className="text-xs text-slate-500">{slot.winner.name}</div>
                                        </div>
                                    ) : (
                                        <div className="relative mb-4 animate-fade-in">
                                            <input
                                                type="text"
                                                placeholder="Buscar usuario..."
                                                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded focus:outline-none focus:border-purple-500 text-sm"
                                                value={isWinnerSearchOpen === 'monthly-' + slot.id ? winnerSearchQuery : ''}
                                                onFocus={() => openMonthlySearch(slot.id)}
                                                onChange={(e) => setWinnerSearchQuery(e.target.value)}
                                            />
                                            {/* Dropdown Results for Monthly */}
                                            {isWinnerSearchOpen === 'monthly-' + slot.id && winnerSearchQuery && (
                                                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded mt-1 z-50 max-h-40 overflow-y-auto shadow-xl">
                                                    {filteredWinnerCandidates.length > 0 ? (
                                                        filteredWinnerCandidates.map(u => (
                                                            <div
                                                                key={u.id}
                                                                className="p-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
                                                                onClick={() => selectCandidate(u)}
                                                            >
                                                                <div className="font-bold text-sm text-white">{u.nickname}</div>
                                                                <div className="text-xs text-slate-400">{u.name}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-slate-500 text-sm">No users found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Points Section - Only for Top 3 */}
                                    {slot.rank <= 3 && (
                                        <div className="mt-auto">
                                            <label className="block text-xs uppercase text-slate-500 mb-1">Puntos Ganados</label>
                                            <div className="flex items-center gap-2">
                                                {editingMonthlyWinners[slot.id] ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded focus:outline-none focus:border-purple-500 font-mono text-center"
                                                            value={slot.points}
                                                            onChange={(e) => updateMonthlyPoints(slot.id, e.target.value)}
                                                            placeholder="0"
                                                        />
                                                        <button
                                                            onClick={() => handleMonthlyPointSaveClick(slot)}
                                                            className="bg-green-500 text-black p-2 rounded hover:brightness-110 transition"
                                                            title="Guardar Cambios"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-full bg-slate-800/50 border border-slate-700/50 px-3 py-2 rounded font-mono text-center text-purple-300">
                                                            {slot.points || 0}
                                                        </div>
                                                        {slot.winner && (
                                                            <button
                                                                onClick={() => toggleMonthlyEdit(slot.id)}
                                                                className="bg-slate-700 text-slate-300 p-2 rounded hover:bg-slate-600 hover:text-white transition"
                                                                title="Editar Puntos"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}


                        </div>
                    </div>
                )}
                {/* --- Announcement Manager Module (Multiple) --- */}
                {currentView === 'announcement' && (
                    <div className="space-y-8 pb-10">
                        {/* Header & Add Button */}
                        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                                <MessageSquare size={24} /> Gestor de Anuncios
                            </h2>
                            <button
                                onClick={addAnnouncement}
                                className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:scale-105 active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                                <span className="hidden md:inline">Nuevo Anuncio</span>
                            </button>
                        </div>

                        {/* Empty State */}
                        {announcements.length === 0 && (
                            <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center text-slate-400 flex flex-col items-center justify-center animate-fade-in">
                                <div className="bg-slate-700/50 p-6 rounded-full mb-4">
                                    <MessageSquare size={48} className="opacity-50" />
                                </div>
                                <p className="text-lg font-medium">No hay anuncios creados.</p>
                                <p className="text-sm opacity-70">Haz clic en "Nuevo Anuncio" para comenzar.</p>
                            </div>
                        )}

                        {/* Announcements List */}
                        {announcements.map((announcement) => {
                            const isEditing = editingAnnouncementId === announcement.id;
                            // Values to render: if editing, use temp state, else use saved state
                            const displayConfig = isEditing ? tempAnnouncementState.config : announcement.config;
                            const displayText = isEditing ? tempAnnouncementState.text : announcement.text;
                            const isVisible = announcement.visible;

                            return (
                                <div key={announcement.id} className={`bg-slate-800 p-6 rounded-xl border transition-all duration-300 shadow-lg ${isEditing ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' : 'border-slate-700'}`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-700 pb-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-900 p-2 rounded-lg text-slate-400 font-mono text-xs border border-slate-700">
                                                ID: {announcement.id.toString().slice(-4)}
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                                                <span className={`text-xs font-bold ${isVisible ? 'text-green-400' : 'text-slate-500'}`}>
                                                    {isVisible ? 'VISIBLE' : 'OCULTO'}
                                                </span>
                                                <button
                                                    onClick={() => toggleAnnouncementVisibility(announcement.id)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isVisible ? 'bg-green-500' : 'bg-slate-600'}`}
                                                >
                                                    <span className={`${isVisible ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 self-end md:self-auto">
                                            {!isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => startEditingAnnouncement(announcement)}
                                                        className="text-xs bg-cyan-600 px-3 py-1 rounded text-black font-bold hover:bg-cyan-500 transition shadow-[0_0_10px_rgba(34,211,238,0.4)] flex items-center gap-1"
                                                        disabled={editingAnnouncementId !== null && editingAnnouncementId !== announcement.id} // Disable if editing another
                                                    >
                                                        <Edit2 size={14} /> Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                        className="text-xs bg-red-500/10 border border-red-500/30 px-3 py-1 rounded text-red-500 font-bold hover:bg-red-500 hover:text-white transition flex items-center gap-1"
                                                        disabled={editingAnnouncementId !== null} // Disable if editing anything
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={handleAnnouncementSave}
                                                        className="text-xs bg-green-500 px-3 py-1 rounded text-black font-bold hover:bg-green-400 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                                    >
                                                        <Save size={14} /> Guardar
                                                    </button>
                                                    <button
                                                        onClick={cancelEditingAnnouncement}
                                                        className="text-xs bg-slate-700 px-3 py-1 rounded text-red-400 hover:text-red-300 hover:bg-slate-600 transition flex items-center gap-1"
                                                    >
                                                        <X size={14} /> Cancelar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONFIGURATION CONTROLS (Only visible when editing THIS item) */}
                                    {isEditing && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in bg-slate-800/50 p-6 rounded-lg border border-slate-700">

                                            {/* LEFT COLUMN: Font & Scale */}
                                            <div className="space-y-6">
                                                {/* Font Selection */}
                                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                                    <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-3 block">Tipografía</label>
                                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                                                        {Object.entries(FONTS).map(([key, font]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, font: key } }))}
                                                                className={`px-2 py-2 rounded text-xs transition-all border ${tempAnnouncementState.config.font === key
                                                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                                                    }`}
                                                            >
                                                                <span className={font.class}>{font.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Scale */}
                                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Escala (Tamaño)</label>
                                                        <span className="text-purple-400 font-mono font-bold">{tempAnnouncementState.config.scale.toFixed(1)}X</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, scale: Math.max(0.5, parseFloat((prev.config.scale - 0.1).toFixed(1))) } }))}
                                                            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors border border-slate-600"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className="flex-grow relative group cursor-pointer">
                                                            <input
                                                                type="range"
                                                                min="0.5"
                                                                max="3.0"
                                                                step="0.1"
                                                                value={tempAnnouncementState.config.scale}
                                                                onChange={(e) => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, scale: parseFloat(e.target.value) } }))}
                                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 z-10 relative"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, scale: Math.min(3.0, parseFloat((prev.config.scale + 0.1).toFixed(1))) } }))}
                                                            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors border border-slate-600"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* ICON Selection */}
                                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-4">
                                                    <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-3 block">Icono</label>
                                                    <div className="flex gap-2 justify-center">
                                                        {Object.entries(ICONS).map(([key, icon]) => {
                                                            const IconComp = icon.component;
                                                            return (
                                                                <button
                                                                    key={key}
                                                                    onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, icon: key } }))}
                                                                    className={`p-2 rounded-lg transition-all border ${tempAnnouncementState.config.icon === key
                                                                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                                                        }`}
                                                                    title={icon.name}
                                                                >
                                                                    <IconComp size={20} />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT COLUMN: Position D-Pad & Color */}
                                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center">

                                                {/* Color Picker */}
                                                <div className="w-full mb-6">
                                                    <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-3 block text-center">Color de Neón</label>
                                                    <div className="flex justify-center gap-3">
                                                        {Object.entries(NEON_COLORS).map(([key, color]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, color: key } }))}
                                                                className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${color.bg} ${tempAnnouncementState.config.color === key ? 'scale-125 ring-2 ring-white border-transparent' : 'opacity-60 hover:opacity-100 hover:scale-110 border-slate-800'}`}
                                                                title={color.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center w-full mb-4 px-2 border-t border-slate-800 pt-4">
                                                    <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Posición (X: {tempAnnouncementState.config.x}, Y: {tempAnnouncementState.config.y})</label>
                                                    <button
                                                        onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, x: 0, y: 0 } }))}
                                                        className="text-[10px] text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-2 py-1 rounded transition-colors"
                                                        title="Resetear Posición"
                                                    >
                                                        RESET
                                                    </button>
                                                </div>

                                                {/* D-PAD CONTROL */}
                                                <div className="relative w-48 h-48 bg-slate-800 rounded-full border border-slate-700 shadow-inner flex items-center justify-center mb-6">
                                                    <button
                                                        onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, y: prev.config.y - 10 } }))}
                                                        className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center text-white transition shadow-lg active:scale-95"
                                                    >
                                                        <ChevronUp size={24} />
                                                    </button>
                                                    <button
                                                        onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, y: prev.config.y + 10 } }))}
                                                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center text-white transition shadow-lg active:scale-95"
                                                    >
                                                        <ChevronDown size={24} />
                                                    </button>
                                                    <button
                                                        onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, x: prev.config.x - 10 } }))}
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center text-white transition shadow-lg active:scale-95"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>
                                                    <button
                                                        onClick={() => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, x: prev.config.x + 10 } }))}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center text-white transition shadow-lg active:scale-95"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                    <div className="w-12 h-12 bg-slate-900 rounded-full border border-slate-600 flex items-center justify-center shadow-inner">
                                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                </div>

                                                {/* Numeric Fine Tuning */}
                                                <div className="grid grid-cols-2 gap-4 w-full">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase text-center">Eje Horizontal (X)</label>
                                                        <input
                                                            type="number"
                                                            value={tempAnnouncementState.config.x}
                                                            onChange={(e) => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, x: parseInt(e.target.value) || 0 } }))}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center text-cyan-300 font-mono text-sm focus:border-cyan-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase text-center">Eje Vertical (Y)</label>
                                                        <input
                                                            type="number"
                                                            value={tempAnnouncementState.config.y}
                                                            onChange={(e) => setTempAnnouncementState(prev => ({ ...prev, config: { ...prev.config, y: parseInt(e.target.value) || 0 } }))}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center text-cyan-300 font-mono text-sm focus:border-cyan-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-2">Texto del Anuncio</label>
                                        <textarea
                                            rows={4}
                                            className={`w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded focus:outline-none focus:border-cyan-500 font-mono text-cyan-300 text-lg tracking-wider resize-none ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={displayText || ''}
                                            onChange={(e) => isEditing && setTempAnnouncementState(prev => ({ ...prev, text: e.target.value }))}
                                            placeholder="Escribe el anuncio aquí..."
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    {/* --- Live Preview --- */}
                                    <div className="mt-6 border-t border-slate-700 pt-6">
                                        <h3 className="text-sm uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
                                            <Eye size={16} /> Vista Previa en Vivo
                                        </h3>
                                        <div className="bg-black/90 rounded-xl p-8 flex justify-center items-center border border-slate-700 shadow-inner min-h-[150px] overflow-hidden relative">
                                            {(() => {
                                                const previewColorKey = displayConfig.color || 'yellow';
                                                const previewColor = NEON_COLORS[previewColorKey] || NEON_COLORS['yellow'];
                                                const previewFontKey = displayConfig.font || 'sans';
                                                const previewFontClass = FONTS[previewFontKey]?.class || 'font-sans';
                                                const PreviewIcon = ICONS[displayConfig.icon || 'megaphone']?.component || Megaphone;

                                                return (
                                                    <div
                                                        className={`px-6 py-4 border-2 bg-black/80 backdrop-blur-md rounded-2xl flex items-center gap-4 md:gap-6 transition-transform duration-300 origin-center ${previewColor.border}`}
                                                        style={{
                                                            transform: `translate(${displayConfig.x}px, ${displayConfig.y}px) scale(${displayConfig.scale})`,
                                                            boxShadow: `0 0 40px ${previewColor.value}40`
                                                        }}
                                                    >
                                                        <div className={`${previewColor.bg} text-black p-2 md:p-3 rounded-full ${previewColor.shadow} animate-bounce-custom`}>
                                                            <PreviewIcon size={24} className="md:w-8 md:h-8" strokeWidth={2.5} />
                                                        </div>
                                                        <p
                                                            className={`font-black tracking-widest animate-pulse uppercase whitespace-pre-wrap text-center transition-all duration-300 ${previewColor.text} ${previewColor.glow} ${previewFontClass}`}
                                                            style={{
                                                                fontSize: `${displayConfig.fontSize}px`
                                                            }}
                                                        >
                                                            {displayText || 'ESCRIBE AQUÍ'}
                                                        </p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- Benefits Manager Module --- */}
                {currentView === 'benefits' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-pink-400">
                            <Trophy size={20} /> Gestor de Beneficios cliente
                        </h2>

                        {/* Title Section */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs uppercase text-slate-400">Título de la Sección</label>
                                <div className="flex items-center gap-2">
                                    {/* Font Size Controls */}
                                    <div className="flex bg-slate-800 rounded border border-slate-600 mr-2">
                                        <button
                                            onClick={() => handleBenefitsFontSizeChange('title', -2)}
                                            className="px-2 py-1 hover:bg-slate-700 text-slate-300 border-r border-slate-600"
                                            title="Disminuir Letra"
                                        >
                                            <span className="text-xs font-bold">A-</span>
                                        </button>
                                        <button
                                            onClick={() => handleBenefitsFontSizeChange('title', 2)}
                                            className="px-2 py-1 hover:bg-slate-700 text-slate-300"
                                            title="Aumentar Letra"
                                        >
                                            <span className="text-sm font-bold">A+</span>
                                        </button>
                                    </div>

                                    {/* Edit Controls */}
                                    {!isEditingBenefitsTitle ? (
                                        <button
                                            onClick={startEditingBenefitsTitle}
                                            className="text-slate-400 hover:text-blue-400 transition"
                                            title="Editar Título"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={handleBenefitsTitleSave}
                                                className="text-green-400 hover:text-green-300 transition bg-slate-800 p-1 rounded"
                                                title="Guardar"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={cancelBenefitsTitleEdit}
                                                className="text-red-400 hover:text-red-300 transition bg-slate-800 p-1 rounded"
                                                title="Cancelar"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditingBenefitsTitle ? (
                                <textarea
                                    rows={2}
                                    className="w-full bg-slate-900 border border-slate-500 px-3 py-2 rounded focus:outline-none focus:border-pink-500 font-bold text-pink-400 tracking-wider resize-none whitespace-pre-wrap text-center"
                                    style={{ fontSize: `${benefitsTitleFontSize}px` }}
                                    value={tempBenefitsTitle}
                                    onChange={(e) => setTempBenefitsTitle(e.target.value)}
                                    placeholder="Escribe el título aquí..."
                                />
                            ) : (
                                <div
                                    className="w-full bg-slate-900/50 border border-slate-700/50 px-3 py-2 rounded font-bold text-pink-400 tracking-wider text-center whitespace-pre-wrap"
                                    style={{ fontSize: `${benefitsTitleFontSize}px` }}
                                >
                                    {benefitsTitle}
                                </div>
                            )}
                        </div>

                        {/* Text Section */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs uppercase text-slate-400">Texto de Beneficios</label>
                                <div className="flex items-center gap-2">
                                    {/* Font Size Controls */}
                                    <div className="flex bg-slate-800 rounded border border-slate-600 mr-2">
                                        <button
                                            onClick={() => handleBenefitsFontSizeChange('text', -2)}
                                            className="px-2 py-1 hover:bg-slate-700 text-slate-300 border-r border-slate-600"
                                            title="Disminuir Letra"
                                        >
                                            <span className="text-xs font-bold">A-</span>
                                        </button>
                                        <button
                                            onClick={() => handleBenefitsFontSizeChange('text', 2)}
                                            className="px-2 py-1 hover:bg-slate-700 text-slate-300"
                                            title="Aumentar Letra"
                                        >
                                            <span className="text-sm font-bold">A+</span>
                                        </button>
                                    </div>

                                    {/* Edit Controls */}
                                    {!isEditingBenefitsText ? (
                                        <button
                                            onClick={startEditingBenefitsText}
                                            className="text-slate-400 hover:text-blue-400 transition"
                                            title="Editar Texto"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={handleBenefitsTextSave}
                                                className="text-green-400 hover:text-green-300 transition bg-slate-800 p-1 rounded"
                                                title="Guardar"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={cancelBenefitsTextEdit}
                                                className="text-red-400 hover:text-red-300 transition bg-slate-800 p-1 rounded"
                                                title="Cancelar"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditingBenefitsText ? (
                                <textarea
                                    rows={10}
                                    className="w-full bg-slate-900 border border-slate-500 px-3 py-2 rounded focus:outline-none focus:border-pink-500 font-mono text-slate-300 resize-none whitespace-pre-wrap"
                                    style={{ fontSize: `${benefitsTextFontSize}px` }}
                                    value={tempBenefitsText}
                                    onChange={(e) => setTempBenefitsText(e.target.value)}
                                    placeholder="Escribe los beneficios aquí..."
                                />
                            ) : (
                                <div
                                    className="w-full bg-slate-900/50 border border-slate-700/50 px-3 py-2 rounded font-mono text-slate-300 whitespace-pre-wrap min-h-[200px]"
                                    style={{ fontSize: `${benefitsTextFontSize}px` }}
                                >
                                    {benefitsText}
                                </div>
                            )}

                            <p className="text-xs text-slate-500 mt-2 italic flex justify-between">
                                <span>* Este texto se mostrará cuando se seleccione "Beneficios de ser usuario" en la pantalla de visualización.</span>
                                <span>Tamaños: Título {benefitsTitleFontSize}px, Texto {benefitsTextFontSize}px</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* --- Display Manager Module --- */}
                {currentView === 'display' && (
                    !displayConfig ? (
                        <div className="flex items-center justify-center h-64 bg-slate-800 rounded-xl border border-slate-700">
                            <div className="text-cyan-400 font-bold animate-pulse">Cargando configuración de display...</div>
                        </div>
                    ) : (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                                    <Monitor size={24} /> Administrador de Display
                                </h2>
                                <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                                    <span className={`text-xs font-bold ${displayVisible ? 'text-green-400' : 'text-slate-500'}`}>{displayVisible ? 'VISIBLE' : 'OCULTO'}</span>
                                    <button
                                        onClick={() => setDisplayVisible(!displayVisible)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${displayVisible ? 'bg-green-500' : 'bg-slate-600'}`}
                                    >
                                        <span className={`${displayVisible ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {!isEditingDisplay ? (
                                        <button
                                            onClick={startEditingDisplay}
                                            className="text-xs bg-cyan-600 px-3 py-1 rounded text-black font-bold hover:bg-cyan-500 transition shadow-[0_0_10px_rgba(34,211,238,0.4)] flex items-center gap-1"
                                        >
                                            <Edit2 size={14} /> Editar
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleDisplaySave}
                                                className="text-xs bg-green-500 px-3 py-1 rounded text-black font-bold hover:bg-green-400 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                            >
                                                <Save size={14} /> Guardar
                                            </button>
                                            <button
                                                onClick={cancelEditingDisplay}
                                                className="text-xs bg-slate-700 px-3 py-1 rounded text-red-400 hover:text-red-300 hover:bg-slate-600 transition flex items-center gap-1"
                                            >
                                                <X size={14} /> Cancelar
                                            </button>
                                            <button
                                                onClick={resetDisplayConfig}
                                                className="text-xs bg-red-900/50 px-3 py-1 rounded text-red-300 hover:text-white hover:bg-red-600 transition border border-red-500/30"
                                            >
                                                Restablecer
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Controls Column */}
                                <div className={`space-y-6 transition-opacity duration-300 ${!isEditingDisplay ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    {/* Upload */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold">Imagen Principal</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleDisplayLogoUpload}
                                                disabled={!isEditingDisplay}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 disabled:cursor-not-allowed"
                                            />
                                            <div className={`bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg p-4 text-center transition-colors relative overflow-hidden h-32 flex items-center justify-center ${isEditingDisplay ? 'group-hover:border-cyan-500' : ''}`}>
                                                {(isEditingDisplay ? tempDisplayConfig.logo : displayConfig?.logo) ? (
                                                    <>
                                                        <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm" style={{ backgroundImage: `url(${isEditingDisplay ? tempDisplayConfig.logo : displayConfig?.logo})` }}></div>
                                                        <img
                                                            src={isEditingDisplay ? tempDisplayConfig.logo : displayConfig?.logo}
                                                            alt="Upload Preview"
                                                            className="relative z-10 max-h-full max-w-full object-contain shadow-lg"
                                                        />
                                                        {isEditingDisplay && (
                                                            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
                                                                <Upload size={24} className="text-cyan-400 mb-1" />
                                                                <span className="text-xs text-white font-bold">Cambiar Imagen</span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className={`flex flex-col items-center justify-center gap-2 text-slate-400 ${isEditingDisplay ? 'group-hover:text-cyan-400' : ''}`}>
                                                        <Upload size={24} />
                                                        <span className="text-sm font-medium">Click para subir nueva imagen</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scaling */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold flex justify-between">
                                            Escala (Tamaño)
                                            <span className="text-cyan-400">{isEditingDisplay ? tempDisplayConfig.scale : (displayConfig?.scale ?? 1)}x</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => updateDisplayScale(-0.1)}
                                                className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                            >-</button>
                                            <input
                                                type="range"
                                                min="0.2"
                                                max="3"
                                                step="0.1"
                                                value={isEditingDisplay ? tempDisplayConfig.scale : (displayConfig?.scale ?? 1)}
                                                onChange={(e) => isEditingDisplay && setTempDisplayConfig({ ...tempDisplayConfig, scale: parseFloat(e.target.value) })}
                                                className="w-full accent-cyan-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer"
                                                disabled={!isEditingDisplay}
                                            />
                                            <button
                                                onClick={() => updateDisplayScale(0.1)}
                                                className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Positioning */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold text-center">
                                            Posición (X: {isEditingDisplay ? tempDisplayConfig.x : (displayConfig?.x ?? 0)}, Y: {isEditingDisplay ? tempDisplayConfig.y : (displayConfig?.y ?? 0)})
                                        </label>
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => updateDisplayPosition('y', -10)}
                                                className="bg-slate-800 p-2 rounded-full hover:bg-cyan-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                            >
                                                <ChevronDown className="transform rotate-180" />
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateDisplayPosition('x', -10)}
                                                    className="bg-slate-800 p-2 rounded-full hover:bg-cyan-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                                >
                                                    <ChevronDown className="transform rotate-90" />
                                                </button>
                                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                                </div>
                                                <button
                                                    onClick={() => updateDisplayPosition('x', 10)}
                                                    className="bg-slate-800 p-2 rounded-full hover:bg-cyan-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                                >
                                                    <ChevronDown className="transform -rotate-90" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => updateDisplayPosition('y', 10)}
                                                className="bg-slate-800 p-2 rounded-full hover:bg-cyan-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                            >
                                                <ChevronDown />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Column */}
                                <div className="bg-black/50 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden h-[400px]">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black pointer-events-none"></div>

                                    {/* Image Preview with Transformation */}
                                    <div
                                        className="relative transition-all duration-300 ease-out"
                                        style={{
                                            transform: `translate(${isEditingDisplay ? tempDisplayConfig.x : (displayConfig?.x ?? 0)}px, ${isEditingDisplay ? tempDisplayConfig.y : (displayConfig?.y ?? 0)}px) scale(${isEditingDisplay ? tempDisplayConfig.scale : (displayConfig?.scale ?? 1)})`
                                        }}
                                    >
                                        {(isEditingDisplay ? tempDisplayConfig.logo : displayConfig?.logo) ? (
                                            <img
                                                src={isEditingDisplay ? tempDisplayConfig.logo : displayConfig?.logo}
                                                alt="Logo Preview"
                                                className="max-w-[200px] h-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                            />
                                        ) : (
                                            <div className="p-8 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 flex flex-col items-center">
                                                <span className="text-4xl opacity-50 mb-2">🖼️</span>
                                                <span className="text-sm">Sin imagen personalizada</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 right-4 text-xs text-slate-500 font-mono">
                                        Vista Previa
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* --- Title Manager Module (Now part of Display View) --- */}
                {currentView === 'display' && (
                    !titleConfig ? (
                        <div className="flex items-center justify-center h-64 bg-slate-800 rounded-xl border border-slate-700 mt-8">
                            <div className="text-pink-400 font-bold animate-pulse">Cargando configuración de título...</div>
                        </div>
                    ) : (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in mt-8">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-pink-500">
                                    <Type size={24} /> Administrador de Título
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                                        <span className={`text-xs font-bold ${titleVisible ? 'text-green-400' : 'text-slate-500'}`}>{titleVisible ? 'VISIBLE' : 'OCULTO'}</span>
                                        <button
                                            onClick={() => setTitleVisible(!titleVisible)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${titleVisible ? 'bg-green-500' : 'bg-slate-600'}`}
                                        >
                                            <span className={`${titleVisible ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                        </button>
                                    </div>
                                    {!isEditingTitle ? (
                                        <button
                                            onClick={startEditingTitle}
                                            className="text-xs bg-cyan-600 px-3 py-1 rounded text-black font-bold hover:bg-cyan-500 transition shadow-[0_0_10px_rgba(34,211,238,0.4)] flex items-center gap-1"
                                        >
                                            <Edit2 size={14} /> Editar
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleTitleSave}
                                                className="text-xs bg-green-500 px-3 py-1 rounded text-black font-bold hover:bg-green-400 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                            >
                                                <Save size={14} /> Guardar
                                            </button>
                                            <button
                                                onClick={cancelEditingTitle}
                                                className="text-xs bg-slate-700 px-3 py-1 rounded text-red-400 hover:text-red-300 hover:bg-slate-600 transition flex items-center gap-1"
                                            >
                                                <X size={14} /> Cancelar
                                            </button>
                                            <button
                                                onClick={resetTitleConfig}
                                                className="text-xs bg-red-900/50 px-3 py-1 rounded text-red-300 hover:text-white hover:bg-red-600 transition border border-red-500/30"
                                            >
                                                Restablecer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-8">
                                {/* Controls Column */}
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${!isEditingTitle ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    {/* Text Input */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 md:col-span-2">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold">Texto Principal</label>
                                        <input
                                            type="text"
                                            value={isEditingTitle ? tempTitleConfig.text : (titleConfig?.text ?? '')}
                                            onChange={(e) => updateTitleText(e.target.value)}
                                            disabled={!isEditingTitle}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-pink-500 transition font-bold tracking-wider"
                                        />
                                    </div>

                                    {/* Scaling */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold flex justify-between">
                                            Escala (Tamaño)
                                            <span className="text-pink-400">{isEditingTitle ? tempTitleConfig.scale : (titleConfig?.scale ?? 1)}x</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => updateTitleScale(-0.1)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">-</button>
                                            <input
                                                type="range"
                                                min="0.5" max="3" step="0.1"
                                                value={isEditingTitle ? tempTitleConfig.scale : (titleConfig?.scale ?? 1)}
                                                onChange={(e) => isEditingTitle && setTempTitleConfig({ ...tempTitleConfig, scale: parseFloat(e.target.value) })}
                                                className="w-full accent-pink-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer"
                                                disabled={!isEditingTitle}
                                            />
                                            <button onClick={() => updateTitleScale(0.1)} className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300">+</button>
                                        </div>
                                    </div>

                                    {/* Positioning */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold text-center">
                                            Posición (X: {isEditingTitle ? tempTitleConfig.x : (titleConfig?.x ?? 0)}, Y: {isEditingTitle ? tempTitleConfig.y : (titleConfig?.y ?? 0)})
                                        </label>
                                        <div className="flex flex-col items-center gap-2">
                                            <button onClick={() => updateTitlePosition('y', -10)} className="bg-slate-800 p-2 rounded-full hover:bg-pink-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"><ChevronDown className="transform rotate-180" /></button>
                                            <div className="flex gap-4">
                                                <button onClick={() => updateTitlePosition('x', -10)} className="bg-slate-800 p-2 rounded-full hover:bg-pink-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"><ChevronDown className="transform rotate-90" /></button>
                                                <div className="w-4 h-4 rounded-full bg-slate-700"></div>
                                                <button onClick={() => updateTitlePosition('x', 10)} className="bg-slate-800 p-2 rounded-full hover:bg-pink-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"><ChevronDown className="transform -rotate-90" /></button>
                                            </div>
                                            <button onClick={() => updateTitlePosition('y', 10)} className="bg-slate-800 p-2 rounded-full hover:bg-pink-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"><ChevronDown /></button>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Column (Full Width) */}
                                <div className="bg-black/50 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden h-[350px]">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black pointer-events-none"></div>

                                    <div
                                        className="transition-all duration-300 ease-out"
                                        style={{
                                            transform: `translate(${isEditingTitle ? tempTitleConfig.x : (titleConfig?.x ?? 0)}px, ${isEditingTitle ? tempTitleConfig.y : (titleConfig?.y ?? 0)}px) scale(${isEditingTitle ? tempTitleConfig.scale : (titleConfig?.scale ?? 1)})`
                                        }}
                                    >
                                        <GlowText text={isEditingTitle ? tempTitleConfig.text : (titleConfig?.text ?? '')} />
                                    </div>

                                    <div className="absolute bottom-4 right-4 text-xs text-slate-500 font-mono">
                                        {isEditingTitle ? 'Vista Previa (Edición)' : 'Vista Previa'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* --- Bottom Logo Manager Module --- */}
                {currentView === 'display' && (
                    !bottomLogoConfig ? (
                        <div className="flex items-center justify-center h-64 bg-slate-800 rounded-xl border border-slate-700">
                            <div className="text-indigo-400 font-bold animate-pulse">Cargando configuración...</div>
                        </div>
                    ) : (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in mt-8">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-500">
                                    <Monitor size={24} /> Administrador de Logo Inferior
                                </h2>
                                <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                                    <span className={`text-xs font-bold ${bottomLogoVisible ? 'text-green-400' : 'text-slate-500'}`}>{bottomLogoVisible ? 'VISIBLE' : 'OCULTO'}</span>
                                    <button
                                        onClick={() => setBottomLogoVisible(!bottomLogoVisible)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${bottomLogoVisible ? 'bg-green-500' : 'bg-slate-600'}`}
                                    >
                                        <span className={`${bottomLogoVisible ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {!isEditingBottomLogo ? (
                                        <button
                                            onClick={startEditingBottomLogo}
                                            className="text-xs bg-indigo-600 px-3 py-1 rounded text-white font-bold hover:bg-indigo-500 transition shadow-[0_0_10px_rgba(99,102,241,0.4)] flex items-center gap-1"
                                        >
                                            <Edit2 size={14} /> Editar
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleBottomLogoSave}
                                                className="text-xs bg-green-500 px-3 py-1 rounded text-black font-bold hover:bg-green-400 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                            >
                                                <Save size={14} /> Guardar
                                            </button>
                                            <button
                                                onClick={cancelEditingBottomLogo}
                                                className="text-xs bg-slate-700 px-3 py-1 rounded text-red-400 hover:text-red-300 hover:bg-slate-600 transition flex items-center gap-1"
                                            >
                                                <X size={14} /> Cancelar
                                            </button>
                                            <button
                                                onClick={resetBottomLogoConfig}
                                                className="text-xs bg-red-900/50 px-3 py-1 rounded text-red-300 hover:text-white hover:bg-red-600 transition border border-red-500/30"
                                            >
                                                Restablecer
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Controls Column */}
                                <div className={`space-y-6 transition-opacity duration-300 ${!isEditingBottomLogo ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    {/* Upload */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold">Imagen del Logo</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBottomLogoUpload}
                                                disabled={!isEditingBottomLogo}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 disabled:cursor-not-allowed"
                                            />
                                            <div className={`bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg p-4 text-center transition-colors relative overflow-hidden h-32 flex items-center justify-center ${isEditingBottomLogo ? 'group-hover:border-indigo-500' : ''}`}>
                                                {/* Always display the logic (custom or default) */}
                                                {(
                                                    <>
                                                        <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm" style={{ backgroundImage: `url(${(isEditingBottomLogo ? tempBottomLogoConfig.logo : bottomLogoConfig?.logo) || arcadiaGaming})` }}></div>
                                                        <img
                                                            src={(isEditingBottomLogo ? tempBottomLogoConfig.logo : bottomLogoConfig?.logo) || arcadiaGaming}
                                                            alt="Upload Preview"
                                                            className="relative z-10 max-h-full max-w-full object-contain shadow-lg"
                                                        />
                                                        {isEditingBottomLogo && (
                                                            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
                                                                <Upload size={24} className="text-indigo-400 mb-1" />
                                                                <span className="text-xs text-white font-bold">Cambiar Imagen</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scaling */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold flex justify-between">
                                            Escala (Tamaño)
                                            <span className="text-indigo-400">{isEditingBottomLogo ? tempBottomLogoConfig.scale : (bottomLogoConfig?.scale ?? 1)}x</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => updateBottomLogoScale(-0.1)}
                                                className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                            >-</button>
                                            <input
                                                type="range"
                                                min="0.2"
                                                max="3"
                                                step="0.1"
                                                value={isEditingBottomLogo ? tempBottomLogoConfig.scale : (bottomLogoConfig?.scale ?? 1)}
                                                onChange={(e) => isEditingBottomLogo && setTempBottomLogoConfig({ ...tempBottomLogoConfig, scale: parseFloat(e.target.value) })}
                                                className="w-full accent-indigo-500 bg-slate-900 h-2 rounded-lg appearance-none cursor-pointer"
                                                disabled={!isEditingBottomLogo}
                                            />
                                            <button
                                                onClick={() => updateBottomLogoScale(0.1)}
                                                className="bg-slate-800 p-2 rounded hover:bg-slate-600 text-slate-300"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Positioning */}
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <label className="block text-xs uppercase text-slate-400 mb-3 font-bold text-center">
                                            Posición (X: {isEditingBottomLogo ? tempBottomLogoConfig.x : (bottomLogoConfig?.x ?? 0)}, Y: {isEditingBottomLogo ? tempBottomLogoConfig.y : (bottomLogoConfig?.y ?? 0)})
                                        </label>
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => updateBottomLogoPosition('y', -10)}
                                                className="bg-slate-800 p-2 rounded-full hover:bg-indigo-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                            >
                                                <ChevronDown className="transform rotate-180" />
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateBottomLogoPosition('x', -10)}
                                                    className="bg-slate-800 p-2 rounded-full hover:bg-indigo-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                                >
                                                    <ChevronDown className="transform rotate-90" />
                                                </button>
                                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                                </div>
                                                <button
                                                    onClick={() => updateBottomLogoPosition('x', 10)}
                                                    className="bg-slate-800 p-2 rounded-full hover:bg-indigo-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                                >
                                                    <ChevronDown className="transform -rotate-90" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => updateBottomLogoPosition('y', 10)}
                                                className="bg-slate-800 p-2 rounded-full hover:bg-indigo-500 hover:text-black transition shadow-lg w-10 h-10 flex items-center justify-center"
                                            >
                                                <ChevronDown />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Column */}
                                <div className="bg-black/50 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden h-[400px]">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black pointer-events-none"></div>

                                    {/* Image Preview with Transformation */}
                                    <div
                                        className="relative transition-all duration-300 ease-out"
                                        style={{
                                            transform: `translate(${isEditingBottomLogo ? tempBottomLogoConfig.x : (bottomLogoConfig?.x ?? 0)}px, ${isEditingBottomLogo ? tempBottomLogoConfig.y : (bottomLogoConfig?.y ?? 0)}px) scale(${isEditingBottomLogo ? tempBottomLogoConfig.scale : (bottomLogoConfig?.scale ?? 1)})`
                                        }}
                                    >
                                        {(isEditingBottomLogo ? tempBottomLogoConfig.logo : bottomLogoConfig?.logo) || arcadiaGaming ? (
                                            <img
                                                src={(isEditingBottomLogo ? tempBottomLogoConfig.logo : bottomLogoConfig?.logo) || arcadiaGaming}
                                                alt="Logo Preview"
                                                className="max-w-[200px] h-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                            />
                                        ) : (
                                            <div className="p-8 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 flex flex-col items-center">
                                                <span className="text-4xl opacity-50 mb-2">🖼️</span>
                                                <span className="text-sm">Sin imagen</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 right-4 text-xs text-slate-500 font-mono">
                                        Vista Previa
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )
                }

                {/* --- Particle Manager Module --- */}
                {
                    currentView === 'display' && (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in mt-8">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                                    <Sparkles size={24} /> Administrador de Partículas
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                                        <span className={`text-xs font-bold ${particlesVisible ? 'text-green-400' : 'text-slate-500'}`}>{particlesVisible ? 'VISIBLE' : 'OCULTO'}</span>
                                        <button
                                            onClick={() => setParticlesVisible(!particlesVisible)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${particlesVisible ? 'bg-green-500' : 'bg-slate-600'}`}
                                        >
                                            <span className={`${particlesVisible ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isEditingParticles ? (
                                            <button
                                                onClick={() => {
                                                    setTempParticleCount(particleCount);
                                                    setIsEditingParticles(true);
                                                }}
                                                className="text-xs bg-cyan-600 px-3 py-1 rounded text-white font-bold hover:bg-cyan-500 transition shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center gap-1"
                                            >
                                                <Edit2 size={14} /> Editar
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setUserConfirmation({
                                                            isOpen: true,
                                                            type: 'PARTICLE_COUNT_SAVE',
                                                            data: { count: tempParticleCount }
                                                        });
                                                    }}
                                                    className="text-xs bg-green-600 px-3 py-1 rounded text-black font-bold hover:bg-green-500 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                                >
                                                    <Save size={14} /> Guardar
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingParticles(false)}
                                                    className="text-xs bg-slate-600 px-3 py-1 rounded text-white font-bold hover:bg-slate-500 transition flex items-center gap-1"
                                                >
                                                    <X size={14} /> Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-xs uppercase text-slate-400 font-bold">Cantidad de Partículas</label>
                                            <span className="text-cyan-400 font-mono font-bold">{isEditingParticles ? tempParticleCount : particleCount}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="200"
                                            max="1000"
                                            step="10"
                                            value={isEditingParticles ? tempParticleCount : particleCount}
                                            onChange={(e) => setTempParticleCount(parseInt(e.target.value))}
                                            disabled={!isEditingParticles}
                                            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                                            <span>MIN: 200</span>
                                            <span>MAX: 1000</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">
                                        Nota: Aumentar demasiado la cantidad de partículas puede afectar el rendimiento en equipos con poca potencia gráfica.
                                    </p>
                                </div>

                                <div className="bg-black/50 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden h-[350px]">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black pointer-events-none"></div>
                                    <div className="text-center z-10">
                                        <span className="text-4xl block mb-2 opacity-50">✨</span>
                                        <span className="text-sm text-slate-400">Previsualización de Densidad</span>
                                    </div>
                                    {/* Simple visual representation of density */}
                                    <div className="absolute inset-0 pointer-events-none opacity-30">
                                        {Array.from({ length: Math.min(50, (isEditingParticles ? tempParticleCount : particleCount) / 5) }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute bg-white rounded-full"
                                                style={{
                                                    width: Math.random() * 3 + 'px',
                                                    height: Math.random() * 3 + 'px',
                                                    top: Math.random() * 100 + '%',
                                                    left: Math.random() * 100 + '%',
                                                    animation: `pulse ${Math.random() * 3 + 2}s infinite alternate`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {/* --- Date/Time Manager Module --- */}
                {
                    currentView === 'display' && (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in mt-8">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                                    <CalendarDays size={24} /> Administrador de Fecha y Hora
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                                        <span className={`text-xs font-bold ${(isEditingDateTime ? tempDateTimeVisible : dateTimeVisible) ? 'text-green-400' : 'text-slate-500'}`}>{(isEditingDateTime ? tempDateTimeVisible : dateTimeVisible) ? 'VISIBLE' : 'OCULTO'}</span>
                                        <button
                                            onClick={() => isEditingDateTime && setTempDateTimeVisible(!tempDateTimeVisible)}
                                            disabled={!isEditingDateTime}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${(isEditingDateTime ? tempDateTimeVisible : dateTimeVisible) ? 'bg-green-500' : 'bg-slate-600'} ${!isEditingDateTime ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span className={`${(isEditingDateTime ? tempDateTimeVisible : dateTimeVisible) ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isEditingDateTime ? (
                                            <button
                                                onClick={startEditingDateTime}
                                                className="text-xs bg-cyan-600 px-3 py-1 rounded text-white font-bold hover:bg-cyan-500 transition shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center gap-1"
                                            >
                                                <Edit2 size={14} /> Editar
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleDateTimeSave}
                                                    className="text-xs bg-green-600 px-3 py-1 rounded text-black font-bold hover:bg-green-500 transition shadow-[0_0_10px_rgba(74,222,128,0.4)] flex items-center gap-1"
                                                >
                                                    <Save size={14} /> Guardar
                                                </button>
                                                <button
                                                    onClick={cancelEditingDateTime}
                                                    className="text-xs bg-slate-600 px-3 py-1 rounded text-white font-bold hover:bg-slate-500 transition flex items-center gap-1"
                                                >
                                                    <X size={14} /> Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400">
                                Controla la visibilidad de la fecha y el reloj digital en la parte superior de la pantalla de clientes. Al desactivarlo, se ocultará tanto la fecha como la hora.
                            </p>
                        </div>
                    )
                }

                {/* --- Finance Services Module --- */}
                {currentView === 'finance-services' && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                                <Briefcase size={24} /> Gestión de Pagos Mensuales
                            </h2>
                            <button
                                onClick={addService}
                                className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded flex items-center gap-2 transition shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                            >
                                <Plus size={18} /> Agregar
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-700">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-700/50 text-slate-200 uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Concepto</th>
                                        <th className="px-4 py-3 w-48">Vencimiento</th>
                                        <th className="px-4 py-3 w-40 text-right">Monto (S/.)</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {monthlyServices.map((service) => (
                                        <tr key={service.id} className="hover:bg-slate-700/30 transition group">
                                            <td className="px-4 py-2">
                                                {editingServices[service.id] ? (
                                                    <input
                                                        type="text"
                                                        value={service.concept}
                                                        onChange={(e) => updateService(service.id, 'concept', e.target.value)}
                                                        placeholder="Concepto..."
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none text-white placeholder:text-slate-600 py-1"
                                                    />
                                                ) : (
                                                    <span className="text-slate-300 font-medium">{service.concept}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 relative">
                                                {editingServices[service.id] ? (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setOpenDatePickerId(openDatePickerId === service.id ? null : service.id)}
                                                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none flex items-center justify-between gap-2 hover:bg-slate-800 transition"
                                                        >
                                                            <span>{service.date ? service.date.split('-').reverse().join('/') : 'Seleccionar'}</span>
                                                            <CalendarDays size={14} className="text-slate-400" />
                                                        </button>

                                                        {/* Day Picker Popover */}
                                                        {openDatePickerId === service.id && (
                                                            <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 w-64 animate-fade-in">
                                                                <div className="grid grid-cols-7 gap-1">
                                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                                        <button
                                                                            key={day}
                                                                            onClick={() => handleDateSelect(service.id, day)}
                                                                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-blue-500 hover:text-white transition text-xs font-bold text-slate-300 bg-slate-700/50"
                                                                        >
                                                                            {day}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        {service.date ? service.date.split('-').reverse().join('/') : '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {editingServices[service.id] ? (
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1.5 text-slate-500">S/.</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={service.amount}
                                                            onChange={(e) => updateService(service.id, 'amount', e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full bg-slate-900 border border-slate-600 rounded pl-8 pr-2 py-1 text-white text-right focus:border-blue-500 focus:outline-none font-mono"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-neon-blue font-mono font-bold">
                                                        S/. {parseFloat(service.amount || 0).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleServiceEdit(service.id)}
                                                    className={`transition p-1.5 rounded-full ${editingServices[service.id] ? 'text-green-400 hover:bg-green-400/10' : 'text-slate-500 hover:text-green-400 hover:bg-slate-700'}`}
                                                    title={editingServices[service.id] ? "Guardar" : "Editar"}
                                                >
                                                    {editingServices[service.id] ? <Check size={18} /> : <Pencil size={18} />}
                                                </button>

                                                <button
                                                    onClick={() => deleteService(service.id)}
                                                    className="text-slate-600 hover:text-red-400 transition p-1.5 rounded-full hover:bg-red-400/10"
                                                    title="Eliminar Fila"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-700/50 font-bold text-white">
                                    <tr>
                                        <td colSpan="2" className="px-4 py-3 text-right text-blue-300 uppercase tracking-wider">Sumatoria Total</td>
                                        <td className="px-4 py-3 text-right font-mono text-neon-blue text-lg">
                                            S/. {calculateTotalServices()}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

            </div>
            {/* User Confirmation Modal */}
            {/* --- User Confirmation Modal --- */}
            <Modal
                isOpen={userConfirmation.isOpen}
                onClose={() => setUserConfirmation({ isOpen: false, type: null, data: null })}
                title={
                    <div className="flex items-center gap-2">
                        {userConfirmation.type === 'ADD' && <Plus className="text-green-400" />}
                        {userConfirmation.type === 'UPDATE' && <Save className="text-green-400" />}
                        {userConfirmation.type === 'EDIT_START' && <Edit2 className="text-blue-400" />}
                        {userConfirmation.type === 'DELETE' && <Trash2 className="text-red-400" />}
                        {userConfirmation.type === 'MONTHLY_USER_SET' && <UsersIcon className="text-purple-400" />}
                        {userConfirmation.type === 'MONTHLY_POINTS_SAVE' && <Save className="text-green-400" />}
                        {userConfirmation.type === 'MONTHLY_CLEAR' && <Trash2 className="text-red-400" />}
                        {userConfirmation.type === 'SUBTITLE_SAVE' && <Save className="text-green-400" />}
                        {userConfirmation.type === 'SUBTITLE_CLEAR' && <Trash2 className="text-red-400" />}
                        {userConfirmation.type === 'ANNOUNCEMENT_SAVE' && <Save className="text-cyan-400" />}
                        {userConfirmation.type === 'BENEFITS_TITLE_SAVE' && <Save className="text-pink-400" />}
                        {userConfirmation.type === 'BENEFITS_TEXT_SAVE' && <Save className="text-pink-400" />}
                        {userConfirmation.type === 'DISPLAY_CONFIG_SAVE' && <Save className="text-cyan-400" />}
                        {userConfirmation.type === 'TITLE_CONFIG_SAVE' && <Type className="text-pink-500" />}
                        {userConfirmation.type === 'PARTICLE_COUNT_SAVE' && <Sparkles className="text-cyan-400" />}
                        {userConfirmation.type === 'QR_PANEL_CONFIG_SAVE' && <QrCode className="text-green-400" />}
                        {userConfirmation.type === 'WINNER_PANEL_CONFIG_SAVE' && <Trophy className="text-purple-400" />}
                        {userConfirmation.type === 'BOTTOM_LOGO_CONFIG_SAVE' && <Monitor className="text-indigo-500" />}
                        <span className={
                            ['DELETE', 'MONTHLY_CLEAR', 'SUBTITLE_CLEAR'].includes(userConfirmation.type) ? 'text-red-400' :
                                ['EDIT_START'].includes(userConfirmation.type) ? 'text-blue-400' :
                                    ['ANNOUNCEMENT_SAVE', 'DISPLAY_CONFIG_SAVE', 'PARTICLE_COUNT_SAVE', 'QR_PANEL_CONFIG_SAVE'].includes(userConfirmation.type) ? 'text-cyan-400' :
                                        ['BENEFITS_TITLE_SAVE', 'BENEFITS_TEXT_SAVE', 'TITLE_CONFIG_SAVE'].includes(userConfirmation.type) ? 'text-pink-400' :
                                            ['BOTTOM_LOGO_CONFIG_SAVE'].includes(userConfirmation.type) ? 'text-indigo-400' :
                                                'text-green-400'
                        }>
                            {userConfirmation.type === 'DELETE' || userConfirmation.type === 'MONTHLY_CLEAR' || userConfirmation.type === 'SUBTITLE_CLEAR' ? 'Confirmar Eliminación' :
                                userConfirmation.type === 'EDIT_START' ? 'Confirmar Edición' : 'Confirmar Guardado'}
                        </span>
                    </div>
                }
            >
                <div>
                    <p className="text-slate-300 mb-6 text-lg">
                        {userConfirmation.type === 'ADD' && <span>¿Estás seguro de que deseas agregar a <strong>{userConfirmation.data.nickname}</strong>?</span>}
                        {userConfirmation.type === 'UPDATE' && <span>¿Estás seguro de que deseas guardar los cambios para <strong>{userConfirmation.data.nickname}</strong>?</span>}
                        {userConfirmation.type === 'EDIT_START' && <span>¿Deseas editar a <strong>{userConfirmation.data.nickname}</strong>?</span>}
                        {userConfirmation.type === 'DELETE' && <span>¿Estás seguro de que deseas eliminar a <strong>{userConfirmation.data.nickname}</strong>?</span>}
                        {userConfirmation.type === 'MONTHLY_USER_SET' && <span>¿Asignar a <strong>{userConfirmation.data.user.nickname}</strong> como ganador del {monthlyWinners.find(s => s.id === userConfirmation.data.slotId)?.rank}º Lugar?</span>}
                        {userConfirmation.type === 'MONTHLY_POINTS_SAVE' && <span>¿Guardar <strong>{userConfirmation.data.points}</strong> puntos?</span>}
                        {userConfirmation.type === 'MONTHLY_CLEAR' && <span>¿Eliminar al ganador <strong>{userConfirmation.data.winnerName}</strong>?</span>}
                        {userConfirmation.type === 'SUBTITLE_SAVE' && <span>¿Guardar cambios en el subtítulo?</span>}
                        {userConfirmation.type === 'SUBTITLE_CLEAR' && <span>¿Borrar el subtítulo "<strong>{monthlySubtitle}</strong>"?</span>}
                        {userConfirmation.type === 'ANNOUNCEMENT_SAVE' && (
                            <div className="text-sm mt-2">
                                <p className="mb-2">¿Confirmar cambios en Anuncio?</p>
                                <ul className="list-disc list-inside text-slate-400">
                                    <li>Estado: {userConfirmation.data.visible ? 'VISIBLE' : 'OCULTO'}</li>
                                    <li>Texto: <span className="font-mono text-xs overflow-hidden max-h-12 block">{userConfirmation.data.text}</span></li>
                                    <li>Config: Tamaño {userConfirmation.data.config.fontSize}px | Escala {userConfirmation.data.config.scale}x</li>
                                    <li>Posición: X={userConfirmation.data.config.x}, Y={userConfirmation.data.config.y}</li>
                                </ul>
                            </div>
                        )}
                        {userConfirmation.type === 'BENEFITS_TITLE_SAVE' && <span>¿Guardar el nuevo título de Beneficios?</span>}
                        {userConfirmation.type === 'BENEFITS_TEXT_SAVE' && <span>¿Guardar el nuevo texto de Beneficios?</span>}
                        {userConfirmation.type === 'DISPLAY_CONFIG_SAVE' && (
                            <div className="text-sm mt-2">
                                <p className="mb-2">¿Confirmar los cambios en la configuración del Display?</p>
                                <ul className="list-disc list-inside text-slate-400">
                                    <li>Escala: {tempDisplayConfig.scale}x</li>
                                    <li>Posición: X={tempDisplayConfig.x}, Y={tempDisplayConfig.y}</li>
                                    <li>Imagen: {tempDisplayConfig.logo !== displayConfig.logo ? 'Nueva imagen seleccionada' : 'Sin cambios'}</li>
                                </ul>
                            </div>
                        )}
                        {userConfirmation.type === 'DATE_TIME_SAVE' && (
                            <div className="text-sm mt-2">
                                <p className="mb-2">¿Confirmar cambios en Fecha y Hora?</p>
                                <ul className="list-disc list-inside text-slate-400">
                                    <li>Estado: {userConfirmation.data.visible ? 'VISIBLE' : 'OCULTO'}</li>
                                </ul>
                            </div>
                        )}
                        {userConfirmation.type === 'TITLE_CONFIG_SAVE' && (
                            <div className="text-sm mt-2">
                                <p className="mb-2">¿Confirmar cambios en Título Principal?</p>
                                <ul className="list-disc list-inside text-slate-400">
                                    <li>Texto: "{tempTitleConfig.text}"</li>
                                    <li>Escala: {tempTitleConfig.scale}x</li>
                                    <li>Posición: X={tempTitleConfig.x}, Y={tempTitleConfig.y}</li>
                                </ul>
                            </div>
                        )}
                        {userConfirmation.type === 'BOTTOM_LOGO_CONFIG_SAVE' && (
                            <div className="text-sm mt-2">
                                <p className="mb-2">¿Confirmar cambios en Logo Inferior?</p>
                                <ul className="list-disc list-inside text-slate-400">
                                    <li>Escala: {tempBottomLogoConfig.scale}x</li>
                                    <li>Posición: X={tempBottomLogoConfig.x}, Y={tempBottomLogoConfig.y}</li>
                                    <li>Imagen: {tempBottomLogoConfig.logo !== bottomLogoConfig.logo ? 'Nueva imagen seleccionada' : 'Sin cambios'}</li>
                                </ul>
                            </div>
                        )}
                        {userConfirmation.type === 'PARTICLE_COUNT_SAVE' && (
                            <div className="text-sm mt-2">
                                <p className="mb-2">¿Confirmar cambios en la densidad de partículas?</p>
                                <ul className="list-disc list-inside text-slate-400">
                                    <li>Nueva Cantidad: {userConfirmation.data.count} partículas</li>
                                </ul>
                            </div>
                        )}
                        {userConfirmation.type === 'WINNER_PANEL_CONFIG_SAVE' && (
                            <div className="text-sm mt-2">
                                <p className="mb-2">¿Confirmar cambios en Panel de Ganadores?</p>
                                <ul className="list-disc list-inside text-slate-400">
                                    <li>Escala: {tempWinnerPanelConfig.scale}x</li>
                                    <li>Posición: X={tempWinnerPanelConfig.x}, Y={tempWinnerPanelConfig.y}</li>
                                </ul>
                            </div>
                        )}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setUserConfirmation({ isOpen: false, type: null, data: null })}
                            className="flex-1 px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 font-bold transition border border-slate-600"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                if (userConfirmation.type === 'ADD') addUser(null);
                                if (userConfirmation.type === 'UPDATE') handleUpdateUser(null);
                                if (userConfirmation.type === 'EDIT_START') startEditing(userConfirmation.data);
                                if (userConfirmation.type === 'DELETE') deleteUser(userConfirmation.data.id);
                                if (userConfirmation.type === 'MONTHLY_USER_SET') {
                                    const { slotId, user } = userConfirmation.data;
                                    setMonthlyWinners(monthlyWinners.map(s => s.id === slotId ? { ...s, winner: user } : s));
                                    setChangingMonthlyUser({ ...changingMonthlyUser, [slotId]: false });
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'MONTHLY_POINTS_SAVE') {
                                    const { slotId } = userConfirmation.data;
                                    toggleMonthlyEdit(slotId);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'MONTHLY_CLEAR') {
                                    const { slotId } = userConfirmation.data;
                                    setMonthlyWinners(monthlyWinners.map(s => s.id === slotId ? { ...s, winner: null, points: 0 } : s));
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'SUBTITLE_SAVE') {
                                    toggleSubtitleEdit(); // close edit mode
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'SUBTITLE_CLEAR') {
                                    setMonthlySubtitle('');
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'ANNOUNCEMENT_SAVE') {
                                    const { id, text, visible, config } = userConfirmation.data;
                                    setAnnouncements(announcements.map(a =>
                                        a.id === id ? { ...a, text, visible, config } : a
                                    ));
                                    setEditingAnnouncementId(null);
                                    setTempAnnouncementState({ text: '', visible: true, config: {} });
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'ANNOUNCEMENT_DELETE') {
                                    const { id } = userConfirmation.data;
                                    setAnnouncements(announcements.filter(a => a.id !== id));
                                    if (editingAnnouncementId === id) {
                                        cancelEditingAnnouncement();
                                    }
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'BENEFITS_TITLE_SAVE') {
                                    setBenefitsTitle(tempBenefitsTitle);
                                    setIsEditingBenefitsTitle(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'BENEFITS_TEXT_SAVE') {
                                    setBenefitsText(tempBenefitsText);
                                    setIsEditingBenefitsText(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'DISPLAY_CONFIG_SAVE') {
                                    setDisplayConfig(tempDisplayConfig);
                                    setIsEditingDisplay(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'TITLE_CONFIG_SAVE') {
                                    setTitleConfig(tempTitleConfig);
                                    setIsEditingTitle(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'BOTTOM_LOGO_CONFIG_SAVE') {
                                    setBottomLogoConfig(tempBottomLogoConfig);
                                    setIsEditingBottomLogo(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'DATE_TIME_SAVE') {
                                    setDateTimeVisible(userConfirmation.data.visible);
                                    setIsEditingDateTime(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'QR_PANEL_CONFIG_SAVE') {
                                    setQrPanelConfig(tempQrPanelConfig);
                                    setIsEditingQrPanel(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'WINNER_PANEL_CONFIG_SAVE') {
                                    setWinnerPanelConfig(tempWinnerPanelConfig);
                                    setIsEditingWinnerPanel(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'PARTICLE_COUNT_SAVE') {
                                    setParticleCount(userConfirmation.data.count);
                                    setParticleCount(userConfirmation.data.count);
                                    setIsEditingParticles(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                                if (userConfirmation.type === 'DATE_TIME_SAVE') {
                                    setDateTimeVisible(userConfirmation.data.visible);
                                    setIsEditingDateTime(false);
                                    setUserConfirmation({ isOpen: false, type: null, data: null });
                                }
                            }}
                            className={`flex-1 px-4 py-2 rounded text-black font-bold transition shadow-lg
                                ${['ADD', 'UPDATE', 'MONTHLY_POINTS_SAVE', 'MONTHLY_USER_SET', 'SUBTITLE_SAVE', 'ANNOUNCEMENT_SAVE', 'BENEFITS_TITLE_SAVE', 'BENEFITS_TEXT_SAVE', 'DISPLAY_CONFIG_SAVE', 'TITLE_CONFIG_SAVE', 'BOTTOM_LOGO_CONFIG_SAVE', 'PARTICLE_COUNT_SAVE', 'DATE_TIME_SAVE'].includes(userConfirmation.type) ? 'bg-green-500 hover:bg-green-400' : ''}
                                ${userConfirmation.type === 'EDIT_START' ? 'bg-blue-500 hover:bg-blue-400' : ''}
                                ${['DELETE', 'MONTHLY_CLEAR', 'SUBTITLE_CLEAR'].includes(userConfirmation.type) ? 'bg-red-500 hover:bg-red-400' : ''}
                            `}
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </Modal >
            {/* --- Tariff Image Edit/Delete Modal --- */}
            < TariffImageModal
                isOpen={tariffModal.isOpen}
                type={tariffModal.type}
                data={tariffModal.data}
                onClose={() => setTariffModal({ ...tariffModal, isOpen: false })
                }
                onConfirm={(updatedData) => {
                    if (tariffModal.type === 'DELETE') {
                        const newImages = tariffImages.filter((_, i) => i !== tariffModal.index);
                        setTariffImages(newImages);
                    } else if (tariffModal.type === 'EDIT') {
                        const newImages = [...tariffImages];
                        newImages[tariffModal.index] = { ...newImages[tariffModal.index], ...updatedData };
                        setTariffImages(newImages);
                    }
                    setTariffModal({ isOpen: false, type: null, data: null, index: null });
                }}
            />

            {/* --- Giveaway Delete Confirmation Modal --- */}
            {
                giveawayDeleteModal.isOpen && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Trash2 className="text-red-400" /> Confirmar Eliminación
                            </h3>
                            <p className="text-slate-300 mb-6">
                                ¿Estás seguro de que deseas eliminar este sorteo?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setGiveawayDeleteModal({ isOpen: false, slotId: null })}
                                    className="flex-1 px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDeleteGiveaway}
                                    className="flex-1 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-400 font-bold transition shadow-lg"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* --- Mass Delete Modal --- */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <AlertCircle size={24} className="text-red-500" />
                                {deleteStep === 'confirm' ? '¿Eliminar Todos?' : 'Verificación Requerida'}
                            </h3>

                            {deleteStep === 'confirm' ? (
                                <>
                                    <p className="text-slate-300 mb-6">
                                        ¿Estás seguro de que deseas eliminar <strong className="text-white">TODOS</strong> los usuarios? Esta acción no se puede deshacer.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={confirmDeleteStep1}
                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded transition"
                                        >
                                            Sí, Eliminar
                                        </button>
                                        <button
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 rounded transition"
                                        >
                                            No, Cancelar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-300 mb-4">
                                        Ingresa la contraseña de administrador para confirmar esta acción destructiva.
                                    </p>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Contraseña"
                                        className="w-full bg-slate-900 border border-slate-600 text-white px-3 py-2 rounded mb-2 focus:border-red-500 focus:outline-none"
                                        autoFocus
                                    />
                                    {deleteError && (
                                        <p className="text-red-400 text-xs mb-4 font-bold">{deleteError}</p>
                                    )}
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={confirmDeleteStep2}
                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded transition"
                                        >
                                            Confirmar
                                        </button>
                                        <button
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 rounded transition"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* --- Success Modal --- */}
            <Modal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-green-400">
                        <Check size={24} /> Operación Exitosa
                    </div>
                }
            >
                <div className="text-center py-4">
                    <p className="text-lg text-white mb-6">Todos los usuarios han sido eliminados correctamente.</p>
                    <button
                        onClick={() => setSuccessModalOpen(false)}
                        className="w-full bg-neon-blue hover:bg-cyan-400 text-black font-bold py-2 rounded shadow-[0_0_10px_rgba(0,243,255,0.4)] transition-all"
                    >
                        Aceptar
                    </button>
                </div>
            </Modal>

            {/* --- Import Result Modal --- */}
            <Modal
                isOpen={importResultModal.isOpen}
                onClose={() => setImportResultModal({ ...importResultModal, isOpen: false })}
                title={
                    <div className={`flex items-center gap-2 ${importResultModal.type === 'success' ? 'text-green-400' : 'text-cyan-400'}`}>
                        <Info size={24} /> {importResultModal.title}
                    </div>
                }
            >
                <div className="text-center py-4">
                    <p className="text-slate-200 mb-6 whitespace-pre-wrap text-left bg-slate-800/50 p-4 rounded border border-slate-700/50 font-mono text-sm leading-relaxed">
                        {importResultModal.message}
                    </p>
                    <button
                        onClick={() => setImportResultModal({ ...importResultModal, isOpen: false })}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded shadow-lg transition-all border border-slate-600"
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>
        </div >
    );
}

// Helper component for Banner Preview
function BannerPreview({ banners }) {
    const [index, setIndex] = useState(0);
    const activeBanners = banners.filter(b => b.text.trim());

    useEffect(() => {
        if (activeBanners.length === 0) return;
        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % activeBanners.length);
        }, 3000); // 3 seconds for preview
        return () => clearInterval(timer);
    }, [activeBanners.length]);

    if (activeBanners.length === 0) {
        return (
            <div className="bg-black text-white h-16 flex items-center justify-center rounded-lg shadow-inner">
                <div className="text-slate-600 italic text-sm text-center px-4">
                    (Banner vacío - agrega texto arriba)
                </div>
            </div>
        );
    }

    const currentText = activeBanners[index]?.text || '';

    // Simple length heuristic for preview: if > 50 chars, marquee. Else center.
    const isLong = currentText.length > 50;

    return (
        <div className="bg-black text-white h-16 flex items-center overflow-hidden border-t-4 border-purple-600 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative justify-center">
            <div key={index} className={`whitespace-nowrap px-4 font-bold text-xl ${isLong ? 'animate-marquee inline-block min-w-full' : 'animate-fade-in'}`}>
                {currentText}
            </div>
        </div>
    );
}

// Helper Component: Tariff Image Modal
function TariffImageModal({ isOpen, type, data, onClose, onConfirm }) {
    const [tempData, setTempData] = useState(data || {});

    useEffect(() => {
        setTempData(data || {});
    }, [data]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {type === 'DELETE' ? <Trash2 className="text-red-400" /> : <Edit2 className="text-cyan-400" />}
                    {type === 'DELETE' ? 'Eliminar Imagen' : 'Editar Imagen'}
                </h3>

                {type === 'DELETE' ? (
                    <p className="text-slate-300 mb-6">
                        ¿Estás seguro de que deseas eliminar esta imagen del tarifario?
                    </p>
                ) : (
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Duración (segundos)</label>
                            <input
                                type="number"
                                min="3"
                                value={tempData.duration || 10}
                                onChange={(e) => setTempData({ ...tempData, duration: parseInt(e.target.value) || 10 })}
                                className="bg-slate-900 border border-slate-600 text-white text-sm rounded px-3 py-2 w-full focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Días Activos</label>
                            <div className="flex justify-between gap-1">
                                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dayLabel, dayIndex) => {
                                    const currentDays = tempData.activeDays || [0, 1, 2, 3, 4, 5, 6];
                                    const isActive = currentDays.includes(dayIndex);
                                    return (
                                        <button
                                            key={dayIndex}
                                            onClick={() => {
                                                let newDays;
                                                if (isActive) {
                                                    newDays = currentDays.filter(d => d !== dayIndex);
                                                } else {
                                                    newDays = [...currentDays, dayIndex];
                                                }
                                                setTempData({ ...tempData, activeDays: newDays });
                                            }}
                                            className={`w-8 h-8 rounded text-xs font-bold transition-all ${isActive
                                                ? 'bg-purple-600 text-white shadow shadow-purple-500/50 transform scale-105'
                                                : 'bg-slate-900 text-slate-600 border border-slate-800 hover:border-slate-600'
                                                }`}
                                        >
                                            {dayLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 font-bold transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(tempData)}
                        className={`flex-1 px-4 py-2 rounded text-black font-bold transition shadow-lg ${type === 'DELETE' ? 'bg-red-500 hover:bg-red-400' : 'bg-cyan-500 hover:bg-cyan-400'}`}
                    >
                        {type === 'DELETE' ? 'Eliminar' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}


