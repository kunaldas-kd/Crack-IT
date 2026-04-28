import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [mode, setMode] = useState('password'); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState(1); // 1 = Init, 2 = Verify
  const [form, setForm] = useState({ identifier: '', password: '', otp_code: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { loginUser } = useContext(AuthContext);
  const location = useLocation();
  const justVerified = location.state?.verified === true;

  const resetState = () => {
    setError('');
    setMessage('');
    setLoading(false);
  };

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetState();
    if(!form.identifier || !form.password) {
       setError("Please enter both identifier and password.");
       setLoading(false);
       return;
    }
    try {
      const res = await api.post('/accounts/login/', {
        username: form.identifier, 
        password: form.password,
        remember: remember
      });
      loginUser(res.data.access, res.data.refresh, remember);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials.');
      setLoading(false);
    }
  };

  const handleOtpInit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetState();
    if(!form.identifier) {
       setError("Please enter your Email or User ID.");
       setLoading(false);
       return;
    }
    try {
      const res = await api.post('/accounts/login/otp/request/', { identifier: form.identifier });
      setMessage(res.data.message);
      setOtpStep(2);
      setResendCountdown(60); // start 60s cooldown
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setMessage('');
    try {
      await api.post('/accounts/login/otp/request/', { identifier: form.identifier });
      setMessage('A new OTP has been sent to your email.');
      setResendCountdown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetState();
    if(!form.otp_code) {
       setError("Please enter the OTP sent to your email.");
       setLoading(false);
       return;
    }
    try {
      const res = await api.post('/accounts/login/otp/verify/', {
        identifier: form.identifier,
        otp_code: form.otp_code,
        remember: remember
      });
      loginUser(res.data.access, res.data.refresh, remember);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP code.');
      setLoading(false);
    }
  };

  return (
    <div className="page-content animate-in" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 120px)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div className="logo-mark" style={{ width:56, height:56, margin:'0 auto 1rem', boxShadow:'0 6px 20px rgba(27,78,140,0.3)' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>C</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2ECC8B' }}>i</span>
          </div>
          <h1 className="page-title" style={{ textAlign:'center', fontSize:'1.6rem' }}>Welcome back</h1>
          <p className="page-subtitle" style={{ textAlign:'center' }}>Sign in to your account</p>
        </div>

        <div className="card card-p">
          {justVerified && <div style={{ marginBottom:'1.25rem', padding:'0.75rem 1rem', background:'rgba(46,204,139,0.1)', color:'#059669', border:'1px solid rgba(46,204,139,0.25)', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>✅ Email verified! You can now sign in.</div>}
          {error && <div className="alert alert-error" style={{ marginBottom:'1.25rem' }}>{error}</div>}
          {message && <div className="alert" style={{ marginBottom:'1.25rem', background:'rgba(46,204,139,0.1)', color:'#0B8A5A', border:'1px solid rgba(46,204,139,0.2)' }}>{message}</div>}
          
          <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', background: 'var(--surface-2)', padding: 4, borderRadius: 12 }}>
            <button
               onClick={() => { setMode('password'); resetState(); }}
               style={{ flex: 1, padding: '0.6rem', border: 'none', background: mode === 'password' ? 'white' : 'transparent', borderRadius: 8, fontSize: 13, fontWeight: 600, color: mode === 'password' ? 'var(--text)' : 'var(--text-3)', cursor: 'pointer', boxShadow: mode === 'password' ? '0 2px 8px rgba(15,23,42,0.05)' : 'none', transition: 'all 0.2s' }}>
              Password
            </button>
            <button
               onClick={() => { setMode('otp'); setOtpStep(1); resetState(); }}
               style={{ flex: 1, padding: '0.6rem', border: 'none', background: mode === 'otp' ? 'white' : 'transparent', borderRadius: 8, fontSize: 13, fontWeight: 600, color: mode === 'otp' ? 'var(--text)' : 'var(--text-3)', cursor: 'pointer', boxShadow: mode === 'otp' ? '0 2px 8px rgba(15,23,42,0.05)' : 'none', transition: 'all 0.2s' }}>
              Mail OTP
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Email or User ID</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="admin@school.com or UID-1024"
                  value={form.identifier}
                  onChange={e => setForm(prev => ({ ...prev, identifier: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--text-2)', cursor: 'pointer', marginTop: '-0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: 'var(--blue)', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Remember me
              </label>
              <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'0.8rem', fontSize:15 }} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Log In Securely'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpStep === 1 ? handleOtpInit : handleOtpVerify} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {otpStep === 1 ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Email or User ID</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Enter your registered identifier"
                      value={form.identifier}
                      onChange={e => setForm(prev => ({ ...prev, identifier: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'0.8rem', fontSize:15 }} disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Send Login OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">One-Time Password (OTP)</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="6-digit code"
                      value={form.otp_code}
                      onChange={e => setForm(prev => ({ ...prev, otp_code: e.target.value }))}
                      style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: 18, fontWeight: 700 }}
                      maxLength={6}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--text-2)', cursor: 'pointer', marginTop: '-0.5rem' }}>
                    <input 
                      type="checkbox" 
                      checked={remember} 
                      onChange={(e) => setRemember(e.target.checked)}
                      style={{ accentColor: 'var(--blue)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Remember me
                  </label>
                  <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'0.8rem', fontSize:15 }} disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Verify & Log In'}
                  </button>

                  {/* Resend OTP */}
                  <div style={{ textAlign: 'center', fontSize: 13, marginTop: '0.25rem' }}>
                    <span style={{ color: 'var(--text-3)' }}>Didn't receive it? </span>
                    {resendCountdown > 0 ? (
                      <span style={{ color: 'var(--text-3)' }}>
                        Resend in <strong style={{ color: 'var(--blue)' }}>{resendCountdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--blue)', fontWeight: 600,
                          cursor: 'pointer', padding: 0,
                          fontFamily: 'var(--font)', fontSize: 13,
                        }}
                      >
                        {resending ? 'Sending…' : 'Resend Code'}
                      </button>
                    )}
                  </div>

                  <button type="button" className="btn btn-ghost" style={{ width:'100%', fontSize: 13 }} onClick={() => setOtpStep(1)}>
                    ← Use a different account
                  </button>
                </>
              )}
            </form>
          )}

          <div className="divider" />
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-3)' }}>
            No account? <Link to="/register" style={{ color:'var(--blue)', textDecoration:'none', fontWeight:600 }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
