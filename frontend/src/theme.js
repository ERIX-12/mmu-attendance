import { createTheme, alpha } from '@mui/material/styles';

const MMU_BLUE = '#1565C0';
const MMU_GOLD = '#F9A825';
const DARK_BG = '#0A0E1A';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: MMU_BLUE,
            light: '#5E92F3',
            dark: '#003C8F',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: MMU_GOLD,
            light: '#FDD835',
            dark: '#F57F17',
            contrastText: '#000000',
        },
        background: {
            default: DARK_BG,
            paper: '#131929',
        },
        success: { main: '#43A047' },
        error: { main: '#E53935' },
        warning: { main: MMU_GOLD },
        info: { main: '#039BE5' },
        text: {
            primary: '#E8EAF0',
            secondary: '#9BA3B5',
        },
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        h4: { fontWeight: 700, letterSpacing: '-0.5px' },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(255,255,255,0.06)',
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
                    background: `linear-gradient(135deg, ${MMU_BLUE} 0%, #003C8F 100%)`,
                    boxShadow: `0 4px 20px ${alpha(MMU_BLUE, 0.4)}`,
                    '&:hover': {
                        boxShadow: `0 6px 28px ${alpha(MMU_BLUE, 0.6)}`,
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
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: alpha(MMU_BLUE, 0.15),
                        borderRadius: 8,
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: alpha(MMU_BLUE, 0.08),
                    },
                },
            },
        },
    },
});

export default theme;
