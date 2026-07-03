import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import SUSModal from '../common/SUSModal';
import useSUS from '../../hooks/useSUS';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const { susOpen, closeSUS, submitSUS } = useSUS(user);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <SUSModal open={susOpen} onClose={closeSUS} onSubmit={submitSUS} />
    </Box>
  );
}
