import { useState, useEffect, useRef } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, CardHeader,
    Tab, Tabs, Table, TableHead, TableRow, TableCell, TableBody,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Chip, CircularProgress, Switch, FormControlLabel,
    LinearProgress, alpha,
} from '@mui/material';
import {
    PlayArrow, Stop, Refresh, Download, School,
    CheckCircle, Warning, People, QrCode2,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { coursesApi, sessionsApi, attendanceApi, reportsApi } from '../api/client';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_OPTIONS = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9BA3B5' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9BA3B5', beginAtZero: true } },
    },
};

// ─── QR Display Panel ─────────────────────────────────────────────────────────
function QRPanel({ session, onRefresh }) {
    const [countdown, setCountdown] = useState(30);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!session?.is_active) return;

        // Calculate remaining time based on qr_generated_at
        const calculateRemaining = () => {
            if (!session.qr_generated_at) return 30;
            const generatedAt = new Date(session.qr_generated_at).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - generatedAt) / 1000);
            return Math.max(0, 30 - (elapsed % 30));
        };

        setCountdown(calculateRemaining());
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    onRefresh(); // Auto refresh when countdown hits 0
                    return 30;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [session?.qr_generated_at, session?.is_active]);

    if (!session?.is_active) return (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <QrCode2 sx={{ fontSize: 64, opacity: 0.3 }} />
            <Typography>Session is not active</Typography>
        </Box>
    );

    const handleDownload = () => {
        if (!session.qr_code_image) return;
        const link = document.createElement('a');
        link.href = session.qr_code_image;
        link.download = `QR_${session.course_code || 'session'}_${new Date().toISOString()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
    };

    const handleShare = async () => {
        if (!session.qr_code_image) return;

        try {
            // Check if Web Share API is available for files
            const response = await fetch(session.qr_code_image);
            const blob = await response.blob();
            const file = new File([blob], 'qr_code.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Attendance QR for ${session.course_code}`,
                    text: `Scan this QR code to mark your attendance for ${session.title}.`,
                });
            } else {
                // Fallback: Copy to clipboard or just notify
                await navigator.clipboard.writeText(window.location.origin);
                toast.success('Sharing not supported on this browser. Link copied to clipboard.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            toast.error('Failed to share QR code');
        }
    };

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box sx={{
                display: 'inline-block', p: 2, borderRadius: 3,
                background: '#fff', mb: 2,
                boxShadow: '0 8px 40px rgba(21,101,192,0.4)',
            }}>
                {session.qr_code_image ? (
                    <img src={session.qr_code_image} alt="QR Code" style={{ width: 220, height: 220 }} />
                ) : (
                    <QRCodeSVG value={`${session.id}:${session.qr_code_secret}`} size={220} level="H" />
                )}
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: countdown > 10 ? 'success.main' : 'error.main' }}>
                    {countdown}s
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={(countdown / 30) * 100}
                    color={countdown > 10 ? 'success' : 'error'}
                    sx={{ height: 6, borderRadius: 3, mt: 1 }}
                />
            </Box>
            <Typography variant="caption" color="text.secondary">
                QR code refreshes every 30 seconds
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button startIcon={<Refresh />} variant="outlined" size="small" onClick={onRefresh}>
                    Refresh
                </Button>
                <Button startIcon={<Download />} variant="contained" color="secondary" size="small" onClick={handleDownload}>
                    Download
                </Button>
                <Button startIcon={<People />} variant="contained" color="info" size="small" onClick={handleShare}>
                    Share
                </Button>
            </Box>
        </Box>
    );
}

