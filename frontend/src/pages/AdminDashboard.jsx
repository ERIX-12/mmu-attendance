import { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, CardHeader,
    Tab, Tabs, Table, TableHead, TableRow, TableCell, TableBody,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Chip, IconButton, CircularProgress, alpha,
} from '@mui/material';
import { Add, School, People, EventNote, Assessment, Download, Delete, Edit } from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { coursesApi, authApi, sessionsApi, reportsApi } from '../api/client';
import toast from 'react-hot-toast';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CHART_OPTIONS = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9BA3B5' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9BA3B5' } },
    },
};

function Overview({ courses, users }) {
    const roleCount = (role) => users.filter((u) => u.role === role).length;
    const labels = courses.slice(0, 6).map((c) => c.course_code);
    const data = courses.slice(0, 6).map((c) => c.enrollment_count);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Courses" value={courses.length} icon={<School />} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Students" value={roleCount('student')} icon={<People />} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Lecturers" value={roleCount('lecturer')} icon={<EventNote />} color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Active Courses" value={courses.filter((c) => c.is_active).length} icon={<Assessment />} color="warning" />
            </Grid>
            <Grid item xs={12} md={8}>
                <Card>
                    <CardHeader title="Enrollments by Course" />
                    <CardContent>
                        <Box sx={{ height: 260 }}>
                            <Bar
                                options={CHART_OPTIONS}
                                data={{
                                    labels,
                                    datasets: [{ label: 'Students', data, backgroundColor: 'rgba(21,101,192,0.7)', borderRadius: 6 }],
                                }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title="User Roles" />
                    <CardContent>
                        <Box sx={{ height: 220 }}>
                            <Doughnut
                                data={{
                                    labels: ['Students', 'Lecturers', 'Admins'],
                                    datasets: [{
                                        data: [roleCount('student'), roleCount('lecturer'), roleCount('admin')],
                                        backgroundColor: ['rgba(67,160,71,0.8)', 'rgba(3,155,229,0.8)', 'rgba(229,57,53,0.8)'],
                                        borderWidth: 0,
                                    }],
                                }}
                                options={{ responsive: true, maintainAspectRatio: false }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

function CoursesTab({ courses, users, onRefresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ course_code: '', name: '', credits: 3, lecturer: '', department: '' });
    const [saving, setSaving] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const lecturers = users.filter((u) => u.role === 'lecturer');

    const handleOpenCreate = () => {
        setEditingCourse(null);
        setForm({ course_code: '', name: '', credits: 3, lecturer: '', department: '' });
        setOpen(true);
    };

    const handleOpenEdit = (course) => {
        setEditingCourse(course);
        setForm({
            course_code: course.course_code || course.code,
            name: course.name,
            credits: course.credits,
            lecturer: course.lecturer?.id || course.lecturer || '',
            department: course.department || ''
        });
        setOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                code: form.course_code,
                name: form.name,
                credits: form.credits,
                lecturer_id: form.lecturer,
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
            console.error('Course save error:', e.response?.data);
            toast.error(e.response?.data?.code?.[0] || 'Failed to save course');
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
            <Card>
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
            </Card>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField label="Course Code" value={form.course_code} onChange={(e) => setForm((f) => ({ ...f, course_code: e.target.value }))} fullWidth />
                    <TextField label="Course Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
                    <TextField label="Credits" type="number" value={form.credits} onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))} fullWidth />
                    <TextField label="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Lecturer</InputLabel>
                        <Select value={form.lecturer} label="Lecturer" onChange={(e) => setForm((f) => ({ ...f, lecturer: e.target.value }))}>
                            {lecturers.map((l) => <MenuItem key={l.id} value={l.id}>{l.full_name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
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

function UsersTab({ users, onRefresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        username: '', email: '', first_name: '', last_name: '',
        password: 'Temp@12345', confirm_password: 'Temp@12345',
        role: 'student', student_number: '', staff_id: '', department: ''
    });
    const [saving, setSaving] = useState(false);

    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleOpenCreate = () => {
        setEditingUser(null);
        setForm({
            username: '', email: '', first_name: '', last_name: '',
            password: 'Temp@12345', confirm_password: 'Temp@12345',
            role: 'student', student_number: '', staff_id: '', department: ''
        });
        setOpen(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setForm({
            username: user.username, email: user.email,
            first_name: user.first_name, last_name: user.last_name,
            role: user.role,
            student_number: user.student_number || '',
            staff_id: user.staff_id || '',
            department: user.department || ''
        });
        setOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingUser) {
                await authApi.updateUser(editingUser.id, form);
                toast.success('User updated successfully!');
            } else {
                await authApi.createUser(form);
                toast.success('User created successfully!');
            }
            setOpen(false);
            await onRefresh();
        } catch (e) {
            console.error('User save error:', e.response?.data);
            const errs = e.response?.data;
            const firstErr = errs ? Object.values(errs)[0][0] : 'Failed to save user';
            toast.error(typeof firstErr === 'string' ? firstErr : 'Failed to save user');
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
            <Card>
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
            </Card>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="First Name" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} fullWidth />
                        <TextField label="Last Name" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} fullWidth />
                    </Box>
                    <TextField label="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} fullWidth disabled={!!editingUser} />
                    <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select value={form.role} label="Role" onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                            {['admin', 'lecturer', 'student'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {form.role === 'student' && <TextField label="Student Number" value={form.student_number} onChange={(e) => setForm((f) => ({ ...f, student_number: e.target.value }))} fullWidth />}
                    {form.role === 'lecturer' && <TextField label="Staff ID" value={form.staff_id} onChange={(e) => setForm((f) => ({ ...f, staff_id: e.target.value }))} fullWidth />}
                    <TextField label="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
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

function ReportsTab({ courses }) {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [threshold, setThreshold] = useState(80);
    const [loading, setLoading] = useState(false);
    const [atRisk, setAtRisk] = useState(null);

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
                <Card>
                    <CardHeader
                        title={`At-Risk Students: ${atRisk.course}`}
                        subheader={`${atRisk.below_threshold} of ${atRisk.total_students} below ${atRisk.threshold}% threshold`}
                    />
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Student Number', 'Name', 'Attended', 'Total', 'Percentage'].map((h) => (
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </Box>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const [cRes, uRes] = await Promise.all([
                coursesApi.list({ all: true }),
                authApi.listUsers(),
            ]);
            setCourses(cRes.data.results || cRes.data);
            setUsers(uRes.data.results || uRes.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const tabs = [
        { label: 'Overview', path: '/admin' },
        { label: 'Courses', path: '/admin/courses' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Sessions', path: '/admin/sessions' },
        { label: 'Reports', path: '/admin/reports' },
    ];

    const currentTab = tabs.findIndex(t => t.path === location.pathname) === -1
        ? 0 : tabs.findIndex(t => t.path === location.pathname);

    return (
        <Layout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Admin Dashboard</Typography>
                <Typography color="text.secondary">Mountains of the Moon University</Typography>
            </Box>
            <Tabs
                value={currentTab}
                onChange={(_, v) => navigate(tabs[v].path)}
                sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                {tabs.map((t) => <Tab key={t.path} label={t.label} />)}
            </Tabs>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Routes>
                    <Route index element={<Overview courses={courses} users={users} />} />
                    <Route path="courses" element={<CoursesTab courses={courses} users={users} onRefresh={fetchAll} />} />
                    <Route path="users" element={<UsersTab users={users} onRefresh={fetchAll} />} />
                    <Route path="sessions" element={
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <EventNote sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                            <Typography variant="h6">Session management coming soon</Typography>
                            <Typography variant="body2">Admin can currently view sessions via Lecturer dashboards.</Typography>
                        </Box>
                    } />
                    <Route path="reports" element={<ReportsTab courses={courses} />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            )}
        </Layout>
    );
}
