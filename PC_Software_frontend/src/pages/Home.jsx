export default function Home() {
  return (
    <div className="page-content animate-in">
      {/* Hero */}
      <div className="card" style={{
        padding: '4rem 3rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative orbs */}
        <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, background:'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, background:'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ position:'relative' }}>
          <div className="badge badge-blue" style={{ marginBottom: '1.5rem' }}>Phase 1 · B2B Foundation</div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #0F172A 30%, #2563EB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            The Operating System<br />for Education
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', maxWidth: 520, lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Crack-IT centralises student management, batch scheduling, attendance, and real-time analytics into one premium platform built for modern institutions.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '0.75rem 1.75rem', textDecoration: 'none' }}>Get Started Free</a>
            <a href="/about" className="btn btn-ghost" style={{ fontSize: 15, padding: '0.75rem 1.75rem', textDecoration: 'none' }}>Learn More →</a>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '🏫', color: 'blue',   title: 'Institute Management',  desc: 'Full CRUD for institutes, branches, and hierarchical administration.' },
          { icon: '👨‍🏫', color: 'purple', title: 'Teacher Profiles',       desc: 'Role-based access, subject specialisation, and performance tracking.' },
          { icon: '🎓', color: 'teal',   title: 'Student Enrollment',    desc: 'Smart batch assignment, CSV import, and individual student profiles.' },
          { icon: '📅', color: 'amber',  title: 'Attendance Tracking',   desc: 'Daily attendance per batch with instant record and reporting.' },
          { icon: '📄', color: 'coral',  title: 'Notes & Resources',     desc: 'Upload PDF study materials and organize by batch and subject.' },
          { icon: '📊', color: 'blue',   title: 'Live Dashboard',        desc: 'Real-time aggregated metrics across all your institute operations.' },
        ].map((f, i) => (
          <div key={i} className={`card stat-card ${f.color} animate-in`} style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`stat-icon ${f.color}`}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
