import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [batches, setBatches] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/students/students/${id}/`),
      api.get('/batches/'),
      api.get('/institutes/institutes/'),
    ]).then(([s, b, inst]) => {
      const d = s.data;
      setForm({
        first_name: d.first_name,
        last_name: d.last_name,
        email: d.email,
        phone: d.phone,
        gender: d.gender,
        date_of_birth: d.date_of_birth,
        address: d.address,
        admission_date: d.admission_date,
        status: d.status,
        batch: d.batch || '',
        institution: d.institution || '',
      });
      setBatches(b.data.results || b.data);
      setInstitutions(inst.data.results || inst.data);
      setLoading(false);
    }).catch(() => navigate('/students'));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api.patch(`/students/students/${id}/`, form);
      navigate(`/students/${id}`);
    } catch (e) {
      const data = e.response?.data;
      setErr(data ? Object.values(data).flat().join(' ') : 'Failed to update student.');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="page-content animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
        <div className="spinner" style={{ width: 30, height: 30, margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13 }}>Loading student data…</div>
      </div>
    </div>
  );

  const FIELDS = [
    { key: 'first_name', label: 'First Name', icon: '👤', placeholder: 'e.g. Rahul' },
    { key: 'last_name', label: 'Last Name', icon: '👤', placeholder: 'e.g. Das' },
    { key: 'email', label: 'Email Address', icon: '📧', placeholder: 'rahul@example.com', type: 'email' },
    { key: 'phone', label: 'Phone Number', icon: '📱', placeholder: '+91 98765 43210' },
    { key: 'date_of_birth', label: 'Date of Birth', icon: '🎂', type: 'date' },
    { key: 'admission_date', label: 'Admission Date', icon: '📋', type: 'date' },
  ];

  if (!form) return null;

  return (
    <div className="page-content animate-in">

      {/* ── Back Button ── */}
      <button className="btn btn-ghost" style={{ marginBottom: '1.25rem', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate(`/students/${id}`)}>
        <span style={{ fontSize: 16 }}>←</span> Back to Profile
      </button>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B4E8C 0%, #3B82F6 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem', marginBottom: '2rem',
        boxShadow: '0 10px 30px -10px rgba(27,78,140,0.4)',
        display: 'flex', alignItems: 'center', gap: 20,
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background element */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%', width: 140, height: 140,
          background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)'
        }} />

        <div style={{
          width: 54, height: 54, borderRadius: 16,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white'
        }}>✏️</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>Edit Student Profile</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>Refine account details and academic links</p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '2rem', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem',
        }}>
          {err && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{err}</div>}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontWeight: 750, fontSize: 14, color: 'var(--blue)',
            marginBottom: '1.5rem', paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--blue-pale)'
          }}>
            <span style={{ opacity: 0.7 }}>👤</span> Personal & System Configuration
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.5rem' }}>
            {FIELDS.map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 14 }}>{f.icon}</span> {f.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    className="form-input"
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">⚧ Gender</label>
              <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">🎓 Batch</label>
              <select className="form-input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}>
                <option value="">— No Batch —</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">🏫 Institution</label>
              <select className="form-input" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })}>
                <option value="">— No Institution —</option>
                {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">📍 Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>Inactive</option><option>Graduated</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">🏠 Residential Address</label>
              <input
                required className="form-input" placeholder="Enter full address details"
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(`/students/${id}`)}>
            ✕ Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{
            minWidth: 160, background: 'linear-gradient(135deg, var(--blue), #3B82F6)',
            boxShadow: '0 4px 14px rgba(27,78,140,0.3)',
          }}>
            {saving ? <><span className="spinner" />Saving…</> : '✓ Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}