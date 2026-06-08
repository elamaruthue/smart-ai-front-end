import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Button, Alert,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress,
  Divider,
} from '@mui/material';
import * as Switch from '@radix-ui/react-switch';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useAppDispatch } from '../store/hooks';
import { updateUser } from '../store/slices/authSlice';
import { updateProfileApi, changePasswordApi } from '../api/auth';
import { iconBadgeSx } from '../styles/common';

export default function Settings() {
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode, notificationsEnabled, setNotificationsEnabled } = useSettings();
  const navigate = useNavigate();

  // Logout dialog
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Profile edit
  const [editName, setEditName]       = useState(user?.username ?? '');
  const [savingName, setSavingName]   = useState(false);
  const [nameMsg, setNameMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change password dialog
  const [pwOpen, setPwOpen]           = useState(false);
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [savingPw, setSavingPw]       = useState(false);
  const [pwMsg, setPwMsg]             = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSavingName(true);
    setNameMsg(null);
    try {
      const res = await updateProfileApi(editName.trim());
      dispatch(updateUser({ username: res.username }));
      setNameMsg({ type: 'success', text: 'Name updated!' });
    } catch {
      setNameMsg({ type: 'error', text: 'Failed to update name.' });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { setPwMsg({ type: 'error', text: 'All fields are required.' }); return; }
    if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (newPw.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    setSavingPw(true);
    setPwMsg(null);
    try {
      await changePasswordApi(currentPw, newPw);
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to change password.';
      setPwMsg({ type: 'error', text: msg });
    } finally {
      setSavingPw(false);
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <PersonIcon />, label: 'Edit Profile', desc: 'Update your display name',
          action: (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small" value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  sx={{ width: 150 }}
                />
                <Button
                  size="small" variant="outlined"
                  onClick={handleSaveName}
                  disabled={savingName || !editName.trim()}
                  startIcon={savingName ? <CircularProgress size={12} /> : undefined}
                >
                  Save
                </Button>
              </Box>
              {nameMsg && (
                <Typography variant="caption" sx={{ color: nameMsg.type === 'success' ? 'success.main' : 'error.main' }}>
                  {nameMsg.text}
                </Typography>
              )}
            </Box>
          ),
        },
        {
          icon: <LockIcon />, label: 'Change Password', desc: 'Update your password',
          action: <Button size="small" variant="outlined" onClick={() => { setPwMsg(null); setPwOpen(true); }}>Change</Button>,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <NotificationsIcon />, label: 'Notifications', desc: 'Daily learning reminders',
          action: (
            <Switch.Root
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              style={{
                position: 'relative', width: 44, height: 24, borderRadius: 12,
                background: notificationsEnabled ? '#4f46e5' : '#e2e8f0',
                border: 'none', cursor: 'pointer', transition: 'background .2s', padding: 0,
              }}
            >
              <Switch.Thumb
                style={{
                  display: 'block', width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'transform .2s',
                  transform: notificationsEnabled ? 'translateX(23px)' : 'translateX(3px)',
                }}
              />
            </Switch.Root>
          ),
        },
        {
          icon: <DarkModeIcon />, label: 'Dark Mode', desc: 'Switch to dark theme',
          action: (
            <Switch.Root
              checked={darkMode}
              onCheckedChange={setDarkMode}
              style={{
                position: 'relative', width: 44, height: 24, borderRadius: 12,
                background: darkMode ? '#4f46e5' : '#e2e8f0',
                border: 'none', cursor: 'pointer', transition: 'background .2s', padding: 0,
              }}
            >
              <Switch.Thumb
                style={{
                  display: 'block', width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'transform .2s',
                  transform: darkMode ? 'translateX(23px)' : 'translateX(3px)',
                }}
              />
            </Switch.Root>
          ),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpIcon />, label: 'Help & Support', desc: 'Get help with the platform',
          action: <Button size="small" variant="text">Open →</Button>,
        },
        {
          icon: <InfoIcon />, label: 'About Us', desc: 'SMARTPREP AI v1.0.0',
          action: <Button size="small" variant="text">Learn more →</Button>,
        },
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <SettingsOutlinedIcon sx={{ color: 'primary.main', fontSize: 30 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Settings</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account and preferences
      </Typography>

      {settingsSections.map((section) => (
        <Card key={section.title} sx={{ mb: 2.5 }}>
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{section.title}</Typography>
          </Box>
          {section.items.map((item, i) => (
            <Box key={item.label}>
              <Box
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  px: 2.5, py: 1.75,
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background .15s',
                  flexWrap: 'wrap', gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={iconBadgeSx}>{item.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Box>
                {item.action}
              </Box>
              {i < section.items.length - 1 && <Divider />}
            </Box>
          ))}
        </Card>
      ))}

      <Button
        variant="contained" color="error" fullWidth size="large"
        startIcon={<LogoutIcon />}
        onClick={() => setLogoutOpen(true)}
        sx={{ mt: 1 }}
      >
        Logout
      </Button>

      {/* Logout confirmation */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out? Your progress is saved.</Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setLogoutOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleLogout} variant="contained" color="error">Logout</Button>
        </DialogActions>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} fullWidth maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Change Password</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          {pwMsg && <Alert severity={pwMsg.type}>{pwMsg.text}</Alert>}
          <TextField
            label="Current Password" type="password" size="small" fullWidth
            value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
          />
          <TextField
            label="New Password" type="password" size="small" fullWidth
            value={newPw} onChange={(e) => setNewPw(e.target.value)}
            helperText="Minimum 8 characters"
          />
          <TextField
            label="Confirm New Password" type="password" size="small" fullWidth
            value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setPwOpen(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={handleChangePassword} variant="contained"
            disabled={savingPw}
            startIcon={savingPw ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
