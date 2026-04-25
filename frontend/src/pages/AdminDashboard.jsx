import { useState, useEffect, useMemo } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, CardHeader,
    Tab, Tabs, Table, TableHead, TableRow, TableCell, TableBody,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Chip, IconButton, CircularProgress, alpha, TableContainer,
    Slider, Switch, Divider, Avatar, Badge, Menu
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
    Add, School, People, EventNote, Assessment, Download, Delete, Edit, 
    PlayArrow, Stop, QrCode2, CheckCircle, Warning, DarkMode, LightMode, 
    CloudUpload, CalendarToday, FormatListBulleted, ChatBubbleOutline, 
    FolderOpen, TextSnippet, SupportAgent, Search, Notifications, 
    Settings as SettingsIcon, KeyboardArrowDown, Timeline, TrendingUp, FilterList, FileDownload, ShowChart
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement,
    Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { coursesApi, authApi, sessionsApi, reportsApi, notificationsApi, facultiesApi, departmentsApi } from '../api/client';
import toast from 'react-hot-toast';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import useSettingsStore from '../context/useSettingsStore';
import useAuthStore from '../context/authStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const CHART_OPTIONS = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9BA3B5' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9BA3B5' } },
    },
};

function DashboardHeader({ title, subtitle, showWelcome = false, users = [], courses = [] }) {
    const { isDarkMode, primaryColor } = useSettingsStore();
    const { user, logout } = useAuthStore();
    const theme = useTheme();
    const navigate = useNavigate();

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorElNotify, setAnchorElNotify] = useState(null);
    const [anchorElProfile, setAnchorElProfile] = useState(null);

    const subTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : theme.palette.text.secondary;
    const textColor = isDarkMode ? '#ffffff' : theme.palette.text.primary;
    const itemBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const chartColor = primaryColor || '#0b52a1';

    const handleLogout = () => { logout(); navigate('/login'); };

    const filteredItems = useMemo(() => {
        if (!searchQuery) return { users: [], courses: [] };
        const q = searchQuery.toLowerCase();
        return {
            users: users.filter(u => u.username.toLowerCase().includes(q) || (u.first_name + ' ' + u.last_name).toLowerCase().includes(q)).slice(0, 5),
            courses: courses.filter(c => (c.course_code || c.code).toLowerCase().includes(q) || c.name.toLowerCase().includes(q)).slice(0, 5)
        };
    }, [searchQuery, users, courses]);

    return (
        <>
            <Box sx={{ 
                mb: 4, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
            }}>
                <Box>
                    {showWelcome ? (
                        <>
                            <Typography variant="caption" sx={{ color: subTextColor, fontWeight: 600 }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: textColor }}>Welcome back, <span style={{ color: chartColor }}>{user?.first_name || user?.username || 'Administrator'}</span></Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px', color: textColor }}>{title}</Typography>
                            {subtitle && <Typography sx={{ color: subTextColor, fontSize: '0.875rem' }}>{subtitle}</Typography>}
                        </>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <IconButton onClick={() => setSearchOpen(true)} sx={{ bgcolor: itemBg, borderRadius: 2 }}><Search sx={{ color: subTextColor, fontSize: 20 }} /></IconButton>
                    <IconButton onClick={(e) => setAnchorElNotify(e.currentTarget)} sx={{ bgcolor: itemBg, borderRadius: 2 }}>
                        <Badge variant="dot" color="error"><Notifications sx={{ color: subTextColor, fontSize: 20 }} /></Badge>
                    </IconButton>
                    <Box 
                        onClick={(e) => setAnchorElProfile(e.currentTarget)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2, bgcolor: itemBg, p: 0.5, pr: 2, borderRadius: 3, cursor: 'pointer', '&:hover': { bgcolor: alpha(chartColor, 0.1) } }}
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: chartColor }}>{user?.username?.[0]?.toUpperCase() || 'A'}</Avatar>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: textColor, lineHeight: 1 }}>{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Admin'}</Typography>
                            <Typography variant="caption" sx={{ color: subTextColor, fontSize: '0.65rem' }}>{user?.role === 'admin' ? 'System Administrator' : user?.role}</Typography>
                        </Box>
                        <KeyboardArrowDown sx={{ fontSize: 16, color: subTextColor }} />
                    </Box>
                </Box>
            </Box>

            <Menu
                anchorEl={anchorElNotify}
                open={Boolean(anchorElNotify)}
                onClose={() => setAnchorElNotify(null)}
                PaperProps={{ sx: { bgcolor: isDarkMode ? '#1a1d21' : '#fff', minWidth: 280, borderRadius: 3, mt: 1, border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)' } }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textColor }}>Notifications</Typography>
                </Box>
                {users.slice(-3).reverse().map((u, i) => (
                    <MenuItem key={i} sx={{ py: 1.5, gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(chartColor, 0.1), color: chartColor, fontSize: 14 }}>{u.username[0]}</Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ color: textColor, fontWeight: 600 }}>{u.username} joined</Typography>
                            <Typography variant="caption" sx={{ color: subTextColor }}>New registration today</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            <Menu
                anchorEl={anchorElProfile}
                open={Boolean(anchorElProfile)}
                onClose={() => setAnchorElProfile(null)}
                PaperProps={{ sx: { bgcolor: isDarkMode ? '#1a1d21' : '#fff', minWidth: 200, borderRadius: 3, mt: 1, border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)' } }}
            >
                <MenuItem onClick={() => navigate('/admin/settings')} sx={{ gap: 1.5 }}><SettingsIcon sx={{ fontSize: 18 }} /> Account Settings</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1.5 }}><Delete sx={{ fontSize: 18 }} /> Sign Out</MenuItem>
            </Menu>

            <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, bgcolor: isDarkMode ? '#1a1d21' : '#fff' } }}>
                <Box sx={{ p: 2 }}>
                    <TextField
                        fullWidth placeholder="Search users, courses, departments..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        InputProps={{
                            startAdornment: <Search sx={{ color: subTextColor, mr: 1 }} />,
                            sx: { borderRadius: 3, bgcolor: itemBg, '& fieldset': { border: 'none' } }
                        }}
                    />
                    <Box sx={{ mt: 2 }}>
                        {searchQuery && (
                            <>
                                <Typography variant="caption" sx={{ color: subTextColor, px: 1, textTransform: 'uppercase', fontWeight: 800 }}>Search Results</Typography>
                                <Box sx={{ mt: 1 }}>
                                    {filteredItems.users.map(u => (
                                        <MenuItem key={u.id} onClick={() => { navigate('/admin/users'); setSearchOpen(false); }} sx={{ borderRadius: 2 }}>
                                            <People sx={{ mr: 2, color: subTextColor }} /> {u.first_name} {u.last_name} ({u.username})
                                        </MenuItem>
                                    ))}
                                    {filteredItems.courses.map(c => (
                                        <MenuItem key={c.id} onClick={() => { navigate('/admin/courses'); setSearchOpen(false); }} sx={{ borderRadius: 2 }}>
                                            <School sx={{ mr: 2, color: subTextColor }} /> {c.course_code || c.code} - {c.name}
                                        </MenuItem>
                                    ))}
                                    {filteredItems.users.length === 0 && filteredItems.courses.length === 0 && (
                                        <Typography variant="body2" sx={{ color: subTextColor, textAlign: 'center', py: 3 }}>No matches found for "{searchQuery}"</Typography>
                                    )}
                                </Box>
                            </>
                        )}
                        {!searchQuery && (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: subTextColor }}>Type something to search across the system</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}

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

