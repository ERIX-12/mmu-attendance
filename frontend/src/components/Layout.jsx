import { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, Typography, IconButton,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Divider, Chip, useMediaQuery,
    Tooltip, alpha, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField, CircularProgress,
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, School, People, Assignment,
    BarChart, Logout, AccountCircle, QrCode, EventNote,
    CheckCircle, Warning, Assessment, Settings as SettingsIcon, CameraAlt,
    FolderOpen, Timeline,
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
        { label: 'Faculties & Depts', icon: <FolderOpen />, path: '/admin/faculties' },
        { label: 'Performance', icon: <Timeline />, path: '/admin/lecturers' },
        { label: 'Sessions', icon: <EventNote />, path: '/admin/sessions' },
        { label: 'Reports', icon: <Assessment />, path: '/admin/reports' },
        { label: 'Analytics', icon: <BarChart />, path: '/admin/analytics' },
        { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
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

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({ first_name: '', last_name: '', email: '', department: '' });
    const [profileImg, setProfileImg] = useState(null);
    const [profileImgFile, setProfileImgFile] = useState(null);
    const [savingSettings, setSavingSettings] = useState(false);

    const [createAdminOpen, setCreateAdminOpen] = useState(false);
    const [createAdminForm, setCreateAdminForm] = useState({ first_name: '', last_name: '', username: '', email: '', password: '', confirm_password: '' });
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [showAdminPass, setShowAdminPass] = useState(false);

    const openSettings = () => {
        setSettingsForm({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            department: user?.department || '',
        });
        setProfileImg(user?.profile_picture || null);
        setProfileImgFile(null);
        setSettingsOpen(true);
    };

    const handleSettingsSave = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        const formData = new FormData();
        formData.append('first_name', settingsForm.first_name);
        formData.append('last_name', settingsForm.last_name);
        formData.append('email', settingsForm.email);
        formData.append('department', settingsForm.department);
        if (profileImgFile) {
            formData.append('profile_picture', profileImgFile);
        }

        try {
            const { data } = await authApi.updateMe(formData);
            toast.success(data.message || 'Profile updated');
            useAuthStore.getState().login(data.user, useAuthStore.getState().accessToken, refreshToken);
            setSettingsOpen(false);
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleImgChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImgFile(e.target.files[0]);
            setProfileImg(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleCreateAdminSubmit = async (e) => {
        e.preventDefault();
        if (!createAdminForm.first_name || !createAdminForm.last_name || !createAdminForm.username || !createAdminForm.email || !createAdminForm.password) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (createAdminForm.password !== createAdminForm.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        setCreatingAdmin(true);
        try {
            await authApi.register({ ...createAdminForm, role: 'admin' });
            toast.success('Admin account created successfully!');
            setCreateAdminOpen(false);
            setCreateAdminForm({ first_name: '', last_name: '', username: '', email: '', password: '', confirm_password: '' });
        } catch (err) {
            const errs = err.response?.data;
            const firstErr = errs ? Object.values(errs)[0][0] : 'Failed to create admin';
            toast.error(typeof firstErr === 'string' ? firstErr : 'Failed to create admin');
        } finally {
            setCreatingAdmin(false);
        }
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
                        fontWeight: 800, fontSize: 18, color: '#ffffff',
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
                    <Avatar src={user?.profile_picture} sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.dark, fontSize: 14 }}>
                        {!user?.profile_picture && `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
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
                    {user?.role === 'admin' && (
                        <Tooltip title="Settings">
                            <IconButton size="small" onClick={openSettings} color="primary">
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
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
                <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
                        borderRight: '1px solid rgba(0,0,0,0.08)',
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

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth component="form" onSubmit={handleSettingsSave}>
                <DialogTitle>Profile Settings</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="profile-picture-upload"
                            type="file"
                            onChange={handleImgChange}
                        />
                        <label htmlFor="profile-picture-upload">
                            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                                <Avatar src={profileImg} sx={{ width: 100, height: 100, bgcolor: theme.palette.primary.dark, fontSize: 32 }}>
                                    {!profileImg && `${settingsForm.first_name?.[0] || ''}${settingsForm.last_name?.[0] || ''}`}
                                </Avatar>
                                <Box sx={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    bgcolor: 'primary.main', borderRadius: '50%', p: 0.5,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <CameraAlt sx={{ fontSize: 20, color: 'white' }} />
                                </Box>
                            </Box>
                        </label>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="First Name" value={settingsForm.first_name} onChange={(e) => setSettingsForm({ ...settingsForm, first_name: e.target.value })} fullWidth required />
                        <TextField label="Last Name" value={settingsForm.last_name} onChange={(e) => setSettingsForm({ ...settingsForm, last_name: e.target.value })} fullWidth required />
                    </Box>
                    <TextField label="Email" type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} fullWidth required />
                    <TextField label="Department" value={settingsForm.department} onChange={(e) => setSettingsForm({ ...settingsForm, department: e.target.value })} fullWidth />

                    {user?.role === 'admin' && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>System Management</Typography>
                            <Button variant="outlined" color="primary" fullWidth onClick={() => { setSettingsOpen(false); setCreateAdminOpen(true); }}>
                                Create New Admin Account
                            </Button>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)} disabled={savingSettings}>Cancel</Button>
                    <Button variant="contained" type="submit" disabled={savingSettings}>
                        {savingSettings ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Admin Dialog */}
            <Dialog open={createAdminOpen} onClose={() => setCreateAdminOpen(false)} maxWidth="sm" fullWidth component="form" onSubmit={handleCreateAdminSubmit}>
                <DialogTitle>Create New Admin Account</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="First Name" value={createAdminForm.first_name} onChange={(e) => setCreateAdminForm({ ...createAdminForm, first_name: e.target.value })} fullWidth required />
                        <TextField label="Last Name" value={createAdminForm.last_name} onChange={(e) => setCreateAdminForm({ ...createAdminForm, last_name: e.target.value })} fullWidth required />
                    </Box>
                    <TextField label="Username" value={createAdminForm.username} onChange={(e) => setCreateAdminForm({ ...createAdminForm, username: e.target.value })} fullWidth required />
                    <TextField label="Email" type="email" value={createAdminForm.email} onChange={(e) => setCreateAdminForm({ ...createAdminForm, email: e.target.value })} fullWidth required />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Password" type={showAdminPass ? 'text' : 'password'} value={createAdminForm.password} onChange={(e) => setCreateAdminForm({ ...createAdminForm, password: e.target.value })} fullWidth required
                        />
                        <TextField
                            label="Confirm Password" type={showAdminPass ? 'text' : 'password'} value={createAdminForm.confirm_password} onChange={(e) => setCreateAdminForm({ ...createAdminForm, confirm_password: e.target.value })} fullWidth required
                        />
                    </Box>
                    <Box sx={{ textAlign: 'right', mt: -1 }}>
                        <Button size="small" onClick={() => setShowAdminPass(!showAdminPass)} sx={{ textTransform: 'none' }}>
                            {showAdminPass ? 'Hide Passwords' : 'Show Passwords'}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateAdminOpen(false)} disabled={creatingAdmin}>Cancel</Button>
                    <Button variant="contained" type="submit" disabled={creatingAdmin}>
                        {creatingAdmin ? <CircularProgress size={20} color="inherit" /> : 'Create Admin'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
