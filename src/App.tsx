import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { DataProvider } from './contexts/DataContext';

import PublicLayout from './pages/layouts/PublicLayout';
import AdminLayout from './pages/layouts/AdminLayout';

import Home from './pages/public/Home';
import BookAppointment from './pages/public/BookAppointment';
import BookingSuccess from './pages/public/BookingSuccess';
import ClientAuth from './pages/public/ClientAuth';
import ClientDashboard from './pages/public/ClientDashboard';
import ResetPassword from './pages/public/ResetPassword';

import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import BlogList from './pages/public/BlogList';
import BlogDetail from './pages/public/BlogDetail';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsAndConditions from './pages/public/TermsAndConditions';
import CookiePolicy from './pages/public/CookiePolicy';

import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import Services from './pages/admin/Services';
import BusinessHours from './pages/admin/BusinessHours';
import BlockedDates from './pages/admin/BlockedDates';
import ClinicSettingsPage from './pages/admin/ClinicSettings';

import BlogsManager from './pages/admin/BlogsManager';
import FAQsManager from './pages/admin/FAQsManager';
import TestimonialsManager from './pages/admin/TestimonialsManager';
import PoliciesManager from './pages/admin/PoliciesManager';

import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
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
              
              {/* AdSense Compliance Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="services" element={<Services />} />
              <Route path="hours" element={<BusinessHours />} />
              <Route path="blocked-dates" element={<BlockedDates />} />
              <Route path="settings" element={<ClinicSettingsPage />} />
              
              {/* CMS Routes */}
              <Route path="blogs" element={<BlogsManager />} />
              <Route path="faqs" element={<FAQsManager />} />
              <Route path="testimonials" element={<TestimonialsManager />} />
              <Route path="policies" element={<PoliciesManager />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </AppProvider>
      </DataProvider>
    </AuthProvider>
  );
}
