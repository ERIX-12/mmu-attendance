import { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, Typography, IconButton,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Divider, Chip, useMediaQuery,
    Tooltip, alpha,
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, School, People, Assignment,
    BarChart, Logout, AccountCircle, QrCode, EventNote,
    CheckCircle, Warning, Assessment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../context/authStore';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = {
    admin: [
        { label: 'Overview', icon: <Dashboard />, path: '/admin' },
        { label: 'Courses', icon: <School />, path: '/admin/courses' },
        { label: 'Users', icon: <People />, path: '/admin/users' },
        { label: 'Sessions', icon: <EventNote />, path: '/admin/sessions' },
        { label: 'Reports', icon: <Assessment />, path: '/admin/reports' },
    ],
    lecturer: [
        { label: 'Overview', icon: <Dashboard />, path: '/lecturer' },
        { label: 'My Courses', icon: <School />, path: '/lecturer/courses' },
        { label: 'Sessions', icon: <EventNote />, path: '/lecturer/sessions' },
        { label: 'Attendance', icon: <CheckCircle />, path: '/lecturer/attendance' },
        { label: 'At-Risk Students', icon: <Warning />, path: '/lecturer/at-risk' },
        { label: 'Reports', icon: <BarChart />, path: '/lecturer/reports' },
    ],
    student: [
        { label: 'My Attendance', icon: <Dashboard />, path: '/student' },
        { label: 'Scan QR Code', icon: <QrCode />, path: '/student/scan' },
        { label: 'History', icon: <Assignment />, path: '/student/history' },
    ],
};

const ROLE_LABELS = { admin: 'Administrator', lecturer: 'Lecturer', student: 'Student' };
const ROLE_COLORS = { admin: 'error', lecturer: 'info', student: 'success' };

export default function Layout({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, refreshToken, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = NAV_ITEMS[user?.role] || [];

    const handleLogout = async () => {
        try {
            await authApi.blacklist(refreshToken);
        } catch (_) { /* fail silently */ }
        logout();
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, px: 1 }}>
                <Box
                    sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1565C0, #003C8F)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 18, color: '#fff',
                    }}
                >M</Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        MMU Attendance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Management System
                    </Typography>
                </Box>
            </Box>

            {/* Nav items */}
            <List sx={{ flex: 1 }}>
                {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); if (isMobile) setDrawerOpen(false); }}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: active ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                                    color: active ? theme.palette.primary.light : 'text.secondary',
                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ my: 1 }} />

            {/* User info */}
            <Box sx={{ px: 1, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.dark, fontSize: 14 }}>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, truncate: true }} noWrap>
                            {user?.full_name || user?.username}
                        </Typography>
                        <Chip
                            label={ROLE_LABELS[user?.role] || user?.role}
                            size="small"
                            color={ROLE_COLORS[user?.role] || 'default'}
                            sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }}
                        />
                    </Box>
                    <Tooltip title="Logout">
                        <IconButton size="small" onClick={handleLogout} color="error">
                            <Logout fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile AppBar */}
            {isMobile && (
                <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Toolbar>
                        <IconButton onClick={() => setDrawerOpen(true)} edge="start" sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>MMU Attendance</Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Sidebar */}
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? drawerOpen : true}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        bgcolor: 'background.paper',
                        border: 'none',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    p: 3,
                    mt: isMobile ? 8 : 0,
                    bgcolor: 'background.default',
                    minHeight: '100vh',
                    overflow: 'auto',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
