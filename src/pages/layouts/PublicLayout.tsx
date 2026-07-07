import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Stethoscope, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout() {
  const { clinicSettings } = useApp();
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const clinicName = clinicSettings?.clinic_name || 'Aesthetic Laser & Hair Transplant Clinic';

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
                <Stethoscope size={28} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-xl text-slate-800 tracking-tight">{clinicName}</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Home</Link>
              <button onClick={() => handleNavClick('services')} className="text-slate-600 hover:text-teal-600 font-medium transition-colors cursor-pointer text-left">Services</button>
              <Link to="/about" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">About</Link>
              <Link to="/faq" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">FAQ</Link>
              <Link to="/blog" className="text-slate-600 hover:text-teal-600 font-medium transition-colors text-left">Blog</Link>
              <Link to="/contact" className="text-slate-600 hover:text-teal-600 font-medium transition-colors text-left">Contact</Link>
              
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              
              {!user ? (
                <Link to="/client-auth" className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-medium transition-colors">
                  <User size={18} /> Patient Login
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  {!isAdmin && (
                    <Link to="/my-appointments" className="flex items-center gap-2 text-teal-700 bg-teal-50 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-teal-100">
                      My Appointments
                    </Link>
                  )}
                  <button onClick={logout} className="text-slate-500 hover:text-slate-700 font-medium text-sm">Log out</button>
                </div>
              )}

              <Link to="/book" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm shadow-teal-200">
                Book Appointment
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-4 shadow-lg">
            <Link to="/" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</Link>
            <button onClick={() => handleNavClick('services')} className="block w-full text-left px-3 py-2 text-slate-600 font-medium">Services</button>
            <Link to="/about" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/faq" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
            <Link to="/blog" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
            <Link to="/contact" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            
            <div className="border-t border-slate-100 pt-2 pb-2">
              {!user ? (
                <Link to="/client-auth" className="block px-3 py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Patient Login
                </Link>
              ) : (
                <>
                  {!isAdmin && (
                    <Link to="/my-appointments" className="block px-3 py-2 text-teal-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>My Appointments</Link>
                  )}
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-slate-500 font-medium">Log out</button>
                </>
              )}
            </div>

            <div className="pt-2">
              <Link to="/book" className="block w-full text-center bg-teal-600 text-white px-6 py-3 rounded-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                Book Appointment
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-slate-800 p-2 rounded-xl text-teal-400">
                  <Stethoscope size={24} strokeWidth={1.5} />
                </div>
                <span className="font-medium text-xl text-white tracking-tight">{clinicName}</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                {clinicSettings?.footer_description ?? 'Premium care focused on comfort, precision, and lifelong results in a state-of-the-art environment.'}
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-6">Clinic Directory</h4>
              <ul className="space-y-4 text-slate-400">
                {clinicSettings?.clinic_address && (
                  <li>{clinicSettings.clinic_address}</li>
                )}
                <li>
                  <a href={`tel:${clinicSettings?.clinic_phone || '+923000568380'}`} className="hover:text-teal-400 transition-colors">
                    {clinicSettings?.clinic_phone || '+92 3000568380'}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${clinicSettings?.clinic_email || 'sohail4112049@gmail.com'}`} className="hover:text-teal-400 transition-colors">
                    {clinicSettings?.clinic_email || 'sohail4112049@gmail.com'}
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-6 font-semibold">Resources</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="hover:text-teal-400 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-teal-400 transition-colors">Clinical Blog</Link></li>
                <li><Link to="/faq" className="hover:text-teal-400 transition-colors">FAQs Portal</Link></li>
                <li><Link to="/contact" className="hover:text-teal-400 transition-colors">Contact Practice</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} {clinicName}. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Link to="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-teal-400 transition-colors">Terms &amp; Conditions</Link>
              <Link to="/cookie-policy" className="hover:text-teal-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
