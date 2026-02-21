import { Box, Card, CardContent, Typography, LinearProgress, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function StatCard({ title, value, subtitle, icon, color = 'primary', trend }) {
    const theme = useTheme();
    const c = theme.palette[color]?.main || color;

    return (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(c, 0.12)} 0%, ${alpha(c, 0.04)} 100%)`,
                border: `1px solid ${alpha(c, 0.2)}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 30px ${alpha(c, 0.25)}`,
                },
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: c, lineHeight: 1 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 1.25, borderRadius: 2,
                            background: alpha(c, 0.15),
                            color: c, display: 'flex',
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
                )}
                {trend !== undefined && (
                    <Box sx={{ mt: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(trend, 100)}
                            sx={{
                                borderRadius: 4, height: 5,
                                bgcolor: alpha(c, 0.15),
                                '& .MuiLinearProgress-bar': { bgcolor: c, borderRadius: 4 },
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {trend}%
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