// ─── Sessions Tab ─────────────────────────────────────────────────────────────
function SessionsTab({ courses }) {
    const { user } = useAuthStore();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        course: '', date: new Date().toISOString().split('T')[0],
        start_time: '08:00', end_time: '10:00', venue: '', topic: '',
    });
    const [saving, setSaving] = useState(false);
    const pollRef = useRef(null);

    const fetchSessions = async () => {
        try {
            const { data } = await sessionsApi.list({ lecturer: user.id });
            const list = data.results || data;
            setSessions(list);
            const active = list.find((s) => s.is_active);
            setActiveSession(active || null);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchSessions();
        pollRef.current = setInterval(fetchSessions, 30000); // poll every 30s
        return () => clearInterval(pollRef.current);
    }, []);

    const handleActivate = async (id) => {
        try {
            await sessionsApi.activate(id);
            toast.success('Session activated — QR code is live!');
            fetchSessions();
        } catch { toast.error('Failed to activate session'); }
    };

    const handleDeactivate = async (id) => {
        try {
            await sessionsApi.deactivate(id);
            toast.success('Session closed');
            fetchSessions();
        } catch { toast.error('Failed to deactivate session'); }
    };

    const handleQrRefresh = async () => {
        if (!activeSession) return;
        try {
            await sessionsApi.qrRefresh(activeSession.id);
            toast.success('QR code refreshed');
            fetchSessions();
        } catch { toast.error('Failed to refresh QR'); }
    };

    const handleCreate = async () => {
        setSaving(true);
        try {
            // Backend expects course_id instead of course object
            await sessionsApi.create({ ...form, course_id: form.course, lecturer: user.id });
            toast.success('Session created!');
            setOpen(false);
            fetchSessions();
        } catch (error) {
            console.error('Create session error:', error.response?.data);
            toast.error(error.response?.data?.course_id?.[0] || 'Failed to create session');
        }
        finally { setSaving(false); }
    };

    return (
        <Grid container spacing={3}>
            {/* QR Panel */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader
                        title="Live QR Code"
                        subheader={activeSession ? `${activeSession.course_code} – ${activeSession.date}` : 'No active session'}
                        action={activeSession && (
                            <Chip label="LIVE" color="success" size="small" sx={{ animation: 'pulse 2s infinite' }} />
                        )}
                    />
                    <CardContent>
                        <QRPanel session={activeSession} onRefresh={handleQrRefresh} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Sessions list */}
            <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Sessions</Typography>
                    <Button variant="contained" onClick={() => setOpen(true)}>+ New Session</Button>
                </Box>
                {loading ? <CircularProgress /> : (
                    <Card>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    {['Course', 'Date', 'Time', 'Venue', 'Attendance', 'Status', 'Actions'].map((h) => (
                                        <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12 }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sessions.map((s) => (
                                    <TableRow key={s.id} hover sx={{ bgcolor: s.is_active ? alpha('#43A047', 0.05) : undefined }}>
                                        <TableCell><Chip label={s.course_code} size="small" color="primary" /></TableCell>
                                        <TableCell>{s.date}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{s.start_time}–{s.end_time}</TableCell>
                                        <TableCell>{s.venue || '—'}</TableCell>
                                        <TableCell>
                                            <Chip label={s.attendance_count} size="small" color="info" icon={<People />} />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={s.is_active ? 'Active' : 'Closed'}
                                                size="small"
                                                color={s.is_active ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {s.is_active ? (
                                                <Button size="small" color="error" startIcon={<Stop />} onClick={() => handleDeactivate(s.id)}>Close</Button>
                                            ) : (
                                                <Button size="small" color="success" startIcon={<PlayArrow />} onClick={() => handleActivate(s.id)}>Activate</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Course</InputLabel>
                        <Select value={form.course} label="Course" onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
                            {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.course_code} – {c.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="Start Time" type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField label="End Time" type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                    </Box>
                    <TextField label="Venue" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} fullWidth />
                    <TextField label="Topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={saving}>
                        {saving ? <CircularProgress size={18} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function LecturerDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        coursesApi.list().then((cRes) => {
            setCourses(cRes.data.results || cRes.data);
        }).finally(() => setLoading(false));
    }, []);

    const tabs = [
        { label: 'Overview', path: '/lecturer' },
        { label: 'Sessions', path: '/lecturer/sessions' },
        { label: 'My Courses', path: '/lecturer/courses' },
        { label: 'Attendance', path: '/lecturer/attendance' },
        { label: 'At-Risk', path: '/lecturer/at-risk' },
        { label: 'Reports', path: '/lecturer/reports' },
    ];

    const currentTab = tabs.findIndex(t => t.path === location.pathname) === -1
        ? 0 : tabs.findIndex(t => t.path === location.pathname);

    return (
        <Layout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Welcome, {user?.first_name} 👋
                </Typography>
                <Typography color="text.secondary">Lecturer Dashboard</Typography>
            </Box>

            {loading ? <CircularProgress /> : (
                <>
                    <Tabs
                        value={currentTab}
                        onChange={(_, v) => navigate(tabs[v].path)}
                        sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        {tabs.map((t) => <Tab key={t.path} label={t.label} />)}
                    </Tabs>

                    <Routes>
                        <Route index element={
                            <>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={4}>
                                        <StatCard title="My Courses" value={courses.length} icon={<School />} color="primary" />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <StatCard
                                            title="Total Students"
                                            value={courses.reduce((a, c) => a + c.enrollment_count, 0)}
                                            icon={<People />} color="success"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <StatCard
                                            title="Active Sessions"
                                            value={0} // Logic for active sessions count can be added here
                                            icon={<QrCode2 />} color="info"
                                        />
                                    </Grid>
                                </Grid>
                                <Card sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="h6">Select a tab above to manage your courses and sessions.</Typography>
                                </Card>
                            </>
                        } />
                        <Route path="sessions" element={<SessionsTab courses={courses} />} />
                        <Route path="courses" element={
                            <Card>
                                <CardHeader title="My Courses" />
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {['Code', 'Name', 'Credits', 'Students'].map((h) => (
                                                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary' }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {courses.map((c) => (
                                            <TableRow key={c.id} hover>
                                                <TableCell><Chip label={c.course_code} color="primary" size="small" /></TableCell>
                                                <TableCell>{c.name}</TableCell>
                                                <TableCell>{c.credits}</TableCell>
                                                <TableCell>{c.enrollment_count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        } />
                        <Route path="attendance" element={
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <CheckCircle sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                                <Typography variant="h6">Detailed attendance logs coming soon</Typography>
                            </Box>
                        } />
                        <Route path="at-risk" element={
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <Warning sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                                <Typography variant="h6">At-Risk student monitoring coming soon</Typography>
                            </Box>
                        } />
                        <Route path="reports" element={
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>Download Reports</Typography>
                                <Grid container spacing={2}>
                                    {courses.map((c) => (
                                        <Grid item xs={12} sm={6} md={4} key={c.id}>
                                            <Card sx={{ p: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.course_code}</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{c.name}</Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button size="small" variant="contained" startIcon={<Download />}
                                                        onClick={async () => {
                                                            const { data } = await reportsApi.downloadCsv(c.id);
                                                            const url = URL.createObjectURL(new Blob([data]));
                                                            const a = document.createElement('a'); a.href = url;
                                                            a.download = `${c.course_code}_report.csv`; a.click();
                                                        }}>CSV</Button>
                                                    <Button size="small" variant="outlined" color="error" startIcon={<Download />}
                                                        onClick={async () => {
                                                            const { data } = await reportsApi.downloadPdf(c.id);
                                                            const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
                                                            const a = document.createElement('a'); a.href = url;
                                                            a.download = `${c.course_code}_report.pdf`; a.click();
                                                        }}>PDF</Button>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        } />
                        <Route path="*" element={<Navigate to="/lecturer" replace />} />
                    </Routes>
                </>
            )}
        </Layout>
    );
}
