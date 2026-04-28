import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ── Standalone field component (must be OUTSIDE Register to avoid remount) ──
function FormField({ id, label, type = 'text', value, onChange, placeholder, error }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        id={id}
        type={type}
        className={`form-input${error ? ' error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
      />
      {error && (
        <span style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
    </div>
  );
}

// ── Password strength bar ──
function StrengthBar({ password }) {
  if (!password) return null;
  const strength = Math.min(Math.floor(password.length / 3), 4);
  const colors   = ['#DC2626', '#D97706', '#0891B2', '#2ECC8B'];
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 99,
          background: i < strength ? colors[strength - 1] : '#E2E8F0',
          transition: 'background 0.2s'
        }} />
      ))}
    </div>
  );
}

export default function Register() {
  const [step, setStep] = useState(1); // 1 = register, 2 = verify
  
  const [form, setForm] = useState({
    first_name:       '',
    last_name:        '',
    email:            '',
    password:         '',
    confirm_password: '',
  });
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verification states
  const [otp, setOtp]  = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const refs = useRef([]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (countdown === 0 || step !== 2) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, step]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (step === 2 && otp.every(d => d !== '')) handleVerify();
  }, [otp, step]);

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!form.first_name.trim())                       errs.first_name        = 'First name is required.';
    if (!form.last_name.trim())                        errs.last_name         = 'Surname is required.';
    if (!form.email.includes('@'))                     errs.email             = 'Enter a valid email address.';
    if (form.password.length < 8)                      errs.password          = 'Minimum 8 characters.';
    if (form.password !== form.confirm_password)       errs.confirm_password  = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      await api.post('/accounts/register/', {
        first_name:       form.first_name,
        last_name:        form.last_name,
        email:            form.email,
        password:         form.password,
        confirm_password: form.confirm_password,
      });
      setSuccess('Account created! Check your email for the OTP code…');
      setStep(2);
      setCountdown(60);
      setLoading(false);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const handledFields = ['first_name', 'last_name', 'email', 'password', 'confirm_password'];
        const unhandledKeys = Object.keys(data).filter(k => !handledFields.includes(k) && k !== 'non_field');
        
        let additionalError = '';
        if (unhandledKeys.length > 0) {
          additionalError = unhandledKeys.map(k => `${k}: ${data[k]}`).join(' | ');
        }
        
        setErrors({
          ...data,
          non_field: data.non_field || additionalError || undefined
        });
      } else {
        setErrors({ non_field: 'Registration failed. Please try again.' });
      }
      setLoading(false);
    }
  };

  // --- OTP Handlers ---
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    setErrors({});
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
    setErrors({});
    try {
      await api.post('/accounts/verify-otp/', {
        email: form.email,
        otp_code: code,
        password: form.password,  // needed for credentials email on the backend
      });
      setSuccess('Email verified! Redirecting to login…');
      setTimeout(() => navigate('/login', { state: { verified: true } }), 2000);
    } catch (err) {
      setErrors({ non_field: err.response?.data?.error || 'Invalid or expired OTP.' });
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrors({});
    setSuccess('');
    try {
      await api.post('/accounts/resend-otp/', { email: form.email });
      setCountdown(60);
      setSuccess('A new OTP has been sent to your email.');
    } catch (err) {
      setErrors({ non_field: err.response?.data?.error || 'Could not resend OTP.' });
    }
    setResending(false);
  };

  if (step === 2) {
    return (
      <div className="page-content animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
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
              <strong style={{ color: 'var(--blue)' }}>{form.email || 'your email'}</strong>
            </p>
          </div>

          <div className="card card-p">
            {errors.non_field && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{errors.non_field}</div>}
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
                  onChange={e => handleOtpChange(idx, e.target.value)}
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
              Wrong email? <button onClick={() => { setStep(1); setSuccess(''); setErrors({}); }} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}>Go back</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-mark" style={{ width: 56, height: 56, margin: '0 auto 1rem', fontSize: 22, boxShadow: '0 6px 20px rgba(27,78,140,0.3)' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>C</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2ECC8B' }}>i</span>
          </div>
          <h1 className="page-title" style={{ textAlign: 'center', fontSize: '1.5rem' }}>Create your account</h1>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>Join the Crack-IT platform today</p>
        </div>

        <div className="card card-p">
          {success         && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{success}</div>}
          {errors.non_field && <div className="alert alert-error"  style={{ marginBottom: '1.25rem' }}>{errors.non_field}</div>}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <FormField
                id="first_name" label="First Name" placeholder="Rahul"
                value={form.first_name} onChange={handleChange('first_name')} error={errors.first_name}
              />
              <FormField
                id="last_name" label="Surname" placeholder="Das"
                value={form.last_name} onChange={handleChange('last_name')} error={errors.last_name}
              />
            </div>

            <FormField
              id="email" label="Email Address" type="email" placeholder="rahul.das@example.com"
              value={form.email} onChange={handleChange('email')} error={errors.email}
            />

            <FormField
              id="password" label="Password" type="password" placeholder="Min. 8 characters"
              value={form.password} onChange={handleChange('password')} error={errors.password}
            />

            <StrengthBar password={form.password} />

            <FormField
              id="confirm_password" label="Confirm Password" type="password" placeholder="Re-enter password"
              value={form.confirm_password} onChange={handleChange('confirm_password')} error={errors.confirm_password}
            />

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: 15, marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
