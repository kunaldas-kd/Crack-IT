import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { FeatureProvider, FeatureContext } from './context/FeatureContext';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import InstitutesHub from './pages/Institutes';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerify from './pages/OTPVerify';
import StudentsHub from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import StudentEdit from './pages/StudentEdit';
import BatchesHub from './pages/Batches';
import TeachersHub from './pages/Teachers';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const NAV = [
  { to: '/', label: 'Home', icon: '🏠', pub: true, hideOnAuth: true },
  { to: '/dashboard', label: 'Dashboard', icon: '📊', pub: false, hideOnAuth: false },
  { to: '/institutes', label: 'Institutes', icon: '🏫', pub: false, hideOnAuth: false, featureFlag: 'Multi_Institution_Support' },
  { to: '/batches', label: 'Batches', icon: '🎓', pub: false, hideOnAuth: false, featureFlag: 'Course_and_Batch_Management' },
  { to: '/students', label: 'Students', icon: '👨‍🎓', pub: false, hideOnAuth: false, featureFlag: 'Student_Management' },
  { to: '/teachers', label: 'Teachers', icon: '👨‍🏫', pub: false, hideOnAuth: false, featureFlag: 'Staff_Management' },
  { to: '/about', label: 'About', icon: '📖', pub: true, hideOnAuth: true },
  { to: '/contact', label: 'Contact', icon: '✉️', pub: true, hideOnAuth: true },
];

function Sidebar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { features } = useContext(FeatureContext);

  const filteredNav = NAV.filter(n => {
    const authVisible = user ? !n.hideOnAuth : n.pub;
    if (!authVisible) return false;
    if (n.featureFlag && features && features[n.featureFlag] === false) return false;
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>C</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#2ECC8B', marginLeft: -1 }}>i</span>
        </div>
        <div>
          <div className="logo-text">Crack-IT</div>
          <div className="logo-sub">B2B Platform</div>
        </div>
      </div>

      <div className="nav-section-label">Navigation</div>
      {filteredNav.map(n => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.to === '/'}
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span>{n.icon}</span>
          {n.label}
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      {user ? (
        <>
          <div className="divider" />
          <div style={{ padding: '0 0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signed In As</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                {user?.uid?.charAt(2) || 'A'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{user?.uid || 'Admin'}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>Administrator</div>
              </div>
            </div>
          </div>
          <button onClick={logoutUser} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
            Sign Out
          </button>
        </>
      ) : (
        <>
          <div className="divider" />
          <NavLink to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, textDecoration: 'none', marginBottom: 8 }}>
            Login Portal
          </NavLink>
          <NavLink to="/register" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, textDecoration: 'none' }}>
            Register
          </NavLink>
        </>
      )}
    </aside>
  );
}

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-otp" element={<GuestRoute><OTPVerify /></GuestRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/institutes" element={<ProtectedRoute><InstitutesHub /></ProtectedRoute>} />
          <Route path="/batches" element={<ProtectedRoute><BatchesHub /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsHub /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
          <Route path="/students/:id/edit" element={<ProtectedRoute><StudentEdit /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><TeachersHub /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeatureProvider>
          <AppShell />
        </FeatureProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}