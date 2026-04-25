import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function OTPVerify() {
  const { state }      = useLocation();
  const navigate       = useNavigate();
  const email          = state?.email || '';
  const [otp, setOtp]  = useState(['', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (countdown === 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otp.every(d => d !== '')) handleVerify();
  }, [otp]);

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/, '').slice(-1); // only digits
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    setError('');
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...otp];
    text.split('').forEach((c, i) => { if (i < 6) next[i] = c; });
    setOtp(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/accounts/verify-otp/', { email, otp_code: code });
      setSuccess('Email verified! Redirecting to login…');
      setTimeout(() => navigate('/login', { state: { verified: true } }), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/accounts/resend-otp/', { email });
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend OTP.');
    }
    setResending(false);
  };

  return (
    <div className="page-content animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1rem',
            background: 'var(--blue-pale)', border: '2px solid var(--border-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28
          }}>✉️</div>
          <h1 className="page-title" style={{ textAlign: 'center', fontSize: '1.5rem' }}>Check your email</h1>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            We sent a 6-digit code to<br />
            <strong style={{ color: 'var(--blue)' }}>{email || 'your email'}</strong>
          </p>
        </div>

        <div className="card card-p">
          {error   && <div className="alert alert-error"   style={{ marginBottom: '1.25rem' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{success}</div>}

          {/* OTP Digit Inputs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => refs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={idx === 0}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                style={{
                  width: 52, height: 60,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font)',
                  border: `2px solid ${digit ? 'var(--blue)' : '#CBD5E1'}`,
                  borderRadius: 'var(--radius)',
                  background: digit ? 'var(--blue-pale)' : '#FFFFFF',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                  caretColor: 'var(--blue)',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e  => e.target.style.borderColor = digit ? 'var(--blue)' : '#CBD5E1'}
              />
            ))}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: 15 }}
            onClick={handleVerify}
            disabled={loading || otp.some(d => !d)}
          >
            {loading ? <span className="spinner" /> : 'Verify Email'}
          </button>

          <div className="divider" />

          {/* Resend */}
          <div style={{ textAlign: 'center', fontSize: 13 }}>
            <span style={{ color: 'var(--text-3)' }}>Didn't receive the code? </span>
            {countdown > 0 ? (
              <span style={{ color: 'var(--text-3)' }}>Resend in <strong style={{ color: 'var(--blue)' }}>{countdown}s</strong></span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}
              >
                {resending ? 'Sending…' : 'Resend Code'}
              </button>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: '1rem' }}>
            Wrong email? <Link to="/register" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>Go back</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
