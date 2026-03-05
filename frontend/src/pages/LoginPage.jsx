import { useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    InputAdornment, IconButton, CircularProgress, alpha,
    Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person, School, Email, Badge } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/client';
import useAuthStore from '../context/authStore';

const FACULTIES = [
    'FACULTY OF SCIENCE, TECHNOLOGY AND INNOVATION',
    'FACULTY OF EDUCATION',
    'FACULTY OF BUSINESS AND HUMANITIES',
    'FACULTY OF AGRICULTURE AND AGRO-ECOLOGY',
    'FACULTY OF HEALTH SCIENCES',
    'FACULTY OF ENGINEERING AND TECHNOLOGY'
];

const FACULTY_DEPARTMENTS = {
    'FACULTY OF SCIENCE, TECHNOLOGY AND INNOVATION': ['Computer Science', 'Information Technology', 'Software Engineering', 'Data Science', 'Cybersecurity'],
    'FACULTY OF EDUCATION': ['Educational Foundations', 'Curriculum and Instruction', 'Early Childhood Education', 'Special Needs Education'],
    'FACULTY OF BUSINESS AND HUMANITIES': ['Business Administration', 'Accounting and Finance', 'Humanities', 'Economics'],
    'FACULTY OF AGRICULTURE AND AGRO-ECOLOGY': ['Agriculture', 'Agro-Ecology', 'Agribusiness'],
    'FACULTY OF HEALTH SCIENCES': ['Nursing', 'Public Health', 'Midwifery', 'Clinical Medicine'],
    'FACULTY OF ENGINEERING AND TECHNOLOGY': ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering']
};

