import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

import PublicLayout from './pages/layouts/PublicLayout';
import AdminLayout from './pages/layouts/AdminLayout';

import Home from './pages/public/Home';
import BookAppointment from './pages/public/BookAppointment';
import BookingSuccess from './pages/public/BookingSuccess';
import ClientAuth from './pages/public/ClientAuth';
import ClientDashboard from './pages/public/ClientDashboard';
import ResetPassword from './pages/public/ResetPassword';

import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import Services from './pages/admin/Services';
import BusinessHours from './pages/admin/BusinessHours';
import BlockedDates from './pages/admin/BlockedDates';
import ClinicSettingsPage from './pages/admin/ClinicSettings';
import AdminProfile from './pages/admin/Profile';

import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/client-auth" element={<ClientAuth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/my-appointments" element={<ClientDashboard />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="services" element={<Services />} />
            <Route path="hours" element={<BusinessHours />} />
            <Route path="blocked-dates" element={<BlockedDates />} />
            <Route path="settings" element={<ClinicSettingsPage />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </AppProvider>
    </AuthProvider>
  );
}
