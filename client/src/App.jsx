import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './lib/auth.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Browse from './pages/Browse.jsx';
import ProviderDetail from './pages/ProviderDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import ProviderProfileEdit from './pages/ProviderProfileEdit.jsx';
import ProviderAvailability from './pages/ProviderAvailability.jsx';
import BecomeAPro from './pages/BecomeAPro.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-24 text-center text-ink-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/providers/:id" element={<ProviderDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/become-a-pro" element={<BecomeAPro />} />
          <Route path="/dashboard" element={<Protected role="CUSTOMER"><CustomerDashboard /></Protected>} />
          <Route path="/pro" element={<Protected role="PROVIDER"><ProviderDashboard /></Protected>} />
          <Route path="/pro/profile" element={<Protected role="PROVIDER"><ProviderProfileEdit /></Protected>} />
          <Route path="/pro/availability" element={<Protected role="PROVIDER"><ProviderAvailability /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
