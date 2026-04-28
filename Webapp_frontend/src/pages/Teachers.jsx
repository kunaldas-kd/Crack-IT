import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─── Constants ─────────────────────────────────────── */

const EMPTY_TEACHER = {
  name: '', email: '', phone: '', address: ''
};

/* ─── Micro Components ───────────────────────────────── */
function Loader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '1.5rem 0' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12, animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.25rem',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
      }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{sub}</div>
    </div>
  );
}

function Avatar({ name, size = 38 }) {
  const parts = name.split(' ');
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  const hue = ((parts[0]?.charCodeAt(0) ?? 65) * 7) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,82%), hsl(${hue},60%,70%))`,
      boxShadow: `0 0 0 2px hsl(${hue},60%,88%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 800, color: `hsl(${hue},50%,28%)`,
      letterSpacing: '-0.5px',
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

function StatChip({ label, val, color }) {
  return (
    <div style={{
      padding: '0.45rem 1.1rem', borderRadius: 99,
      background: 'white', border: `1px solid ${color}33`,
      fontSize: 12, fontWeight: 600, color,
      display: 'flex', alignItems: 'center', gap: 6,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <span style={{ fontWeight: 800, fontSize: 14 }}>{val}</span>
      <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function SectionCard({ children, header }) {
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      overflow: 'hidden', background: 'white',
      boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
    }}>
      {header}
      {children}
    </div>
  );
}

function TableHead({ columns }) {
  return (
    <thead>
      <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
        {columns.map(c => (
          <th key={c} style={{
            padding: '0.75rem 1rem', fontSize: 10.5, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.7px',
            color: 'var(--text-3)', whiteSpace: 'nowrap', textAlign: 'left',
          }}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

/* ─── Directory Tab ──────────────────────────────────── */
function DirectoryTab({ teachers, loading, showForm, setShowForm, onAdded }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_TEACHER);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      await api.post('/teachers/teachers/', form);
      setForm(EMPTY_TEACHER);
      setShowForm(false);
      onAdded();
    } catch (er) {
      const data = er.response?.data;
      setErr(data ? Object.values(data).flat().join(' ') : 'Failed to register teacher.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete?")) return;
    await api.delete(`/teachers/teachers/${id}/`);
    onAdded();
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <span style={{ position: 'absolute', left: 14, top: 11, color: 'var(--text-3)' }}>🔍</span>
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" style={{ paddingLeft: 42, background: 'var(--surface-2)', border: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatChip label="Total Staff" val={teachers.length} color="var(--blue)" />
        </div>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ padding: '2rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: 16 }}>Register New Teacher</h3>
          {err && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{err}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input required type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input required className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input required className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Registering...' : 'Complete Registration'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState icon="👨‍🏫" title="No teachers found" sub={search ? 'Try a different search term.' : 'Register your first teacher above.'} />
      ) : (
        <SectionCard>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead columns={['Teacher', 'Phone', 'Address', 'Actions']} />
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={t.name} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                            {t.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{t.phone}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{t.address}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: 12 }} onClick={() => handleDelete(t.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default function TeachersHub() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const fetchTeachers = useCallback(() => {
    setLoading(true);
    api.get('/teachers/teachers/')
      .then(r => setTeachers(r.data.results || r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);
  
  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);
  
  return (
    <div className="page-content animate-in">
      <div style={{
        background: 'linear-gradient(135deg, rgba(27,78,140,0.06) 0%, rgba(124,58,237,0.04) 100%)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem', marginBottom: '1.75rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 20px rgba(27,78,140,0.07)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: 120, width: 150, height: 150, borderRadius: '50%', background: 'rgba(27,78,140,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 15,
            background: 'linear-gradient(135deg, var(--teal) 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            boxShadow: '0 8px 24px rgba(8,145,178,0.35)',
          }}>👨‍🏫</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>Teachers Management</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {loading ? 'Loading…' : `${teachers.length} teachers registered`}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ zIndex: 1, background: 'linear-gradient(135deg, var(--teal), #06b6d4)', boxShadow: '0 4px 16px rgba(8,145,178,0.3)', fontSize: 13 }} onClick={() => setShowForm(f => !f)}>
          {showForm ? '✕ Cancel' : '+ Register Teacher'}
        </button>
      </div>
      <div className="card card-p animate-in" style={{ boxShadow: '0 2px 20px rgba(15,23,42,0.07)' }}>
        <DirectoryTab teachers={teachers} loading={loading} showForm={showForm} setShowForm={setShowForm} onAdded={fetchTeachers} />
      </div>
    </div>
  );
}
