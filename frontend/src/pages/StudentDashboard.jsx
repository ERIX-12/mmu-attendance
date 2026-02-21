import { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, CardHeader,
    Tab, Tabs, Table, TableHead, TableRow, TableCell, TableBody,
    Button, Chip, CircularProgress, alpha, LinearProgress,
} from '@mui/material';
import {
    QrCodeScanner, CheckCircle, Assignment, School,
    History, EventBusy,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { coursesApi, attendanceApi } from '../api/client';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─── Scan Tab ─────────────────────────────────────────────────────────────────
function ScanTab({ onScanSuccess }) {
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        let scanner;
        if (scanning) {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );
            scanner.render(
                async (decodedText) => {
                    scanner.clear();
                    setScanning(false);
                    try {
                        // Expected format: "session_id:secret"
                        const [sessionId, secret] = decodedText.split(':');
                        if (!sessionId || !secret) throw new Error('Invalid QR code format');

                        await attendanceApi.markAttendance({
                            session_id: parseInt(sessionId),
                            qr_secret: secret,
                        });
                        toast.success('Attendance marked successfully!');
                        onScanSuccess();
                    } catch (err) {
                        toast.error(err.response?.data?.detail || 'Failed to mark attendance. Try again.');
                    }
                },
                (error) => { /* ignore scanning errors */ }
            );
        }
        return () => {
            if (scanner) scanner.clear().catch(() => { });
        };
    }, [scanning]);

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Scan Lecturer's QR Code</Typography>

            {!scanning ? (
                <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <QrCodeScanner sx={{ fontSize: 80, color: 'primary.main', opacity: 0.8 }} />
                    <Typography color="text.secondary">
                        Ensure you are connected to the university network/internet.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<QrCodeScanner />}
                        onClick={() => setScanning(true)}
                        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                    >
                        Start Scanner
                    </Button>
                </Card>
            ) : (
                <Card sx={{ p: 2 }}>
                    <div id="reader" width="100%"></div>
                    <Button
                        variant="outlined" color="error" sx={{ mt: 2 }}
                        onClick={() => setScanning(false)}
                    >
                        Stop Scanning
                    </Button>
                </Card>
            )}
        </Box>
    );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        attendanceApi.list().then((r) => {
            setRecords(r.data.results || r.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Card>
            <Table>
                <TableHead>
                    <TableRow>
                        {['Date', 'Time', 'Course', 'Session Info', 'Status'].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary' }}>{h}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((r) => (
                        <TableRow key={r.id} hover>
                            <TableCell>{r.session_info.date}</TableCell>
                            <TableCell>{r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '—'}</TableCell>
                            <TableCell>
                                <Chip label={r.session_info.course_code} color="primary" size="small" />
                            </TableCell>
                            <TableCell>{r.session_info.course_name}</TableCell>
                            <TableCell>
                                <Chip icon={<CheckCircle />} label="Present" color="success" size="small" />
                            </TableCell>
                        </TableRow>
                    ))}
                    {records.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                No attendance records found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}

// ─── Main Student Dashboard ────────────────────────────────────────────────────
export default function StudentDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const fetchSummary = async () => {
        try {
            const { data } = await attendanceApi.summary();
            setSummary(data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSummary(); }, []);

    const totalClasses = summary.reduce((a, c) => a + c.total_sessions, 0);
    const totalAttended = summary.reduce((a, c) => a + c.attended_sessions, 0);
    const overallRate = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    const tabs = [
        { label: 'Overview', path: '/student', icon: <School /> },
        { label: 'Scan QR', path: '/student/scan', icon: <QrCodeScanner /> },
        { label: 'History', path: '/student/history', icon: <History /> },
    ];

    const currentTab = tabs.findIndex(t => t.path === location.pathname) === -1
        ? 0 : tabs.findIndex(t => t.path === location.pathname);

    return (
        <Layout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Hello, {user?.first_name}
                </Typography>
                <Typography color="text.secondary">
                    Student Dashboard • {user?.student_number}
                </Typography>
            </Box>

            {loading ? <CircularProgress /> : (
                <>
                    {/* Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <StatCard
                                title="Overall Attendance"
                                value={`${overallRate}%`}
                                trend={overallRate}
                                icon={<CheckCircle />}
                                color={overallRate < 80 ? 'error' : 'success'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatCard
                                title="Classes Attended"
                                value={totalAttended}
                                subtitle={`Out of ${totalClasses} total sessions`}
                                icon={<History />}
                                color="info"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatCard
                                title="Courses Enrolled"
                                value={summary.length}
                                icon={<School />}
                                color="primary"
                            />
                        </Grid>
                    </Grid>

                    <Card sx={{ minHeight: 500 }}>
                        <Tabs
                            value={currentTab}
                            onChange={(_, v) => navigate(tabs[v].path)}
                            sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            {tabs.map((t) => (
                                <Tab key={t.path} icon={t.icon} iconPosition="start" label={t.label} />
                            ))}
                        </Tabs>
                        <Box sx={{ p: 3 }}>
                            <Routes>
                                <Route index element={
                                    <Box>
                                        <Typography variant="h6" sx={{ mb: 2 }}>My Courses</Typography>
                                        <Grid container spacing={2}>
                                            {summary.map((course) => (
                                                <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                                                    <Card sx={{
                                                        border: course.below_threshold ? '1px solid #E53935' : '1px solid rgba(255,255,255,0.06)',
                                                        position: 'relative', overflow: 'visible'
                                                    }}>
                                                        {course.below_threshold && (
                                                            <Chip
                                                                label="Low Attendance" color="error" size="small"
                                                                sx={{ position: 'absolute', top: -10, right: 10 }}
                                                            />
                                                        )}
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                <Chip label={course.course_code} size="small" color="primary" />
                                                                <Typography variant="h6" sx={{ fontWeight: 700, color: course.below_threshold ? 'error.main' : 'text.primary' }}>
                                                                    {course.attendance_percentage}%
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="subtitle2" noWrap title={course.course_name} sx={{ mb: 1.5 }}>
                                                                {course.course_name}
                                                            </Typography>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={course.attendance_percentage}
                                                                color={course.below_threshold ? 'error' : 'success'}
                                                                sx={{ height: 6, borderRadius: 3 }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                {course.attended_sessions} / {course.total_sessions} sessions attended
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                } />
                                <Route path="scan" element={<ScanTab onScanSuccess={fetchSummary} />} />
                                <Route path="history" element={<HistoryTab />} />
                                <Route path="*" element={<Navigate to="/student" replace />} />
                            </Routes>
                        </Box>
                    </Card>
                </>
            )}
        </Layout>
    );
}
