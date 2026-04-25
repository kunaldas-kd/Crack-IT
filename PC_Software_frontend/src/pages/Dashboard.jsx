import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATS = [
  { key: 'total_institutes',          label: 'Institutes',           sub: 'Active org accounts', icon: '🏫', color: 'var(--blue)',   bg: 'rgba(27,78,140,0.08)'  },
  { key: 'total_students',            label: 'Students',             sub: 'Enrolled in platform', icon: '🎓', color: 'var(--purple)', bg: 'rgba(124,58,237,0.08)' },
  { key: 'total_batches',             label: 'Batches',              sub: 'Active class groups', icon: '📚', color: 'var(--amber)',  bg: 'rgba(217,119,6,0.08)'  },
  { key: 'total_teachers',            label: 'Teachers',             sub: 'Registered faculty',  icon: '👩‍🏫', color: 'var(--teal)',   bg: 'rgba(8,145,178,0.08)'  },
  { key: 'total_attendances_recorded',label: 'Attendance Records',   sub: 'Total entries logged',icon: '✅', color: 'var(--green)',  bg: 'rgba(5,150,105,0.08)'  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    setError(false);
    api.get('/dashboards/summary/')
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="page-content animate-in">

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(27,78,140,0.06) 0%, rgba(124,58,237,0.04) 100%)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem', marginBottom: '1.75rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
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
          }}>📊</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>Platform Overview</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              Real-time aggregated metrics across your B2B network.
            </p>
          </div>
        </div>

        <button className="btn btn-ghost" onClick={fetchStats} style={{ zIndex: 1, gap: 8, background: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: 16 }}>↺</span> Refresh Data
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(220,38,38,0.1)' }}>
          <strong>Connection error:</strong> Cannot reach the API. Ensure your backend server is running on port 8000.
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.25rem', marginBottom: '2rem'
      }}>
        {STATS.map((s, i) => (
          <div key={i} className="animate-in" style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
            position: 'relative', overflow: 'hidden',
            animationDelay: `${i * 60}ms`
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
              background: s.color, opacity: 0.8
            }} />
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: '1.25rem', color: s.color
            }}>{s.icon}</div>

            {loading ? (
              <>
                <div className="skeleton" style={{ height: 38, width: 80, marginBottom: 8, borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 14, width: 120, borderRadius: 4 }} />
              </>
            ) : (
              <>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-1px', marginBottom: 6 }}>
                  {stats?.[s.key]?.toLocaleString() ?? 0}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{s.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Status Panel ── */}
      <div style={{
        background: 'white', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--blue-pale)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 20 }}>
              ⚡
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>System Health</h2>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Real-time service monitoring</p>
            </div>
          </div>
          <span className={`badge ${error ? 'badge-red' : 'badge-green'}`} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 10 }}>
            {error ? 'Service Disruption' : '✓ All Systems Online'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Institutes API',   path: '/institutes/',    ok: !error },
            { name: 'Accounts API',     path: '/accounts/',      ok: !error },
            { name: 'Batches API',      path: '/batches/',       ok: !error },
            { name: 'Students API',     path: '/students/',      ok: !error },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem', background: 'var(--surface-2)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', opacity: 0.7 }}>{s.path}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.ok ? 'var(--green)' : 'var(--red)', boxShadow: `0 0 10px ${s.ok ? 'var(--green)' : 'var(--red)'}88` }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
