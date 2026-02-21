import { useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    InputAdornment, IconButton, CircularProgress, alpha,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/client';
import useAuthStore from '../context/authStore';

export default function LoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const { data } = await authApi.login(form);
            // Set tokens first so subsequent API calls (like me()) have the Authorization header
            useAuthStore.getState().setTokens(data.access, data.refresh);
            const meRes = await authApi.me();
            login(meRes.data, data.access, data.refresh);
            toast.success(`Welcome back, ${meRes.data.first_name}!`);
            // Redirect by role
            if (meRes.data.role === 'admin') navigate('/admin');
            else if (meRes.data.role === 'lecturer') navigate('/lecturer');
            else navigate('/student');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1B40 50%, #0A0E1A 100%)',
                p: 2,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(21,101,192,0.15) 0%, transparent 70%)',
                    top: -100,
                    right: -100,
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(249,168,37,0.08) 0%, transparent 70%)',
                    bottom: -50,
                    left: -50,
                },
            }}
        >
            <Card
                sx={{
                    maxWidth: 420,
                    width: '100%',
                    p: 2,
                    background: 'rgba(19,25,41,0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <CardContent>
                    {/* Logo & Title */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 64, height: 64, borderRadius: '16px',
                                background: 'linear-gradient(135deg, #1565C0 0%, #003C8F 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                                boxShadow: '0 8px 30px rgba(21,101,192,0.5)',
                            }}
                        >
                            <School sx={{ fontSize: 32, color: '#fff' }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            MMU Attendance System
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Mountains of the Moon University
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            fullWidth
                            autoComplete="username"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type={showPass ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            fullWidth
                            autoComplete="current-password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowPass((s) => !s)} edge="end">
                                            {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mt: 1, py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>

                    {/* Demo credentials hint */}
                    <Box
                        sx={{
                            mt: 3, p: 1.5, borderRadius: 2,
                            background: alpha('#1565C0', 0.1),
                            border: '1px solid rgba(21,101,192,0.2)',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Demo Credentials:
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Admin: admin / Admin@123
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Lecturer: lec_okello / Lecturer@123
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Student: stu_amanya / Student@123
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
