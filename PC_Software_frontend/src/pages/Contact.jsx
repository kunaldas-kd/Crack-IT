import { useState } from 'react';
import api from '../api/axios';

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/public/contact/', form);
      setStatus('success');
      setForm({ name:'', email:'', subject:'', message:'' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="page-content animate-in" style={{ maxWidth: 680 }}>
      <div className="badge badge-teal" style={{ marginBottom: '1rem' }}>Get in Touch</div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Contact Us</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Reach out for partnership, pilot access, or support queries.</p>

      {status === 'success' && <div className="alert alert-success" style={{ marginBottom:'1.5rem' }}>✅ Message sent! We will get back to you shortly.</div>}
      {status === 'error'   && <div className="alert alert-error"   style={{ marginBottom:'1.5rem' }}>Failed to send. Please check your connection.</div>}

      <div className="card card-p">
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" type="text" placeholder="Jane Doe" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input className="form-input" type="text" placeholder="e.g. Early Access Request" value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" placeholder="Tell us about your institution and requirements…" rows={5} value={form.message} onChange={e => setForm({...form, message:e.target.value})} style={{ resize:'vertical' }} required />
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button type="submit" className="btn btn-primary" disabled={status==='loading'}>
              {status === 'loading' ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : 'Send Message'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm({ name:'', email:'', subject:'', message:'' })}>Clear</button>
          </div>
        </form>
      </div>

      {/* Contact details */}
      <div style={{ display:'flex', gap:'1rem', marginTop:'1.5rem' }}>
        {[
          { icon:'✉', label:'Email',    value:'support@dooarsprajukti.com' },
          { icon:'⚡', label:'Phase',    value:'B2B Foundation · v1.0.0'    },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding:'1rem 1.25rem', flex:1, display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ fontSize:22 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{c.label}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-2)', marginTop:2 }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