export default function LoginPage() {
    const [tabIndex, setTabIndex] = useState(0);
    const [form, setForm] = useState({
        username: '', password: '',
        first_name: '', last_name: '', email: '',
        confirm_password: '', role: 'student',
        student_number: '', staff_id: '', year_of_study: '', faculty: '', department: ''
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // Forgot password state
    const [forgotPassOpen, setForgotPassOpen] = useState(false);
    const [resetInput, setResetInput] = useState('');
    const [resetting, setResetting] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const { data } = await authApi.login({ username: form.username, password: form.password });
            useAuthStore.getState().setTokens(data.access, data.refresh);
            const meRes = await authApi.me();
            login(meRes.data, data.access, data.refresh);
            toast.success(`Welcome back, ${meRes.data.first_name}!`);
            if (meRes.data.role === 'admin') navigate('/admin');
            else if (meRes.data.role === 'lecturer') navigate('/lecturer');
            else navigate('/student');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password || !form.email || !form.first_name || !form.last_name) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (form.password !== form.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const registerData = {
                username: form.username,
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                password: form.password,
                confirm_password: form.confirm_password,
                role: form.role,
                ...(form.role === 'student' ? { student_number: form.student_number, year_of_study: form.year_of_study } : {}),
                ...(form.role === 'lecturer' ? { staff_id: form.staff_id } : {}),
                faculty: form.faculty,
                department: form.department,
            };
            const { data } = await authApi.register(registerData);
            useAuthStore.getState().setTokens(data.access, data.refresh);
            const meRes = await authApi.me();
            login(meRes.data, data.access, data.refresh);
            toast.success('Registration successful!');
            if (meRes.data.role === 'admin') navigate('/admin');
            else if (meRes.data.role === 'lecturer') navigate('/lecturer');
            else navigate('/student');
        } catch (err) {
            const errs = err.response?.data;
            const firstErr = errs ? Object.values(errs)[0][0] : 'Registration failed';
            toast.error(typeof firstErr === 'string' ? firstErr : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        if (!resetInput) {
            toast.error('Please enter your email or username');
            return;
        }
        setResetting(true);
        try {
            // Send either username or email based on format
            const payload = resetInput.includes('@')
                ? { email: resetInput }
                : { username: resetInput };

            const { data } = await authApi.resetPassword(payload);
            toast.success(
                `${data.message} Your new temporary password is: ${data.temp_password}`,
                { duration: 6000 }
            );
            setForgotPassOpen(false);
            setResetInput('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setResetting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #F4F7F9 0%, #0D1B40 50%, #F4F7F9 100%)',
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
                    maxWidth: tabIndex === 0 ? 420 : 500,
                    width: '100%',
                    p: 2,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    position: 'relative',
                    zIndex: 1,
                    transition: 'max-width 0.3s ease'
                }}
            >
                <CardContent>
                    {/* Logo & Title */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 64, height: 64, borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0b52a1 0%, #2e9bf4 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                                boxShadow: '0 8px 30px rgba(21,101,192,0.5)',
                            }}
                        >
                            <School sx={{ fontSize: 32, color: '#ffffff' }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            MMU Attendance System
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Mountains of the Moon University
                        </Typography>
                    </Box>

                    <Tabs
                        value={tabIndex}
                        onChange={(e, val) => setTabIndex(val)}
                        centered
                        sx={{ mb: 3 }}
                    >
                        <Tab label="Sign In" />
                        <Tab label="Register" />
                    </Tabs>

                    {tabIndex === 0 ? (
                        /* Login Form */
                        <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                fullWidth
                                required
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
                                required
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

                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Button
                                    color="primary"
                                    onClick={() => setForgotPassOpen(true)}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    Forgot Password?
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        /* Register Form */
                        <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} fullWidth required />
                                <TextField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} fullWidth required />
                            </Box>

                            <TextField
                                label="Username" name="username" value={form.username} onChange={handleChange} fullWidth required
                                InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }}
                            />

                            <TextField
                                label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required
                                InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Register As</InputLabel>
                                <Select name="role" value={form.role} label="Register As" onChange={handleChange}>
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="lecturer">Lecturer</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required>
                                <InputLabel>Faculty</InputLabel>
                                <Select name="faculty" value={form.faculty} label="Faculty" onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value, department: '' }))}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {FACULTIES.map((fac) => <MenuItem key={fac} value={fac}>{fac}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required disabled={!form.faculty}>
                                <InputLabel>Department</InputLabel>
                                <Select name="department" value={form.department} label="Department" onChange={handleChange}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {(FACULTY_DEPARTMENTS[form.faculty] || []).map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                                </Select>
                            </FormControl>

                            {form.role === 'student' && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Student Number" name="student_number" value={form.student_number} onChange={handleChange} fullWidth required
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" /></InputAdornment> }}
                                    />
                                    <FormControl fullWidth required>
                                        <InputLabel>Year of Study</InputLabel>
                                        <Select name="year_of_study" value={form.year_of_study} label="Year of Study" onChange={handleChange}>
                                            {[1, 2, 3, 4, 5, 6].map(year => (
                                                <MenuItem key={year} value={year}>Year {year}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}

                            {form.role === 'lecturer' && (
                                <TextField
                                    label="Staff ID" name="staff_id" value={form.staff_id} onChange={handleChange} fullWidth required
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" /></InputAdornment> }}
                                />
                            )}

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} fullWidth required
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment> }}
                                />
                                <TextField
                                    label="Confirm Password" name="confirm_password" type={showPass ? 'text' : 'password'} value={form.confirm_password} onChange={handleChange} fullWidth required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowPass((s) => !s)} edge="end">
                                                    {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <Button
                                type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 1, py: 1.5 }}
                            >
                                {loading ? <CircularProgress size={22} color="inherit" /> : 'Register'}
                            </Button>
                        </Box>
                    )}

                    {/* Demo credentials hint */}
                    <Box
                        sx={{
                            mt: 3, p: 1.5, borderRadius: 2,
                            background: alpha('#0b52a1', 0.05),
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

            {/* Forgot Password Dialog */}
            <Dialog open={forgotPassOpen} onClose={() => setForgotPassOpen(false)} maxWidth="xs" fullWidth component="form" onSubmit={handleResetPassword}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pt: 1 }}>
                        Enter your username or email address and we will reset your password.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Username or Email"
                        fullWidth
                        required
                        variant="outlined"
                        value={resetInput}
                        onChange={(e) => setResetInput(e.target.value)}
                        disabled={resetting}
                    />
                </DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}>
                    <Button onClick={() => setForgotPassOpen(false)} disabled={resetting}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={resetting || !resetInput}
                    >
                        {resetting ? <CircularProgress size={20} color="inherit" /> : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
