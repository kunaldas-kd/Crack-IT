export default function About() {
  const milestones = [
    { phase:'v1–5', label:'B2B Foundation',  desc:'Institute management, teacher roles, student enrollment, attendance, and notes.',     color:'blue'   },
    { phase:'v6',   label:'B2C Pivot',       desc:'Universal exam roadmap, govt exam directory, personal study planners, and streaks.',   color:'purple' },
    { phase:'v7–8', label:'B2C Platform',    desc:'Full mock-test engine, PYQ library, predictive rank tools, and live class viewer.',    color:'teal'   },
    { phase:'v9',   label:'AI Suite',        desc:'LLM-powered feedback, auto MCQ generation, semantic search, and adaptive testing.',    color:'amber'  },
    { phase:'v10',  label:'National OS',     desc:'DigiLocker APIs, national rank tracker, state board integrations, and open API hub.',  color:'coral'  },
  ];

  return (
    <div className="page-content animate-in">
      <div style={{ maxWidth: 720 }}>
        <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>Open Build</div>
        <h1 className="page-title" style={{ marginBottom: 8 }}>About Crack-IT</h1>
        <p style={{ color:'var(--text-2)', lineHeight:1.8, fontSize:15, marginBottom:'2.5rem' }}>
          Crack-IT is an ambitious SaaS product by <strong style={{ color:'var(--text)' }}>Dooars Prajukti</strong> — designed to become the definitive operating system for education in India. We are currently executing <strong style={{ color:'var(--blue)' }}>Phase 1</strong> of a 10-version publicly tracked roadmap.
        </p>

        <h2 style={{ fontSize:16, fontWeight:700, marginBottom:'1rem', color:'var(--text-2)', letterSpacing:'0.5px', textTransform:'uppercase', fontSize:11 }}>Roadmap Phases</h2>

        {milestones.map((m, i) => (
          <div key={i} className="card" style={{ display:'flex', gap:'1rem', padding:'1.25rem', marginBottom:'0.75rem', borderLeft:`3px solid var(--${m.color})` }}>
            <div className={`badge badge-${m.color}`} style={{ flexShrink: 0, alignSelf:'flex-start' }}>{m.phase}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6 }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
