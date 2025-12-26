import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';
import TariffPage from './pages/TariffPage';
import LoginPage from './pages/LoginPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('arcadia_is_authenticated') === 'true';
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/display" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/display" element={<DisplayPage />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/tarifario" element={<TariffPage />} />
            </Routes>
        </HashRouter>
    )
}

export default App
