import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import AnimatedPage from './AnimatedPage';
import { store } from '@/store';
import { fetchCourseData } from '@/store/slices/courseDataSlice';

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => {setMobileOpen(false); store.dispatch(fetchCourseData())}} />

      <Box
        component="main"
        sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Hamburger – mobile only */}
        <Box sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center', px: 2, py: 1.5,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ color: 'text.primary' }}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ ml: 1, fontWeight: 800, fontSize: 15, color: 'primary.main' }}>SMARTPREP AI</Box>
        </Box>

        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1000 }}>
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              <Outlet />
            </AnimatedPage>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
