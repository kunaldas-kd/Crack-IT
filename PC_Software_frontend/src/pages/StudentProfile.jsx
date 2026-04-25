import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ── Helpers ─────────────────────────────────────────── */
const STATUS_COLOR = { Active: '#059669', Inactive: '#DC2626', Graduated: '#D97706' };
const GENDER_BG = { Male: 'rgba(27,78,140,0.1)', Female: 'rgba(124,58,237,0.1)', Other: 'rgba(8,145,178,0.1)' };
const GENDER_COL = { Male: 'var(--blue)', Female: 'var(--purple)', Other: 'var(--teal)' };

function Avatar({ name, size = 72 }) {
  const parts = (name || '  ').split(' ');
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  const hue = ((parts[0]?.charCodeAt(0) ?? 65) * 7) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,80%), hsl(${hue},58%,66%))`,
      boxShadow: `0 0 0 3px hsl(${hue},60%,88%), 0 8px 24px hsl(${hue},50%,60%)44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 800, color: `hsl(${hue},50%,26%)`, letterSpacing: '-1px',
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value || <span style={{ color: 'var(--text-3)', fontStyle: 'italic', fontWeight: 400 }}>—</span>}
      </div>
    </div>
  );
}

function TabBtn({ label, icon, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.5rem 1.1rem', border: 'none', cursor: 'pointer',
      borderRadius: 10, fontSize: 13, transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', gap: 6,
      background: active ? 'rgba(27,78,140,0.1)' : 'transparent',
      color: active ? 'var(--blue)' : 'var(--text-3)',
      fontWeight: active ? 700 : 500,
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
      {count != null && (
        <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 700,
          background: active ? 'var(--blue)' : 'var(--border)',
          color: active ? 'white' : 'var(--text-3)',
        }}>{count}</span>
      )}
    </button>
  );
}

