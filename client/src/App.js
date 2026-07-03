import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Landing        = React.lazy(() => import('./pages/Landing'));
const Login          = React.lazy(() => import('./pages/Login'));
const Register       = React.lazy(() => import('./pages/Register'));
const Dashboard      = React.lazy(() => import('./pages/Dashboard'));
const Listings       = React.lazy(() => import('./pages/Listings'));
const ListingDetail  = React.lazy(() => import('./pages/ListingDetail'));
const NewListing     = React.lazy(() => import('./pages/NewListing'));
const MyRequests     = React.lazy(() => import('./pages/MyRequests'));
const Impact         = React.lazy(() => import('./pages/Impact'));
const Profile        = React.lazy(() => import('./pages/Profile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Learn          = React.lazy(() => import('./pages/Learn'));
const Settings       = React.lazy(() => import('./pages/Settings'));
const NotFound       = React.lazy(() => import('./pages/NotFound'));

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress color="primary" />
  </Box>
);

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        {/* Public standalone pages */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App shell with Navbar / Footer / SUS modal */}
        <Route element={<Layout />}>
          <Route path="/listings"     element={<Listings />} />
          <Route path="/listings/new" element={
            <PrivateRoute roles={['vendor']}><NewListing /></PrivateRoute>
          } />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/impact"       element={<Impact />} />
          <Route path="/learn"        element={<Learn />} />
          <Route path="/profile/:id"  element={<Profile />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/requests" element={
            <PrivateRoute><MyRequests /></PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute><Settings /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
          } />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
}
