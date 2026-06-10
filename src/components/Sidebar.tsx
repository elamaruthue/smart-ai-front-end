import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Divider, Tooltip, Chip, Drawer } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import QuizIcon from '@mui/icons-material/Quiz';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import QuestionAnswer from '@mui/icons-material/QuestionAnswer';
import EditCalendarIcon        from '@mui/icons-material/EditCalendar';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/path',         icon: <DashboardIcon fontSize="small" />, label: 'Dashboard' },
  { to: '/progress',     icon: <TimelineIcon  fontSize="small" />, label: 'Progress' },
  { to: '/interview',    icon: <QuizIcon      fontSize="small" />, label: 'Interview Prep' },
  { to: '/ai-assistant', icon: <SmartToyIcon  fontSize="small" />, label: 'AI Assistant' },
  { to: '/mock-test',    icon: <AssignmentIcon fontSize="small" />, label: 'Mock Test' },
  { to: '/settings',     icon: <SettingsIcon  fontSize="small" />, label: 'Settings' },
];

const navItemSx = (active: boolean) =>
  ({
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    px: 2.5,
    py: 1.1,
    textDecoration: 'none',
    color: active ? '#fff' : '#c7d2fe',
    bgcolor: active ? 'rgba(79,70,229,0.25)' : 'transparent',
    borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    transition: 'all .18s',
    cursor: 'pointer',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#fff' },
  } as const);

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, selectedPath, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const content = (
    <Box
      sx={{
        width: 260,
        bgcolor: '#1e1b4b',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Brand */}
      <Box sx={{ p: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            🧠
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: 14 }}>
              SMARTPREP AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#c7d2fe', fontSize: 11 }}>
              Learn Smarter. Achieve Bigger.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User */}
      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg,#818cf8,#06b6d4)', fontSize: 15, fontWeight: 700 }}>
          {user?.username?.[0]?.toUpperCase() ?? 'U'}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
            {user?.username ?? 'User'}
          </Typography>
          {selectedPath && (
            <Chip
              label={selectedPath === 'data-analytics' ? 'Data Analytics' : 'Data Science'}
              size="small"
              sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(79,70,229,0.4)', color: '#c7d2fe', mt: 0.25 }}
            />
          )}
          {(user?.role === 'superuser' || user?.role === 'admin') && (
            <Chip
              label={user.role.toUpperCase()}
              size="small"
              sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: user.role === 'superuser' ? 'rgba(239,68,68,0.35)' : 'rgba(234,179,8,0.35)', color: user.role === 'superuser' ? '#fca5a5' : '#fde68a', mt: 0.25, ml: 0.5 }}
            />
          )}
        </Box>
      </Box>

      {/* Main nav */}
      <Box sx={{ flex: 1, py: 1.5, overflowY: 'auto' }}>
        <Typography sx={{ px: 2.5, py: 0.5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(199,210,254,0.45)' }}>
          Menu
        </Typography>

        {navItems.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Tooltip key={to} title="" placement="right">
              <Box component={Link} to={to} onClick={onMobileClose} sx={navItemSx(active)}>
                <Box sx={{ width: 20, display: 'flex', justifyContent: 'center', color: 'inherit' }}>
                  {icon}
                </Box>
                {label}
              </Box>
            </Tooltip>
          );
        })}

        <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />

        <Typography sx={{ px: 2.5, py: 0.5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(199,210,254,0.45)' }}>
          Learning
        </Typography>

        <Box component={Link} to="/learn" onClick={onMobileClose} sx={navItemSx(location.pathname === '/learn')}>
          <Box sx={{ width: 20, display: 'flex', justifyContent: 'center', color: 'inherit' }}>
            <SchoolIcon fontSize="small" />
          </Box>
          Day Learning
        </Box>

        {/* Admin section — only visible for superuser / admin */}
        {(user?.role === 'superuser' || user?.role === 'admin') && (
          <>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
            <Typography sx={{ px: 2.5, py: 0.5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(251,191,36,0.7)' }}>
              Admin
            </Typography>
            {['/course-editor', '/day-quiz-editor','/interview-quiz-editor', '/question-set'].map((path, i) => {
              const active = location.pathname === path;
              const labels = ['Course Editor', 'Day Quiz Editor','Interview Quiz Editor', 'Question Set'];
              const icons  = [<AdminPanelSettingsIcon fontSize="small" />, <EditCalendarIcon fontSize="small" />,<QuestionAnswer />, <QuizOutlinedIcon fontSize="small" />];
              return (
                <Box key={path} component={Link} to={path} onClick={onMobileClose} sx={{
                  ...navItemSx(active),
                  color: active ? '#fbbf24' : '#fde68a',
                  bgcolor: active ? 'rgba(251,191,36,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid #fbbf24' : '3px solid transparent',
                  '&:hover': { bgcolor: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
                }}>
                  <Box sx={{ width: 20, display: 'flex', justifyContent: 'center', color: 'inherit' }}>
                    {icons[i]}
                  </Box>
                  {labels[i]}
                </Box>
              );
            })}
          </>
        )}
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Box
          onClick={handleLogout}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.25,
            px: 1.5, py: 1.1, borderRadius: 2,
            bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all .18s',
            '&:hover': { bgcolor: 'rgba(239,68,68,0.2)', color: '#ff8080' },
          }}
        >
          <LogoutIcon fontSize="small" />
          Logout
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <Box
        component="nav"
        sx={{
          width: 260, flexShrink: 0,
          position: 'fixed', left: 0, top: 0, bottom: 0,
          display: { xs: 'none', md: 'flex' },
          zIndex: 100,
        }}
      >
        {content}
      </Box>

      {/* Mobile: temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box', bgcolor: '#1e1b4b' },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