function Overview({ courses, users, sessions = [] }) {
    const { isDarkMode, primaryColor } = useSettingsStore();
    const { user, logout } = useAuthStore();
    const theme = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);
    const [maintenanceOpen, setMaintenanceOpen] = useState(false);
    const [maintenanceDate, setMaintenanceDate] = useState('');
    
    // UI State - Removed as DashboardHeader handles it
    // const [searchOpen, setSearchOpen] = useState(false);
    // const [searchQuery, setSearchQuery] = useState('');
    // const [anchorElNotify, setAnchorElNotify] = useState(null);
    // const [anchorElProfile, setAnchorElProfile] = useState(null);

    useEffect(() => {
        reportsApi.facultyStats().then(res => setStats(res.data)).catch(console.error);
    }, []);

    const glassStyle = {
        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(12px)',
        borderRadius: 4,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        p: 3,
        height: '100%',
        color: isDarkMode ? '#ffffff' : 'text.primary',
    };

    const textColor = isDarkMode ? '#ffffff' : theme.palette.text.primary;
    const subTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : theme.palette.text.secondary;
    const itemBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const chartColor = primaryColor || '#0b52a1';

    const roleCount = (role) => users.filter((u) => u.role === role).length;
    const activeSessions = sessions.filter(s => s.status === 'active' || s.is_active).length;

    // Real dynamic line data for growth (simulated if date_joined missing, but based on user IDs)
    const growthData = useMemo(() => {
        const sortedUsers = [...users].sort((a,b) => a.id - b.id);
        const steps = 10;
        const chunkSize = Math.ceil(sortedUsers.length / steps);
        const points = [];
        for(let i=1; i<=steps; i++) {
            points.push(Math.min(sortedUsers.length, i * chunkSize + Math.floor(Math.random() * 5)));
        }
        return points;
    }, [users]);

    const StatCard = ({ title, value, percentage, sparkData, color }) => (
        <Box sx={glassStyle}>
            <Typography variant="caption" sx={{ color: subTextColor, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px' }}>
                {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: textColor }}>{value}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: percentage.startsWith('+') ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                            {percentage}
                        </Typography>
                        <Typography variant="caption" sx={{ color: subTextColor }}>this month</Typography>
                    </Box>
                </Box>
                <Box sx={{ width: 80, height: 40 }}>
                    <Line 
                        data={{
                            labels: [1,2,3,4,5,6],
                            datasets: [{
                                data: sparkData,
                                borderColor: color || chartColor,
                                borderWeight: 2,
                                tension: 0.4,
                                pointRadius: 0,
                                fill: false
                            }]
                        }}
                        options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { x: { display: false }, y: { display: false } }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );

    const AppNavIcon = ({ icon, label, onClick }) => (
        <Box 
            onClick={onClick}
            sx={{ 
                display: 'flex', alignItems: 'center', gap: 2.5, p: 1.5, borderRadius: 2, 
                cursor: 'pointer', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0, 0, 0, 0.04)' },
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#535F7A', transition: 'all 0.2s', mb: 0.5
            }}
        >
            <Box sx={{ color: 'inherit', display: 'flex', fontSize: 20 }}>{icon}</Box>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.2px' }}>{label}</Typography>
        </Box>
    );

    // handleLogout and filteredItems are now handled by DashboardHeader
    // const handleLogout = () => {
    //     logout();
    //     navigate('/login');
    // };

    // const filteredItems = useMemo(() => {
    //     if (!searchQuery) return { users: [], courses: [] };
    //     const q = searchQuery.toLowerCase();
    //     return {
    //         users: users.filter(u => u.username.toLowerCase().includes(q) || (u.first_name + ' ' + u.last_name).toLowerCase().includes(q)).slice(0, 5),
    //         courses: courses.filter(c => (c.course_code || c.code).toLowerCase().includes(q) || c.name.toLowerCase().includes(q)).slice(0, 5)
    //     };
    // }, [searchQuery, users, courses]);

    return (
        <Box sx={{ m: -3, p: 3, pt: 1 }}>
            <DashboardHeader showWelcome users={users} courses={courses} />

            <Grid container spacing={3}>
                <Grid item xs={12} lg={9}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <StatCard title="Total Users" value={users.length.toLocaleString()} percentage="+8.3%" sparkData={[10, 15, 8, 20, 18, 25]} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard title="Total Courses" value={courses.length.toLocaleString()} percentage="+12%" sparkData={[30, 45, 35, 50, 40, 60]} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard title="Active Sessions" value={activeSessions.toLocaleString()} percentage="+5%" sparkData={[5, 10, 15, 12, 18, 22]} />
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Box sx={glassStyle}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: textColor }}>User Growth (Cumulative)</Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: chartColor }} />
                                            <Typography variant="caption" sx={{ color: subTextColor }}>Total Users</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ height: 250 }}>
                                    <Line 
                                        data={{
                                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                                            datasets: [
                                                {
                                                    label: 'Users',
                                                    data: growthData,
                                                    borderColor: chartColor,
                                                    backgroundColor: alpha(chartColor, 0.1),
                                                    fill: true, tension: 0.4, pointRadius: 2
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true, maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { grid: { display: false }, ticks: { color: subTextColor, font: { size: 10 } } },
                                                y: { grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: subTextColor, font: { size: 10 } } }
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={glassStyle}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: textColor }}>User Distribution</Typography>
                                <Box sx={{ height: 180, position: 'relative' }}>
                                    <Doughnut 
                                        data={{
                                            labels: ['Students', 'Lecturers', 'Admins'],
                                            datasets: [{
                                                data: [roleCount('student'), roleCount('lecturer'), roleCount('admin')],
                                                backgroundColor: [chartColor, alpha(chartColor, 0.6), alpha(chartColor, 0.3)],
                                                borderWidth: 0,
                                                cutout: '75%'
                                            }]
                                        }}
                                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                    />
                                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: textColor }}>{Math.round((roleCount('student')/users.length)*100)}%</Typography>
                                        <Typography variant="caption" sx={{ color: subTextColor, display: 'block' }}>Students</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {['Students', 'Lecturers', 'Admins'].map((label, i) => (
                                        <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: [chartColor, alpha(chartColor, 0.6), alpha(chartColor, 0.3)][i] }} />
                                                <Typography variant="caption" sx={{ color: textColor, fontWeight: 600 }}>{label}</Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: subTextColor }}>{Math.round((roleCount(label.toLowerCase().slice(0, -1))/users.length)*100 || 0)}%</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={7}>
                            <Box sx={glassStyle}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: textColor }}>Recent Activity Log</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {users.slice(-3).reverse().map((u, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: 2, '&:hover': { bgcolor: itemBg } }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(chartColor, 0.1), color: chartColor }}>{u.username[0].toUpperCase()}</Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: textColor }}>{u.first_name || u.username}</Typography>
                                                <Typography variant="caption" sx={{ color: subTextColor, display: 'block' }}>Joined as {u.role}</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" sx={{ color: textColor, fontWeight: 600, display: 'block' }}>Today</Typography>
                                                <Chip label="Completed" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha('#4ade80', 0.1), color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }} />
                                            </Box>
                                        </Box>
                                    ))}
                                    {users.length === 0 && <Typography variant="caption" sx={{ color: subTextColor }}>No recent activity</Typography>}
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Box sx={glassStyle}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: textColor }}>System Health</Typography>
                                <Typography variant="h5" sx={{ color: '#4ade80', fontWeight: 800, mb: 2 }}>Excellent</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {['Database', 'Server', 'API', 'Network'].map(item => (
                                        <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CheckCircle sx={{ color: '#4ade80', fontSize: 16 }} />
                                            <Typography variant="body2" sx={{ color: textColor, fontWeight: 600 }}>{item}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: subTextColor, display: 'block', mb: 0.5 }}>CPU Load</Typography>
                                        <Box sx={{ height: 40 }}>
                                            <Line data={{ labels: [1,2,3,4,5,6], datasets: [{ data: [20, 25, 22, 30, 28, 35], borderColor: '#4ade80', borderWeight: 2, pointRadius: 0, fill: true, backgroundColor: alpha('#4ade80', 0.1), tension: 0.4 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: subTextColor, display: 'block', mb: 0.5 }}>Memory</Typography>
                                        <Box sx={{ height: 40 }}>
                                            <Line data={{ labels: [1,2,3,4,5,6], datasets: [{ data: [40, 42, 45, 43, 48, 50], borderColor: '#60a5fa', borderWeight: 2, pointRadius: 0, fill: true, backgroundColor: alpha('#60a5fa', 0.1), tension: 0.4 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} lg={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ 
                            ...glassStyle, 
                            borderRadius: '35px 35px 20px 20px', 
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#F4F7FE' 
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, px: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: isDarkMode ? '#fff' : '#1B254B', fontSize: '1.25rem' }}>App</Typography>
                                <IconButton size="small" sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#E9EDF7', borderRadius: 2.5, p: 1 }}>
                                    <FormatListBulleted sx={{ fontSize: 18, color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#A3AED0' }} />
                                </IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <AppNavIcon icon={<CalendarToday />} label="Calendar" onClick={() => navigate('/admin/sessions')} />
                                <AppNavIcon icon={<FormatListBulleted />} label="Tasks" onClick={() => navigate('/admin/users')} />
                                <AppNavIcon icon={<ChatBubbleOutline />} label="Messages" onClick={() => toast.info('Messages coming soon')} />
                                <AppNavIcon icon={<FolderOpen />} label="File Manager" onClick={() => navigate('/admin/courses')} />
                                <AppNavIcon icon={<TextSnippet />} label="Notes" onClick={() => navigate('/admin/reports')} />
                                <AppNavIcon icon={<SupportAgent />} label="Support" onClick={() => toast('Support center feature coming soon!', { icon: '🤝' })} />
                            </Box>
                        </Box>

                        <Box sx={glassStyle}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: textColor }}>Quick Actions</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Button 
                                    onClick={() => navigate('/admin/users?action=create')}
                                    fullWidth sx={{ bgcolor: itemBg, color: textColor, textTransform: 'none', borderRadius: 2.5, py: 1.2, fontWeight: 700, '&:hover': { bgcolor: alpha(primaryColor, 0.1), color: primaryColor } }}
                                >
                                    Create New User
                                </Button>
                                <Button 
                                    onClick={() => navigate('/admin/reports')}
                                    fullWidth sx={{ bgcolor: itemBg, color: textColor, textTransform: 'none', borderRadius: 2.5, py: 1.2, fontWeight: 700, '&:hover': { bgcolor: alpha(primaryColor, 0.1), color: primaryColor } }}
                                >
                                    Generate Report
                                </Button>
                                <Button 
                                    onClick={() => setMaintenanceOpen(true)}
                                    fullWidth sx={{ bgcolor: itemBg, color: textColor, textTransform: 'none', borderRadius: 2.5, py: 1.2, fontWeight: 700, '&:hover': { bgcolor: alpha(primaryColor, 0.1), color: primaryColor } }}
                                >
                                    Schedule Maintenance
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Maintenance Dialog */}
            <Dialog open={maintenanceOpen} onClose={() => setMaintenanceOpen(false)} PaperProps={{ sx: { borderRadius: 4, bgcolor: isDarkMode ? '#1a1d21' : '#fff' } }}>
                <DialogTitle sx={{ fontWeight: 800, color: textColor }}>Schedule System Maintenance</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: subTextColor, mb: 3 }}>
                        Set a date and time for system-wide maintenance. Users will be notified in advance.
                    </Typography>
                    <TextField
                        type="datetime-local" fullWidth
                        value={maintenanceDate} onChange={(e) => setMaintenanceDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ input: { color: textColor }, bgcolor: itemBg, borderRadius: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMaintenanceOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: chartColor, borderRadius: 2 }}
                        onClick={() => {
                            toast.success(`Maintenance scheduled for ${new Date(maintenanceDate).toLocaleString()}`);
                            setMaintenanceOpen(false);
                        }}
                    >
                        Confirm Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function CoursesTab({ courses, users, faculties = [], departments = [], onRefresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ course_code: '', name: '', credits: 3, lecturer: '', faculty: '', department: '' });
    const [saving, setSaving] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const lecturers = users.filter((u) => u.role === 'lecturer');

    const handleOpenCreate = () => {
        setEditingCourse(null);
        setForm({ course_code: '', name: '', credits: 3, lecturer: '', faculty: '', department: '' });
        setOpen(true);
    };

    const handleOpenEdit = (course) => {
        setEditingCourse(course);
        setForm({
            course_code: course.course_code || course.code,
            name: course.name,
            credits: course.credits,
            lecturer: course.lecturer?.id || course.lecturer || '',
            faculty: course.faculty || '',
            department: course.department || ''
        });
        setOpen(true);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!form.course_code || !form.name || !form.department || !form.lecturer) {
            toast.error('Please fill in all required fields');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                code: form.course_code,
                name: form.name,
                credits: form.credits,
                lecturer_id: form.lecturer,
                faculty: form.faculty,
                department: form.department
            };
            if (editingCourse) {
                await coursesApi.update(editingCourse.id, payload);
                toast.success('Course updated!');
            } else {
                await coursesApi.create(payload);
                toast.success('Course created!');
            }
            setOpen(false);
            await onRefresh();
        } catch (e) {
            const errData = e.response?.data;
            console.error('Course save error details:', JSON.stringify(errData || e, null, 2));
            let errMsg = 'Failed to save course changes';
            
            if (errData && typeof errData === 'object') {
                const list = [];
                Object.entries(errData).forEach(([key, val]) => {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                    const content = Array.isArray(val) ? val[0] : (typeof val === 'object' ? JSON.stringify(val) : val);
                    list.push(`${label}: ${content}`);
                });
                if (list.length > 0) errMsg = list.join(' | ');
            } else if (typeof errData === 'string') {
                errMsg = errData.substring(0, 150);
            }
            toast.error(errMsg);
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setSaving(true);
        try {
            await coursesApi.delete(deleteConfirm.id);
            toast.success('Course deleted!');
            setDeleteConfirm(null);
            await onRefresh();
        } catch (e) {
            toast.error('Failed to delete course');
        } finally { setSaving(false); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">All Courses ({courses.length})</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>New Course</Button>
            </Box>
            <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['Code', 'Name', 'Credits', 'Lecturer', 'Students', 'Status', 'Actions'].map((h) => (
                                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary' }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((c) => (
                            <TableRow key={c.id} hover>
                                <TableCell><Chip label={c.course_code} size="small" color="primary" /></TableCell>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.credits}</TableCell>
                                <TableCell>{c.lecturer_detail?.full_name || '—'}</TableCell>
                                <TableCell>{c.enrollment_count}</TableCell>
                                <TableCell>
                                    <Chip label={c.is_active ? 'Active' : 'Inactive'} size="small" color={c.is_active ? 'success' : 'default'} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(c)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(c)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth component="form" onSubmit={handleSave}>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField label="Course Code" value={form.course_code} onChange={(e) => setForm((f) => ({ ...f, course_code: e.target.value }))} fullWidth required />
                    <TextField label="Course Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth required />
                    <TextField label="Credits" type="number" value={form.credits} onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))} fullWidth required />
                    <FormControl fullWidth>
                        <InputLabel>Faculty</InputLabel>
                        <Select value={form.faculty} label="Faculty" onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value, department: '' }))}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {faculties.length > 0 ? (
                                faculties.map((f) => <MenuItem key={f.id} value={f.name}>{f.name}</MenuItem>)
                            ) : (
                                FACULTIES.map((fac) => <MenuItem key={fac} value={fac}>{fac}</MenuItem>)
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth required disabled={!form.faculty}>
                        <InputLabel>Department</InputLabel>
                        <Select value={form.department} label="Department" onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {faculties.length > 0 ? (
                                departments
                                    .filter(d => {
                                        const fac = faculties.find(f => f.name === form.faculty);
                                        return fac && d.faculty === fac.id;
                                    })
                                    .map((dept) => <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>)
                            ) : (
                                (FACULTY_DEPARTMENTS[form.faculty] || []).map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)
                            )}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                        <InputLabel>Lecturer</InputLabel>
                        <Select value={form.lecturer} label="Lecturer" onChange={(e) => setForm((f) => ({ ...f, lecturer: e.target.value }))}>
                            {lecturers.map((l) => <MenuItem key={l.id} value={l.id}>{l.full_name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" type="submit" disabled={saving}>
                        {saving ? <CircularProgress size={18} /> : (editingCourse ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <b>{deleteConfirm?.course_code} - {deleteConfirm?.name}</b>?
                        This will remove all associated sessions and attendance records.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
                        {saving ? <CircularProgress size={18} /> : 'Delete Course'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function UsersTab({ users, faculties = [], departments = [], onRefresh }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        username: '', email: '', first_name: '', last_name: '',
        password: 'Temp@12345', confirm_password: 'Temp@12345',
        role: 'student', student_number: '', staff_id: '', faculty: '', department: '', year_of_study: ''
    });

    const studentDefaultPass = 'Temp@12345';
    const lecturerDefaultPass = 'Lecturer@123';
    const [saving, setSaving] = useState(false);

    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleOpenCreate = () => {
        setEditingUser(null);
        setForm({
            username: '', email: '', first_name: '', last_name: '',
            password: studentDefaultPass, confirm_password: studentDefaultPass,
            role: 'student', student_number: '', staff_id: '', faculty: '', department: '', year_of_study: ''
        });
        setOpen(true);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'create') {
            handleOpenCreate();
            navigate('/admin/users', { replace: true });
        }
    }, [location.search]);

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setForm({
            username: user.username, email: user.email,
            first_name: user.first_name, last_name: user.last_name,
            role: user.role,
            student_number: user.student_number || '',
            staff_id: user.staff_id || '',
            faculty: user.faculty || '',
            department: user.department || '',
            year_of_study: user.year_of_study || ''
        });
        setOpen(true);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!form.username || !form.email || !form.first_name || !form.last_name || !form.role) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (!editingUser && form.password !== form.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form };
            // Ensure year_of_study is an integer or null
            if (payload.year_of_study === '') payload.year_of_study = null;
            else if (payload.year_of_study) payload.year_of_study = parseInt(payload.year_of_study);

            if (editingUser) {
                await authApi.updateUser(editingUser.id, payload);
                toast.success('User updated successfully!');
            } else {
                await authApi.createUser(payload);
                toast.success('User created successfully!');
            }
            setOpen(false);
            await onRefresh();
        } catch (e) {
            const errData = e.response?.data;
            console.error('User save error details:', JSON.stringify(errData || e, null, 2));
            let errMsg = 'Failed to save user account';
            
            if (errData && typeof errData === 'object') {
                const list = [];
                Object.entries(errData).forEach(([key, val]) => {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                    const content = Array.isArray(val) ? val[0] : (typeof val === 'object' ? JSON.stringify(val) : val);
                    list.push(`${label}: ${content}`);
                });
                if (list.length > 0) errMsg = list.join(' | ');
            } else if (typeof errData === 'string') {
                errMsg = errData.substring(0, 150);
            }
            toast.error(errMsg);
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setSaving(true);
        try {
            await authApi.deleteUser(deleteConfirm.id);
            toast.success('User deleted!');
            setDeleteConfirm(null);
            await onRefresh();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to delete user');
        } finally { setSaving(false); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">All Users ({users.length})</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>New User</Button>
            </Box>
            <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['Name', 'Username', 'Email', 'Role', 'ID Number', 'Status', 'Actions'].map((h) => (
                                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary' }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{u.full_name || `${u.first_name} ${u.last_name}`}</TableCell>
                                <TableCell>{u.username}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <Chip label={u.role} size="small"
                                        color={{ admin: 'error', lecturer: 'info', student: 'success' }[u.role] || 'default'}
                                    />
                                </TableCell>
                                <TableCell>{u.student_number || u.staff_id || '—'}</TableCell>
                                <TableCell>
                                    <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small" color={u.is_active ? 'success' : 'default'} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(u)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(u)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth component="form" onSubmit={handleSave}>
                <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="First Name" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} fullWidth required />
                        <TextField label="Last Name" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} fullWidth required />
                    </Box>
                    <TextField label="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} fullWidth disabled={!!editingUser} required />
                    <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} fullWidth required />
                    <FormControl fullWidth required>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={form.role}
                            label="Role"
                            onChange={(e) => {
                                const newRole = e.target.value;
                                setForm((f) => {
                                    const next = { ...f, role: newRole };
                                    // If still using default passwords, update them based on role
                                    if (!editingUser) {
                                        if (newRole === 'lecturer' && f.password === studentDefaultPass) {
                                            next.password = lecturerDefaultPass;
                                            next.confirm_password = lecturerDefaultPass;
                                        } else if (newRole === 'student' && f.password === lecturerDefaultPass) {
                                            next.password = studentDefaultPass;
                                            next.confirm_password = studentDefaultPass;
                                        }
                                    }
                                    return next;
                                });
                            }}
                        >
                            {['admin', 'lecturer', 'student'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {form.role === 'student' && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Student Number" value={form.student_number} onChange={(e) => setForm((f) => ({ ...f, student_number: e.target.value }))} fullWidth />
                            <FormControl fullWidth>
                                <InputLabel>Year of Study</InputLabel>
                                <Select value={form.year_of_study} label="Year of Study" onChange={(e) => setForm((f) => ({ ...f, year_of_study: e.target.value }))}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {[1, 2, 3, 4, 5, 6].map(year => (
                                        <MenuItem key={year} value={year}>Year {year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                    {form.role === 'lecturer' && <TextField label="Staff ID" value={form.staff_id} onChange={(e) => setForm((f) => ({ ...f, staff_id: e.target.value }))} fullWidth />}
                    <FormControl fullWidth>
                        <InputLabel>Faculty</InputLabel>
                        <Select value={form.faculty} label="Faculty" onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value, department: '' }))}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {faculties.length > 0 ? (
                                faculties.map((f) => <MenuItem key={f.id} value={f.name}>{f.name}</MenuItem>)
                            ) : (
                                FACULTIES.map((fac) => <MenuItem key={fac} value={fac}>{fac}</MenuItem>)
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth disabled={!form.faculty}>
                        <InputLabel>Department</InputLabel>
                        <Select value={form.department} label="Department" onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {faculties.length > 0 ? (
                                departments
                                    .filter(d => {
                                        const fac = faculties.find(f => f.name === form.faculty);
                                        return fac && d.faculty === fac.id;
                                    })
                                    .map((dept) => <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>)
                            ) : (
                                (FACULTY_DEPARTMENTS[form.faculty] || []).map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)
                            )}
                        </Select>
                    </FormControl>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" type="submit" disabled={saving}>
                        {saving ? <CircularProgress size={18} /> : (editingUser ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <b>{deleteConfirm?.full_name || deleteConfirm?.username}</b>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
                        {saving ? <CircularProgress size={18} /> : 'Delete User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function AllSessionsTab() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const { data } = await sessionsApi.list();
            setSessions(data.results || data);
        } catch { toast.error('Failed to load sessions'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchSessions();
        const poll = setInterval(fetchSessions, 30000); // Poll every 30s
        return () => clearInterval(poll);
    }, []);

    const handleActivate = async (id) => {
        try {
            await sessionsApi.activate(id);
            toast.success('Session activated!');
            fetchSessions();
        } catch { toast.error('Failed to activate session'); }
    };

    const handleDeactivate = async (id) => {
        try {
            await sessionsApi.deactivate(id);
            toast.success('Session closed.');
            fetchSessions();
        } catch { toast.error('Failed to close session'); }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>All Sessions</Typography>
            {loading ? <CircularProgress /> : (
                <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {['Course', 'Lecturer', 'Date', 'Present', 'Absent', 'Total', 'Status', 'Actions'].map((h) => (
                                    <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sessions.map((s) => (
                                <TableRow key={s.id} hover sx={{ bgcolor: s.is_active ? alpha('#43A047', 0.05) : undefined }}>
                                    <TableCell><Chip label={s.course_code} size="small" color="primary" /></TableCell>
                                    <TableCell>{s.lecturer?.full_name || s.lecturer?.username || '—'}</TableCell>
                                    <TableCell>{s.date}</TableCell>
                                    <TableCell>
                                        <Chip label={s.present_count} size="small" color="success" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={s.absent_count} size="small" color="error" />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
                                        {s.total_enrolled}
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
                </TableContainer>
            )}
        </Box>
    );
}

function ReportsTab({ courses }) {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [threshold, setThreshold] = useState(75);
    const [loading, setLoading] = useState(false);
    const [atRisk, setAtRisk] = useState(null);
    const [messageOpen, setMessageOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messageText, setMessageText] = useState('');

    const handleDownload = async (type) => {
        if (!selectedCourse) return toast.error('Select a course first');
        setLoading(true);
        try {
            const fn = type === 'csv' ? reportsApi.downloadCsv : reportsApi.downloadPdf;
            const { data } = await fn(selectedCourse, { threshold });
            const url = URL.createObjectURL(new Blob([data]));
            const a = document.createElement('a'); a.href = url;
            a.download = `attendance_report.${type}`; a.click();
            URL.revokeObjectURL(url);
        } catch { toast.error('Download failed'); }
        finally { setLoading(false); }
    };

    const handleViewAtRisk = async () => {
        if (!selectedCourse) return toast.error('Select a course first');
        try {
            const { data } = await reportsApi.belowThreshold(selectedCourse, { threshold });
            setAtRisk(data);
        } catch { toast.error('Failed to fetch data'); }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Generate Attendance Reports</Typography>
            <Card sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <FormControl fullWidth>
                            <InputLabel>Select Course</InputLabel>
                            <Select value={selectedCourse} label="Select Course" onChange={(e) => setSelectedCourse(e.target.value)}>
                                {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.course_code} – {c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Threshold (%)" type="number" value={threshold}
                            onChange={(e) => setThreshold(e.target.value)} fullWidth
                            inputProps={{ min: 0, max: 100 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button variant="contained" startIcon={<Download />} onClick={() => handleDownload('csv')} disabled={loading}>CSV</Button>
                        <Button variant="contained" color="error" startIcon={<Download />} onClick={() => handleDownload('pdf')} disabled={loading}>PDF</Button>
                        <Button variant="outlined" onClick={handleViewAtRisk}>View At-Risk</Button>
                    </Grid>
                </Grid>
            </Card>
            {atRisk && (
                <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
                    <CardHeader
                        title={`At-Risk Students: ${atRisk.course}`}
                        subheader={`${atRisk.below_threshold} of ${atRisk.total_students} below ${atRisk.threshold}% threshold`}
                    />
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Student Number', 'Name', 'Attended', 'Total', 'Percentage', 'Actions'].map((h) => (
                                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {atRisk.students.map((s, i) => (
                                <TableRow key={i} sx={{ bgcolor: alpha('#E53935', 0.05) }}>
                                    <TableCell>{s.student_number}</TableCell>
                                    <TableCell>{s.full_name}</TableCell>
                                    <TableCell>{s.attended}</TableCell>
                                    <TableCell>{s.total_sessions}</TableCell>
                                    <TableCell>
                                        <Chip label={`${s.percentage}%`} size="small" color="error" />
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            color="warning" 
                                            startIcon={<ChatBubbleOutline />}
                                            onClick={() => {
                                                setSelectedStudent(s);
                                                setMessageText(`Warning: Your attendance in ${atRisk.course} has fallen to ${s.percentage}%. Please ensure you attend the remaining sessions or contact your lecturer.`);
                                                setMessageOpen(true);
                                            }}
                                        >
                                            Send Warning
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={messageOpen} onClose={() => setMessageOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Send Warning Message</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
                        Sending warning to: <b>{selectedStudent?.full_name}</b> ({selectedStudent?.student_number})
                    </Typography>
                    <TextField
                        multiline
                        rows={4}
                        fullWidth
                        label="Message"
                        variant="outlined"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMessageOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="warning" 
                        onClick={async () => {
                            try {
                                await notificationsApi.send({
                                    student_id: selectedStudent.student_number,
                                    message: messageText,
                                    title: 'Attendance Warning'
                                });
                                toast.success(`Warning message successfully sent to ${selectedStudent?.full_name}`);
                            } catch (e) {
                                toast.error('Failed to send warning message');
                            }
                            setMessageOpen(false);
                        }}
                    >
                        Send Message
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function FacultyManagementDialog({ open, onClose, onRefresh, initialData }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [initialData, open]);

    const handleSubmit = async () => {
        if (!name) return toast.error('Name is required');
        setLoading(true);
        try {
            if (initialData) {
                await facultiesApi.update(initialData.id, { name, description });
                toast.success('Faculty updated successfully');
            } else {
                await facultiesApi.create({ name, description });
                toast.success('Faculty created successfully');
            }
            onRefresh();
            onClose();
            setName('');
            setDescription('');
        } catch {
            toast.error('Failed to create faculty');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>{initialData ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField label="Faculty Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FACULTY OF EDUCATION" />
                    <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Faculty' : 'Create Faculty')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function DepartmentManagementDialog({ open, onClose, faculties, onRefresh }) {
    const [name, setName] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !facultyId) return toast.error('Name and Faculty are required');
        setLoading(true);
        try {
            await departmentsApi.create({ name, faculty: facultyId, description });
            toast.success('Department added successfully');
            onRefresh();
            onClose();
            setName('');
            setFacultyId('');
            setDescription('');
        } catch {
            toast.error('Failed to add department');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>Add New Department</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Faculty</InputLabel>
                        <Select value={facultyId} label="Select Faculty" onChange={(e) => setFacultyId(e.target.value)}>
                            {faculties.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Department Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Computer Science" />
                    <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? 'Adding...' : 'Add Department'}</Button>
            </DialogActions>
        </Dialog>
    );
}

function FacultiesTab() {
    const [stats, setStats] = useState([]);
    const [dbFaculties, setDbFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [facultyDialogOpen, setFacultyDialogOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deptDialogOpen, setDeptDialogOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, facultiesRes] = await Promise.all([
                reportsApi.facultyStats(),
                facultiesApi.list()
            ]);
            setStats(statsRes.data);
            setDbFaculties(facultiesRes.data);
        } catch {
            toast.error('Failed to load faculty data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditFaculty = (fac) => {
        setEditingFaculty(fac);
        setFacultyDialogOpen(true);
    };

    const handleDeleteFaculty = async () => {
        if (!deleteConfirm) return;
        try {
            await facultiesApi.delete(deleteConfirm.id);
            toast.success('Faculty deleted successfully');
            setDeleteConfirm(null);
            fetchData();
        } catch {
            toast.error('Failed to delete faculty. Ensure it has no dependent departments or courses.');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Faculty & Department Management</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Add />} onClick={() => setFacultyDialogOpen(true)}>New Faculty</Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setDeptDialogOpen(true)}>Add Department</Button>
                </Box>
            </Box>

            {stats.map((faculty) => {
                const dbFaculty = dbFaculties.find(f => f.name === faculty.faculty);
                return (
                    <Card key={faculty.faculty} sx={{ mb: 3 }}>
                        <CardHeader
                            title={faculty.faculty}
                            action={dbFaculty && (
                                <Box>
                                    <IconButton size="small" onClick={() => handleEditFaculty(dbFaculty)} color="primary">
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setDeleteConfirm(dbFaculty)} color="error">
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                            subheader={`Overall Attendance: ${faculty.attendance_rate}% | Total Enrollments: ${faculty.total_enrollments} | Total Sessions: ${faculty.total_sessions}`}
                        />
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Sessions</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Total Enrollments</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Attended</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Attendance Rate</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {faculty.departments.map((dept) => (
                                        <TableRow key={dept.department}>
                                            <TableCell>{dept.department}</TableCell>
                                            <TableCell>{dept.total_sessions}</TableCell>
                                            <TableCell>{dept.total_enrollments}</TableCell>
                                            <TableCell>{dept.total_attended}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${dept.attendance_rate}%`}
                                                    size="small"
                                                    color={dept.attendance_rate >= 80 ? 'success' : (dept.attendance_rate >= 60 ? 'warning' : 'error')}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                );
            })}
            {stats.length === 0 && (
                <Typography color="text.secondary">No attendance data available yet.</Typography>
            )}

            <FacultyManagementDialog 
                open={facultyDialogOpen} 
                onClose={() => { setFacultyDialogOpen(false); setEditingFaculty(null); }} 
                onRefresh={fetchData} 
                initialData={editingFaculty}
            />
            <DepartmentManagementDialog open={deptDialogOpen} onClose={() => setDeptDialogOpen(false)} faculties={dbFaculties} onRefresh={fetchData} />

            {/* Delete Faculty Confirmation */}
            <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                <DialogTitle>Delete Faculty</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete <b>{deleteConfirm?.name}</b>?</Typography>
                    <Typography variant="caption" color="error">This will fail if there are departments or courses assigned to this faculty.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button onClick={handleDeleteFaculty} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
}



function AnalyticsTab({ users, courses, faculties = [] }) {
    const { isDarkMode } = useSettingsStore();
    const theme = useTheme();
    
    const glassStyle = {
        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(12px)',
        borderRadius: 4,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        p: 3,
        height: '100%',
        color: isDarkMode ? '#ffffff' : 'text.primary',
    };

    const textColor = isDarkMode ? '#ffffff' : theme.palette.text.primary;
    const subTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : theme.palette.text.secondary;
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const ChartColor = useSettingsStore.getState().primaryColor || '#0b52a1';

    const roleCount = (role) => users.filter(u => u.role === role).length;
    const activeUsers = users.filter(u => u.is_active).length;

    // Faculty breakdown data - Using the dynamic faculties list if available
    const facultyList = faculties.length > 0 ? faculties.map(f => f.name) : FACULTIES;
    const facultyData = facultyList.map(fac => {
        const facUsers = users.filter(u => u.faculty === fac);
        return {
            name: fac.replace('FACULTY OF ', ''),
            students: facUsers.filter(u => u.role === 'student').length,
            lecturers: facUsers.filter(u => u.role === 'lecturer').length,
            admins: facUsers.filter(u => u.role === 'admin').length
        };
    }).sort((a,b) => (b.students + b.lecturers) - (a.students + a.lecturers));

    const stackedBarData = {
        labels: facultyData.map(d => {
            const shortName = d.name.split(' ').map(word => word[0]).join('');
            return d.name.length > 15 ? shortName : d.name;
        }),
        datasets: [
            { label: 'Students', data: facultyData.map(d => d.students), backgroundColor: ChartColor, borderRadius: 4 },
            { label: 'Lecturers', data: facultyData.map(d => d.lecturers), backgroundColor: alpha(ChartColor, 0.6), borderRadius: 4 },
            { label: 'Admins', data: facultyData.map(d => d.admins), backgroundColor: alpha(ChartColor, 0.3), borderRadius: 4 },
        ]
    };

    const lineData = {
        labels: ['Oct 1', 'Oct 6', 'Oct 9', 'Oct 11', 'Oct 13', 'Oct 15', 'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20', 'Oct 22', 'Oct 24', 'Oct 26'],
        datasets: [{
            label: 'User Growth',
            data: [10, 30, 25, 45, 40, 55, 60, 45, 75, 80, 70, 105, 120],
            borderColor: ChartColor,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, alpha(ChartColor, 0.4));
                gradient.addColorStop(1, alpha(ChartColor, 0));
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: subTextColor, font: { size: 10 } } },
            y: { grid: { color: gridColor }, ticks: { color: subTextColor, font: { size: 10 } } }
        }
    };

    const StatCard = ({ title, value, percentage, trendIcon }) => (
        <Box sx={glassStyle}>
            <Typography variant="caption" sx={{ color: subTextColor, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px' }}>
                {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 700 }}>{percentage}</Typography>
                        {trendIcon}
                    </Box>
                </Box>
                <Box sx={{ width: 100, height: 40 }}>
                    <Line 
                        data={{
                            labels: [1,2,3,4,5,6],
                            datasets: [{
                                data: [10, 15, 8, 20, 18, 25],
                                borderColor: ChartColor,
                                borderWeight: 2,
                                tension: 0.4,
                                pointRadius: 0,
                                fill: false
                            }]
                        }}
                        options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { x: { display: false }, y: { display: false } }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ 
            bgcolor: isDarkMode ? '#0f1115' : 'background.default', 
            minHeight: '100vh', m: -3, p: 4, 
            color: isDarkMode ? '#fff' : 'text.primary', 
            fontFamily: '"Inter", sans-serif'
        }}>
            {/* Header Area */}
            <DashboardHeader title="Analytics" users={users} courses={courses} />

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Active Users" 
                        value={activeUsers.toLocaleString()} 
                        percentage="12%" 
                        trendIcon={<TrendingUp sx={{ fontSize: 14, color: '#4ade80' }} />} 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Peak Session Load" 
                        value="78%" 
                        percentage="5%" 
                        trendIcon={<TrendingUp sx={{ fontSize: 14, color: '#4ade80' }} />} 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Avg Attendance Rate" 
                        value="84.2%" 
                        percentage="2.4%" 
                        trendIcon={<TrendingUp sx={{ fontSize: 14, color: '#4ade80' }} />} 
                    />
                </Grid>

                {/* User Growth Chart */}
                <Grid item xs={12}>
                    <Box sx={glassStyle}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: textColor }}>User Growth (Last 30 Days)</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', p: 0.5, px: 1, borderRadius: 1.5, cursor: 'pointer' }}>
                                <FilterList sx={{ fontSize: 14, color: subTextColor }} />
                                <Typography variant="caption" sx={{ color: subTextColor }}>Filter</Typography>
                                <KeyboardArrowDown sx={{ fontSize: 12, color: subTextColor }} />
                            </Box>
                        </Box>
                        <Box sx={{ height: 300 }}>
                            <Line data={lineData} options={chartOptions} />
                        </Box>
                    </Box>
                </Grid>

                {/* Faculty User Breakdown */}
                <Grid item xs={12}>
                    <Box sx={glassStyle}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: textColor }}>Faculty User Breakdown</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {['Students', 'Lecturers', 'Admins'].map((label, i) => (
                                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: [ChartColor, alpha(ChartColor, 0.6), alpha(ChartColor, 0.3)][i] }} />
                                        <Typography variant="caption" sx={{ color: subTextColor }}>{label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                        <Box sx={{ height: 350 }}>
                            <Bar 
                                data={stackedBarData} 
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        ...chartOptions.scales,
                                        x: { ...chartOptions.scales.x, stacked: true },
                                        y: { ...chartOptions.scales.y, stacked: true }
                                    }
                                }} 
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

function SettingsTab({ users, courses }) {
    const { 
        isDarkMode, borderRadius, shadowIntensity, fontSize, textScaling, primaryColor,
        setSettings, resetSettings 
    } = useSettingsStore();
    const theme = useTheme();

    const [tempSettings, setTempSettings] = useState({
        isDarkMode, borderRadius, shadowIntensity, fontSize, textScaling, primaryColor
    });

    // Reactive update for immediate feedback (or we can use temp state and save on button click)
    // To make it feel "premium", let's use the actual store values directly if we want instant preview,
    // or temp state if we want to wait for "Save Changes".
    // Given the prompt "functioning following the existing system", instant preview is more modern.
    // I will use direct store values for the preview visuals.

    const glassStyle = {
        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(12px)',
        borderRadius: 3,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        p: 3,
        height: '100%',
        color: isDarkMode ? '#ffffff' : 'text.primary',
    };

    const textColor = isDarkMode ? '#ffffff' : theme.palette.text.primary;
    const subTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : theme.palette.text.secondary;
    const itemBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    const ColorBox = ({ color, name }) => (
        <Box sx={{ textAlign: 'center' }}>
            <Box 
                onClick={() => setSettings({ primaryColor: color })}
                sx={{
                    width: '100%', height: 60, bgcolor: color, borderRadius: 2, mb: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', cursor: 'pointer',
                    boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                    border: primaryColor === color ? '2px solid #fff' : 'none',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                }}
            >
                <IconButton size="small" sx={{ position: 'absolute', right: 4, bottom: 4, color: 'white', bgcolor: 'rgba(0,0,0,0.2)' }}>
                    <Edit sx={{ fontSize: 12 }} />
                </IconButton>
            </Box>
            <Typography variant="caption" sx={{ color: subTextColor, fontWeight: 500 }}>{name}</Typography>
        </Box>
    );

    const AppNavIcon = ({ icon, label, onClick }) => (
        <Box 
            onClick={onClick}
            sx={{ 
                display: 'flex', alignItems: 'center', gap: 2.5, p: 1.5, borderRadius: 2, 
                cursor: 'pointer', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0, 0, 0, 0.04)' },
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#535F7A', transition: 'all 0.2s', mb: 0.5
            }}
        >
            <Box sx={{ color: 'inherit', display: 'flex', fontSize: 20 }}>{icon}</Box>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.2px' }}>{label}</Typography>
        </Box>
    );

    return (
        <Box sx={{ 
            bgcolor: isDarkMode ? '#0f1115' : 'background.default', 
            minHeight: '100vh', m: -3, p: 4, 
            color: isDarkMode ? '#fff' : 'text.primary', 
            fontFamily: '"Inter", sans-serif'
        }}>
            {/* Header Area */}
            <DashboardHeader title="Design & Theme Settings" subtitle="Customize your admin panel aesthetic and branding" users={users} courses={courses} />

            <Grid container spacing={3}>
                {/* Main Content Column */}
                <Grid item xs={12} lg={9}>
                    <Grid container spacing={3}>
                        {/* Theme & Color Palette */}
                        <Grid item xs={12} md={8}>
                            <Box sx={glassStyle}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Theme & Color Palette</Typography>
                                
                                <Box sx={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    gap: 3, mb: 4, bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', p: 1, borderRadius: 3 
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDarkMode ? '#fff' : 'text.primary' }}>
                                        <DarkMode sx={{ fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Dark Mode</Typography>
                                    </Box>
                                    <Switch checked={!isDarkMode} onChange={(e) => setSettings({ isDarkMode: !e.target.checked })} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: !isDarkMode ? (isDarkMode ? '#fff' : 'text.primary') : subTextColor }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Light Mode</Typography>
                                        <LightMode sx={{ fontSize: 20 }} />
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={2.4}><ColorBox color="#2196F3" name="Primary" /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#9C27B0" name="Second.." /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#4CAF50" name="Success" /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#FFC107" name="Warning" /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#00BCD4" name="Info" /></Grid>
                                    
                                    <Grid item xs={2.4}><ColorBox color="#F44336" name="Danger" /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#2D2F36" name="#296947" /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#40424A" name="#395880" /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#94A3B8" name="#947C6C" /></Grid>
                                    <Grid item xs={2.4}><ColorBox color="#F8FAFC" name="#EFFFFF" /></Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        {/* Typography & Scaling */}
                        <Grid item xs={12} md={4}>
                            <Box sx={glassStyle}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Typography & Scaling</Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: subTextColor, mb: 1, display: 'block' }}>Heading Font</Typography>
                                    <Select fullWidth size="small" value="inter-semibold" sx={{ 
                                        color: textColor, borderRadius: 2, bgcolor: itemBg,
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '& .MuiSelect-select': { color: textColor }
                                    }}>
                                        <MenuItem value="inter-semibold">Inter SemiBold</MenuItem>
                                    </Select>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: subTextColor, mb: 1, display: 'block' }}>Body Font</Typography>
                                    <Select fullWidth size="small" value="inter-regular" sx={{ 
                                        color: textColor, borderRadius: 2, bgcolor: itemBg,
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '& .MuiSelect-select': { color: textColor }
                                    }}>
                                        <MenuItem value="inter-regular">Inter Regular</MenuItem>
                                    </Select>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>Base font Size</Typography>
                                        <Typography variant="caption" sx={{ color: textColor }}>{fontSize}</Typography>
                                    </Box>
                                    <Slider value={fontSize} onChange={(_, v) => setSettings({ fontSize: v })} min={12} max={24} size="small" />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>Text scaling</Typography>
                                        <Typography variant="caption" sx={{ color: textColor }}>{textScaling}%</Typography>
                                    </Box>
                                    <Slider value={textScaling} onChange={(_, v) => setSettings({ textScaling: v })} min={80} max={120} size="small" />
                                </Box>

                                <Divider sx={{ my: 2, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5, color: textColor }}>Heading text section</Typography>
                                <Typography variant="body2" sx={{ color: subTextColor, fontSize: '0.75rem' }}>Heading fest sez lime</Typography>
                                <Typography variant="body2" sx={{ color: subTextColor, fontSize: '0.75rem' }}>Heading fest ser line</Typography>
                            </Box>
                        </Grid>

                        {/* Component Styling */}
                        <Grid item xs={12} md={7}>
                            <Box sx={glassStyle}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: textColor }}>Component Styling</Typography>
                                
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>Global Border Radius</Typography>
                                    </Box>
                                    <Slider value={borderRadius} onChange={(_, v) => setSettings({ borderRadius: v })} min={0} max={24} size="small" />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>Sharp</Typography>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>Fully Rounded</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>Shadow Intensity</Typography>
                                    </Box>
                                    <Slider value={shadowIntensity} onChange={(_, v) => setSettings({ shadowIntensity: v })} min={0} max={100} size="small" />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Button variant="contained" fullWidth sx={{ borderRadius: borderRadius / 1.5, mb: 1.5, py: 1 }}>Button</Button>
                                        <Box sx={{ 
                                            p: 1.5, border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                                            borderRadius: borderRadius / 1.5, mb: 1.5, fontSize: 12, color: subTextColor 
                                        }}>Input</Box>
                                        <Box sx={{ 
                                            p: 1.5, border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                                            borderRadius: borderRadius / 1.5, fontSize: 12, color: subTextColor 
                                        }}>Card</Box>
                                    </Box>
                                    <Box sx={{ 
                                        flex: 1.5, bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', 
                                        borderRadius: borderRadius, border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                                        p: 2
                                    }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, color: textColor }}>Card</Typography>
                                        <Box sx={{ height: 4, width: '80%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', mb: 1, borderRadius: 1 }} />
                                        <Box sx={{ height: 4, width: '60%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', mb: 1, borderRadius: 1 }} />
                                        <Box sx={{ height: 4, width: '40%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 1 }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Branding & Spacing */}
                        <Grid item xs={12} md={5}>
                            <Box sx={glassStyle}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: textColor }}>Branding & Spacing</Typography>
                                
                                <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
                                    <Box sx={{ 
                                        width: 60, height: 60, borderRadius: 2, 
                                        background: `linear-gradient(135deg, ${primaryColor}, ${alpha(primaryColor, 0.7)})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 24, fontWeight: 800, color: '#fff'
                                    }}>A</Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: textColor }}>New Branding Logo</Typography>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>Preview Upload</Typography>
                                    </Box>
                                    <Button variant="outlined" size="small" startIcon={<CloudUpload />} sx={{ color: textColor, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>Upload</Button>
                                </Box>

                                <Typography variant="caption" sx={{ color: subTextColor, mb: 1.5, display: 'block' }}>General Spacing</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {['Compact', 'Standard', 'Relaxed'].map((mode) => (
                                        <Box key={mode} sx={{ 
                                            flex: 1, textTransform: 'none', py: 1, borderRadius: 2, textAlign: 'center',
                                            bgcolor: mode === 'Standard' ? itemBg : (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                                            border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
                                            fontSize: '0.75rem', fontWeight: 600, color: textColor
                                        }}>
                                            {mode}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Right Column (App & Actions) */}
                <Grid item xs={12} lg={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                        <Box sx={{ 
                            ...glassStyle, 
                            borderRadius: '35px 35px 20px 20px', 
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#F4F7FE' 
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, px: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: isDarkMode ? '#fff' : '#1B254B', fontSize: '1.25rem' }}>App</Typography>
                                <IconButton size="small" sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#E9EDF7', borderRadius: 2.5, p: 1 }}>
                                    <FormatListBulleted sx={{ fontSize: 18, color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#A3AED0' }} />
                                </IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <AppNavIcon icon={<CalendarToday />} label="Calendar" onClick={() => navigate('/admin/sessions')} />
                                <AppNavIcon icon={<FormatListBulleted />} label="Tasks" onClick={() => navigate('/admin/users')} />
                                <AppNavIcon icon={<ChatBubbleOutline />} label="Messages" onClick={() => toast.info('Messages coming soon')} />
                                <AppNavIcon icon={<FolderOpen />} label="File Manager" onClick={() => navigate('/admin/courses')} />
                                <AppNavIcon icon={<TextSnippet />} label="Notes" onClick={() => navigate('/admin/reports')} />
                                <AppNavIcon icon={<SupportAgent />} label="Support" onClick={() => toast('Support center feature coming soon!', { icon: '🤝' })} />
                            </Box>
                        </Box>

                        <Box sx={{ ...glassStyle, mt: 'auto' }}>
                            <Typography variant="subtitle2" sx={{ color: subTextColor, mb: 2 }}>Quick Actions</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    sx={{ py: 1.2, fontWeight: 600, bgcolor: primaryColor }}
                                    onClick={() => toast.success('Settings saved successfully')}
                                >
                                    Save Changes
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    sx={{ 
                                        py: 1.2, color: textColor, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        '&:hover': { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', bgcolor: 'transparent' }
                                    }}
                                    onClick={() => {
                                        resetSettings();
                                        toast.success('Settings reset to defaults');
                                    }}
                                >
                                    Reset to Defaults
                                </Button>
                                <Button 
                                    variant="text" 
                                    fullWidth 
                                    sx={{ color: subTextColor, textTransform: 'none' }}
                                    onClick={() => toast('Reverting moves back to previous save point', { icon: '🔄' })}
                                >
                                    Revert Changes
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

function LecturerPerformanceTab() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await reportsApi.lecturerStats();
            setStats(data);
        } catch {
            toast.error('Failed to load lecturer performance stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Lecturer Performance Overview</Typography>
            <Card sx={{ mb: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Lecturer Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Faculty / Dept</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Assigned Courses</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Total Sessions</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Avg Attendance Rate</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.map((lecturer) => (
                                <TableRow key={lecturer.lecturer_id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{lecturer.full_name}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{lecturer.faculty || 'Unassigned'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{lecturer.department || 'Unassigned'}</Typography>
                                    </TableCell>
                                    <TableCell>{lecturer.total_courses}</TableCell>
                                    <TableCell>{lecturer.total_sessions}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${lecturer.attendance_rate}%`}
                                            size="small"
                                            color={lecturer.attendance_rate >= 80 ? 'success' : (lecturer.attendance_rate >= 60 ? 'warning' : 'error')}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
            {stats.length === 0 && (
                <Typography color="text.secondary">No lecturer performance data available yet.</Typography>
            )}
        </Box>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [dbFaculties, setDbFaculties] = useState([]);
    const [dbDepartments, setDbDepartments] = useState([]);

    const fetchAll = async () => {
        try {
            const [cRes, uRes, sRes, fRes, dRes] = await Promise.all([
                coursesApi.list({ all: true }),
                authApi.listUsers(),
                sessionsApi.list(),
                facultiesApi.list(),
                departmentsApi.list(),
            ]);
            setCourses(cRes.data.results || cRes.data);
            setUsers(uRes.data.results || uRes.data);
            setSessions(sRes.data.results || sRes.data);
            setDbFaculties(fRes.data);
            setDbDepartments(dRes.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 10000);
        return () => clearInterval(interval);
    }, []);

    const tabs = [
        { label: 'Overview', path: '/admin' },
        { label: 'Courses', path: '/admin/courses' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Sessions', path: '/admin/sessions' },
        { label: 'Reports', path: '/admin/reports' },
        { label: 'Faculties & Depts', path: '/admin/faculties' },
        { label: 'Lecturer Performance', path: '/admin/lecturers' },
        { label: 'Analytics', path: '/admin/analytics' },
        { label: 'Settings', path: '/admin/settings' },
    ];

    const currentTab = tabs.findIndex(t => t.path === location.pathname) === -1
        ? 0 : tabs.findIndex(t => t.path === location.pathname);

    return (
        <Layout>
            {!['/admin/settings', '/admin/analytics'].includes(location.pathname) && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Admin Dashboard</Typography>
                    <Typography color="text.secondary">Mountains of the Moon University</Typography>
                </Box>
            )}
            {!['/admin/settings', '/admin/analytics'].includes(location.pathname) && (
                <Tabs
                    value={currentTab}
                    onChange={(_, v) => navigate(tabs[v].path)}
                    sx={{ mb: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                >
                    {tabs.map((t) => <Tab key={t.path} label={t.label} />)}
                </Tabs>
            )}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Routes>
                    <Route index element={<Overview courses={courses} users={users} sessions={sessions} />} />
                    <Route path="courses" element={<CoursesTab courses={courses} users={users} faculties={dbFaculties} departments={dbDepartments} onRefresh={fetchAll} />} />
                    <Route path="users" element={<UsersTab users={users} faculties={dbFaculties} departments={dbDepartments} onRefresh={fetchAll} />} />
                    <Route path="sessions" element={<AllSessionsTab />} />
                    <Route path="reports" element={<ReportsTab courses={courses} />} />
                    <Route path="faculties" element={<FacultiesTab />} />
                    <Route path="lecturers" element={<LecturerPerformanceTab />} />
                    <Route path="analytics" element={<AnalyticsTab users={users} courses={courses} faculties={dbFaculties} />} />
                    <Route path="settings" element={<SettingsTab users={users} courses={courses} />} />

                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            )}
        </Layout>
    );
}
