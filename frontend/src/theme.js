import { createTheme, alpha } from '@mui/material/styles';

const getTheme = (settings) => {
    const {
        isDarkMode = false,
        primaryColor = '#0b52a1',
        secondaryColor = '#6c757d',
        successColor = '#43A047',
        errorColor = '#E53935',
        warningColor = '#F9A825',
        infoColor = '#039BE5',
        borderRadius = 12,
        fontSize = 16,
        fontFamily = '"Inter", "Segoe UI", sans-serif',
    } = settings;

    const mode = isDarkMode ? 'dark' : 'light';

    return createTheme({
        palette: {
            mode,
            primary: {
                main: primaryColor,
                light: alpha(primaryColor, 0.7),
                dark: alpha(primaryColor, 0.9),
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: secondaryColor,
                contrastText: '#FFFFFF',
            },
            background: {
                default: isDarkMode ? '#0f172a' : '#F0F4F8',
                paper: isDarkMode ? '#1e293b' : '#FFFFFF',
            },
            success: { main: successColor },
            error: { main: errorColor },
            warning: { main: warningColor },
            info: { main: infoColor },
            text: {
                primary: isDarkMode ? '#f8fafc' : '#1e293b',
                secondary: isDarkMode ? '#94a3b8' : '#64748b',
            },
        },
        typography: {
            fontFamily,
            fontSize,
            h4: { fontWeight: 700, letterSpacing: '-0.5px', color: primaryColor },
            h5: { fontWeight: 600, color: primaryColor },
            h6: { fontWeight: 600, color: primaryColor },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: { borderRadius },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(10px)',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: borderRadius / 1.5,
                        padding: '10px 24px',
                    },
                    containedPrimary: {
                        background: `linear-gradient(135deg, ${alpha(primaryColor, 0.8)} 0%, ${primaryColor} 100%)`,
                        boxShadow: `0 4px 15px ${alpha(primaryColor, 0.3)}`,
                        '&:hover': {
                            boxShadow: `0 6px 20px ${alpha(primaryColor, 0.45)}`,
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: borderRadius / 1.5,
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: { borderRadius: borderRadius / 2, fontWeight: 600 },
                },
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: alpha(primaryColor, 0.05),
                            borderRadius: borderRadius / 1.5,
                            color: primaryColor,
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: alpha(primaryColor, 0.04),
                        },
                    },
                },
            },
        },
    });
};

export default getTheme;
