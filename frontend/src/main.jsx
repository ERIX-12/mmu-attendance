import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toaster } from 'react-hot-toast';
import App from './App';
import getTheme from './theme';
import useSettingsStore from './context/useSettingsStore';

function Root() {
    const settings = useSettingsStore();
    const theme = useMemo(() => getTheme(settings), [settings]);

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: settings.isDarkMode ? '#1e293b' : '#1A2035',
                            color: '#E8EAF0',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                        },
                        success: { iconTheme: { primary: '#43A047', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#E53935', secondary: '#fff' } },
                    }}
                />
                <App />
            </LocalizationProvider>
        </ThemeProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
);
