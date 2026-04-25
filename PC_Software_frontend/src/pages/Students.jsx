import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─── Constants ─────────────────────────────────────── */

const GENDER_COLORS = { Male: 'badge-blue', Female: 'badge-purple', Other: 'badge-teal' };
const STATUS_COLOR = { Active: 'badge-green', Inactive: 'badge-red', Graduated: 'badge-amber' };

const EMPTY_STUDENT = {
  first_name: '', last_name: '', email: '', phone: '',
  gender: 'Male', date_of_birth: '',
  address: '', admission_date: new Date().toISOString().split('T')[0],
  status: 'Active', batch: '', institution: '',
};

/* ─── Micro Components ───────────────────────────────── */
function Loader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '1.5rem 0' }}>
      {[1, 2, 3, 4].map(i => (
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
function DirectoryTab({ students, loading, showForm, setShowForm, onAdded }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_STUDENT);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState('');
  const [batches, setBatches] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    api.get('/batches/')
      .then(r => setBatches(r.data.results || r.data))
      .catch(() => { });
    api.get('/institutes/institutes/')
      .then(r => setInstitutions(r.data.results || r.data))
      .catch(() => { });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      await api.post('/students/students/', form);
      setForm(EMPTY_STUDENT);
      setShowForm(false);
      onAdded();
    } catch (er) {
      const data = er.response?.data;
      setErr(data ? Object.values(data).flat().join(' ') : 'Failed to register student.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete?")) return;
    await api.delete(`/students/students/${id}/`);
    onAdded();
  };

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <span style={{ position: 'absolute', left: 14, top: 11, color: 'var(--text-3)' }}>🔍</span>
          <input type="text" placeholder="Search by name or id..." value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" style={{ paddingLeft: 42, background: 'var(--surface-2)', border: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatChip label="Total" val={students.length} color="var(--blue)" />
          <StatChip label="Active" val={students.filter(s => s.status === 'Active').length} color="var(--green)" />
        </div>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ padding: '2rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: 16 }}>Enroll New Student</h3>
          {err && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{err}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input required className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input required className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
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
              <label className="form-label">Batch</label>
              <select className="form-input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <select className="form-input" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })}>
                <option value="">Select Institution</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Registering...' : 'Complete Enrollment'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState icon="👨‍🎓" title="No students found" sub={search ? 'Try a different search term.' : 'Enroll your first student above.'} />
      ) : (
        <SectionCard>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <TableHead columns={['Student', 'Batch', 'Institution', 'Gender', 'Status', 'Actions']} />
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={`${s.first_name} ${s.last_name}`} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{s.first_name} {s.last_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                            <span style={{ fontFamily: 'monospace', background: 'var(--blue-dim)', color: 'var(--blue)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>{s.student_id}</span>
                            <span style={{ marginLeft: 6 }}>{s.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {s.batch_name
                        ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--purple)', background: 'rgba(124,58,237,0.08)', padding: '3px 9px', borderRadius: 6 }}>{s.batch_name}</span>
                        : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {s.institution_name
                        ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', background: 'rgba(8,145,178,0.08)', padding: '3px 9px', borderRadius: 6 }}>{s.institution_name}</span>
                        : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${GENDER_COLORS[s.gender] || 'badge-blue'}`}>{s.gender}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${STATUS_COLOR[s.status] || 'badge-blue'}`}>{s.status}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: 12 }} onClick={() => navigate(`/students/${s.id}`)}>
                          View
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: 12 }} onClick={() => handleDelete(s.id)}>
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

export default function StudentsHub() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const fetchStudents = useCallback(() => {
    setLoading(true);
    api.get('/students/students/')
      .then(r => setStudents(r.data.results || r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);
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
            background: 'linear-gradient(135deg, var(--blue) 0%, #3B82F6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            boxShadow: '0 8px 24px rgba(27,78,140,0.35)',
          }}>👨‍🎓</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>Students Management</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {loading ? 'Loading…' : `${students.length} students enrolled`}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ zIndex: 1, background: 'linear-gradient(135deg, var(--blue), #3B82F6)', boxShadow: '0 4px 16px rgba(27,78,140,0.3)', fontSize: 13 }} onClick={() => setShowForm(f => !f)}>
          {showForm ? '✕ Cancel' : '+ Enroll Student'}
        </button>
      </div>
      <div className="card card-p animate-in" style={{ boxShadow: '0 2px 20px rgba(15,23,42,0.07)' }}>
        <DirectoryTab students={students} loading={loading} showForm={showForm} setShowForm={setShowForm} onAdded={fetchStudents} />
      </div>
    </div>
  );
}