function EmptyTab({ icon, msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{msg}</div>
    </div>
  );
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
        {cols.map(c => (
          <th key={c} style={{ padding: '0.65rem 1rem', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

/* ── Sub-tabs ─────────────────────────────────────────── */
function AcademicsPane({ student }) {
  const academics = student.academics || [];
  const results = student.results || [];
  if (!academics.length && !results.length) return <EmptyTab icon="📚" msg="No academic records found." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {academics.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>Subject Performance</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <TableHead cols={['Subject', 'Semester', 'Marks', 'Grade']} />
            <tbody>
              {academics.map(a => (
                <tr key={a.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{a.subject_name || `Subject #${a.subject}`}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: 'var(--blue-dim)', color: 'var(--blue)', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>Sem {a.semester}</span></td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: a.marks >= 75 ? 'var(--green)' : a.marks >= 50 ? 'var(--amber)' : 'var(--red)' }}>{a.marks}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--green)', fontWeight: 700, padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{a.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {results.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>Exam Results</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <TableHead cols={['Exam', 'Total Marks', 'Obtained', 'Percentage', 'Grade']} />
            <tbody>
              {results.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.exam_name || `Exam #${r.exam}`}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{r.total_marks}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{r.obtained_marks}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 99, maxWidth: 80 }}>
                        <div style={{ height: 5, borderRadius: 99, width: `${r.percentage}%`, background: r.percentage >= 75 ? 'var(--green)' : r.percentage >= 50 ? 'var(--amber)' : 'var(--red)' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{r.percentage}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: 'rgba(5,150,105,0.1)', color: 'var(--green)', fontWeight: 700, padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{r.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AttendancePane({ student }) {
  const records = student.attendance_records || [];
  if (!records.length) return <EmptyTab icon="📅" msg="No attendance records found." />;
  const total = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  const pct = total ? Math.round((present / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Days', val: total, col: 'var(--blue)', bg: 'rgba(27,78,140,0.08)' },
          { label: 'Present', val: present, col: 'var(--green)', bg: 'rgba(5,150,105,0.08)' },
          { label: 'Absent', val: records.filter(r => r.status === 'Absent').length, col: 'var(--red)', bg: 'rgba(220,38,38,0.07)' },
          { label: 'Attendance %', val: `${pct}%`, col: pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)', bg: 'rgba(0,0,0,0.04)' },
        ].map(m => (
          <div key={m.label} style={{ background: m.bg, border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: m.col }}>{m.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <TableHead cols={['Date', 'Status']} />
        <tbody>
          {records.slice().reverse().map(r => (
            <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '0.65rem 1rem', color: 'var(--text-2)' }}>{r.date}</td>
              <td style={{ padding: '0.65rem 1rem' }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
                  background: r.status === 'Present' ? 'rgba(5,150,105,0.1)' : r.status === 'Absent' ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.1)',
                  color: r.status === 'Present' ? 'var(--green)' : r.status === 'Absent' ? 'var(--red)' : 'var(--amber)',
                }}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FinancesPane({ student }) {
  const fees = student.fees || null;
  const payments = student.payments || [];
  if (!fees && !payments.length) return <EmptyTab icon="💳" msg="No financial records found." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {fees && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Fee', val: `₹${fees.total_fee}`, col: 'var(--blue)', bg: 'rgba(27,78,140,0.07)' },
            { label: 'Paid', val: `₹${fees.paid_amount}`, col: 'var(--green)', bg: 'rgba(5,150,105,0.07)' },
            { label: 'Due', val: `₹${fees.due_amount}`, col: 'var(--red)', bg: 'rgba(220,38,38,0.07)' },
            { label: 'Status', val: fees.payment_status, col: fees.payment_status === 'Paid' ? 'var(--green)' : fees.payment_status === 'Partial' ? 'var(--amber)' : 'var(--red)', bg: 'rgba(0,0,0,0.03)' },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: m.col }}>{m.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}
      {payments.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>Payment History</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <TableHead cols={['Date', 'Amount', 'Method']} />
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)', fontSize: 12 }}>{p.payment_date}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--green)' }}>₹{p.amount}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('academics');

  useEffect(() => {
    setLoading(true);
    api.get(`/students/students/${id}/`)
      .then(r => setStudent(r.data))
      .catch(() => navigate('/students'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-content animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
        <div className="spinner" style={{ width: 30, height: 30, margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13 }}>Loading student profile…</div>
      </div>
    </div>
  );

  if (!student) return null;
  const fullName = `${student.first_name} ${student.last_name}`;
  const statusColor = STATUS_COLOR[student.status] || 'var(--blue)';
  const TABS = [
    { id: 'academics', icon: '📚', label: 'Academics', count: (student.academics?.length || 0) + (student.results?.length || 0) },
    { id: 'attendance', icon: '📅', label: 'Attendance', count: student.attendance_records?.length },
    { id: 'finances', icon: '💳', label: 'Finances', count: null },
  ];

  return (
    <div className="page-content animate-in">
      <button className="btn btn-ghost" style={{ marginBottom: '1.25rem', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/students')}>
        ← Back to Directory
      </button>

      <div style={{
        background: 'linear-gradient(135deg, rgba(27,78,140,0.06) 0%, rgba(124,58,237,0.04) 100%)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '2rem', marginBottom: '1.75rem',
        boxShadow: '0 4px 24px rgba(27,78,140,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: 80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(27,78,140,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(124,58,237,0.05)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.75rem', flexWrap: 'wrap', zIndex: 1, position: 'relative' }}>
          <Avatar name={fullName} size={80} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>{fullName}</h1>
              <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--blue)', background: 'rgba(27,78,140,0.1)', padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(27,78,140,0.18)' }}>
                {student.student_id}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${statusColor}1A`, color: statusColor, border: `1px solid ${statusColor}33` }}>
                {student.status}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 5 }}>📧 {student.email}</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 5 }}>📱 {student.phone}</span>
              {student.batch_name && <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>🎓 <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{student.batch_name}</span></span>}
              {student.institution_name && <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>🏫 <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{student.institution_name}</span></span>}
            </div>
          </div>
          <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--blue), #3B82F6)', boxShadow: '0 4px 14px rgba(27,78,140,0.25)', fontSize: 13 }} onClick={() => navigate(`/students/${id}/edit`)}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
        gap: '1.5rem', marginBottom: '2rem',
        background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '2rem', boxShadow: 'var(--shadow-md)',
      }}>
        <InfoRow label="Gender" value={student.gender} />
        <InfoRow label="Date of Birth" value={student.date_of_birth} />
        <InfoRow label="Admission Date" value={student.admission_date} />
        <div style={{ gridColumn: '1 / -1' }}><InfoRow label="Residential Address" value={student.address} /></div>
      </div>

      <div style={{
        display: 'flex', gap: 6, background: 'rgba(255,255,255,0.7)', 
        backdropFilter: 'blur(10px)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 6, width: 'fit-content',
        marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
      }}>
        {TABS.map(t => <TabBtn key={t.id} {...t} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>

      <div className="card animate-in" key={tab} style={{ 
        padding: '2rem', boxShadow: '0 10px 40px -10px rgba(15,23,42,0.08)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)'
      }}>
        {tab === 'academics' && <AcademicsPane student={student} />}
        {tab === 'attendance' && <AttendancePane student={student} />}
        {tab === 'finances' && <FinancesPane student={student} />}
      </div>
    </div>
  );
}