import { Box, Card, CardContent, Typography, LinearProgress, alpha, keyframes } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

export default function StatCard({ title, value, subtitle, icon, color = 'primary', trend, animate = true }) {
    const theme = useTheme();
    const c = theme.palette[color]?.main || color;

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                borderRadius: 4,
                boxShadow: `0 8px 32px 0 ${alpha(c, 0.15)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: animate ? `${float} 6s ease-in-out infinite` : 'none',
                '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: `0 12px 48px 0 ${alpha(c, 0.3)}`,
                    border: `1px solid ${alpha(c, 0.5)}`,
                    '& .icon-wrapper': {
                        transform: 'scale(1.15) rotate(5deg)',
                        boxShadow: `0 0 20px ${alpha(c, 0.6)}`,
                    },
                    '& .bg-glow': {
                        opacity: 0.6,
                    }
                },
            }}
        >
            {/* Background Glow */}
            <Box
                className="bg-glow"
                sx={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(c, 0.4)} 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                    opacity: 0.3,
                    transition: 'opacity 0.4s ease',
                    zIndex: 0,
                }}
            />

            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                mb: 1,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: alpha(theme.palette.text.primary, 0.7)
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                lineHeight: 1,
                                background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${c} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'inline-block'
                            }}
                        >
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        className="icon-wrapper"
                        sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${alpha(c, 0.2)} 0%, ${alpha(c, 0.05)} 100%)`,
                            border: `1px solid ${alpha(c, 0.2)}`,
                            color: c,
                            display: 'flex',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {icon}
                    </Box>
                </Box>

                <Box>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {subtitle}
                        </Typography>
                    )}

                    {trend !== undefined && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: alpha(theme.palette.text.primary, 0.8) }}>
                                    Target Met
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: c }}>
                                    {trend}%
                                </Typography>
                            </Box>
                            <Box sx={{ position: 'relative', height: 6, width: '100%', borderRadius: 3, bgcolor: alpha(c, 0.1), overflow: 'hidden' }}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: `${Math.min(trend, 100)}%`,
                                        background: `linear-gradient(90deg, ${c} 0%, ${theme.palette.mode === 'dark' ? theme.palette.common.white : c} 100%)`,
                                        borderRadius: 3,
                                        boxShadow: `0 0 10px ${alpha(c, 0.8)}`,
                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
