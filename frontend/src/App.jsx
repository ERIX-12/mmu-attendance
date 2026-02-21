import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';

function PrivateRoute({ children, allowedRoles }) {
    const { user, accessToken } = useAuthStore();
    if (!accessToken) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function RoleRouter() {
    const { user } = useAuthStore();
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'lecturer') return <Navigate to="/lecturer" replace />;
    if (user?.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute><RoleRouter /></PrivateRoute>} />
                <Route
                    path="/admin/*"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/lecturer/*"
                    element={
                        <PrivateRoute allowedRoles={['lecturer']}>
                            <LecturerDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/student/*"
                    element={
                        <PrivateRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
