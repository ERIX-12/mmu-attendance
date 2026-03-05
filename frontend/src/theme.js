import { createTheme, alpha } from '@mui/material/styles';

const MMU_BLUE = '#0b52a1';
const MMU_LIGHT_BLUE = '#2e9bf4';
const MMU_GOLD = '#F9A825';
const LIGHT_BG = '#F0F4F8';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: MMU_BLUE,
            light: MMU_LIGHT_BLUE,
            dark: '#073974',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#6c757d',
            light: '#868e96',
            dark: '#495057',
            contrastText: '#FFFFFF',
        },
        background: {
            default: LIGHT_BG,
            paper: '#FFFFFF',
        },
        success: { main: '#43A047' },
        error: { main: '#E53935' },
        warning: { main: MMU_GOLD },
        info: { main: '#039BE5' },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        h4: { fontWeight: 700, letterSpacing: '-0.5px', color: '#0b52a1' },
        h5: { fontWeight: 600, color: '#0b52a1' },
        h6: { fontWeight: 600, color: '#0b52a1' },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(0,0,0,0.08)',
                    backdropFilter: 'blur(10px)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${MMU_LIGHT_BLUE} 0%, ${MMU_BLUE} 100%)`,
                    boxShadow: `0 4px 15px ${alpha(MMU_BLUE, 0.3)}`,
                    '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(MMU_BLUE, 0.45)}`,
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 6, fontWeight: 600 },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(0,0,0,0.06)',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: alpha(MMU_BLUE, 0.05),
                        borderRadius: 8,
                        color: MMU_BLUE,
                        fontWeight: 'bold',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: alpha(MMU_BLUE, 0.04),
                    },
                },
            },
        },
    },
});

export default theme;
