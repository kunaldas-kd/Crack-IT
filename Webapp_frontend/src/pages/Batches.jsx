import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const ENDPOINT = '/batches/';
const INSTITUTES_ENDPOINT = '/institutes/';

const EMPTY_FORM = { name: '', max_students: '', duration_weeks: '', status: 'active', institution: '' };

/* ── Tiny helpers ── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const calcEndDate = (startDate, durationWeeks) => {
    if (!startDate || !durationWeeks) return null;
    const d = new Date(startDate);
    d.setDate(d.getDate() + Number(durationWeeks) * 7);
    return d;
};

const fmtDuration = (weeks) => {
    if (!weeks) return null;
    const w = Number(weeks);
    if (w % 4 === 0) return `${w / 4} month${w / 4 !== 1 ? 's' : ''}`;
    if (w >= 4) return `${Math.floor(w / 4)}m ${w % 4}w`;
    return `${w} week${w !== 1 ? 's' : ''}`;
};

function StatusBadge({ status }) {
    return (
        <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-red'}`}>
            {status === 'active' ? '● Active' : '○ Inactive'}
        </span>
    );
}

/* ── Modal ── */
function BatchModal({ batch, onClose, onSaved }) {
    const isEdit = Boolean(batch);
    const [form, setForm] = useState(isEdit ? {
        name: batch.name,
        max_students: batch.max_students,
        duration_weeks: batch.duration_weeks ?? '',
        status: batch.status,
        institution: batch.institution ?? '',
    } : { ...EMPTY_FORM });

    const [institutes, setInstitutes] = useState([]);

    useEffect(() => {
        const fetchInstitutes = async () => {
            try {
                const { data } = await api.get(INSTITUTES_ENDPOINT);
                setInstitutes(Array.isArray(data) ? data : (data.results ?? []));
            } catch (err) {
                console.error("Failed to load institutes", err);
            }
        };
        fetchInstitutes();
    }, []);

    // Computed end date preview shown in the modal
    const previewEndDate = calcEndDate(
        isEdit ? batch.start_date : new Date().toISOString().slice(0, 10),
        form.duration_weeks
    );
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Batch name is required';
        if (!form.max_students || Number(form.max_students) < 1) errs.max_students = 'Must be at least 1';
        return errs;
    };

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErrors(err => ({ ...err, [e.target.name]: '' }));
    };

    // FIX: renamed param from 'e' to 'evt' to avoid shadowing the 'e' used for errors
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            const payload = {
                ...form,
                duration_weeks: form.duration_weeks === '' ? null : Number(form.duration_weeks),
                max_students: Number(form.max_students),
                institution: form.institution === '' ? null : Number(form.institution)
            };
            if (isEdit) {
                await api.patch(`${ENDPOINT}${batch.id}/`, payload);
            } else {
                await api.post(ENDPOINT, payload);
            }
            onSaved();
        } catch (err) {
            const data = err.response?.data || {};
            const mapped = {};
            Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
            setErrors(mapped);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlay}>
            <div style={modalBox}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                            {isEdit ? '✏️ Edit Batch' : '➕ New Batch'}
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                            {isEdit ? `Updating "${batch.name}"` : 'Fill in the details below'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1 }}
                        aria-label="Close"
                    >×</button>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label">Batch Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Batch A – June 2025"
                            className={`form-input${errors.name ? ' error' : ''}`}
                        />
                        {errors.name && <span style={errStyle}>{errors.name}</span>}
                    </div>

                    {/* Max Students */}
                    <div className="form-group">
                        <label className="form-label">Max Students</label>
                        <input
                            name="max_students"
                            type="number"
                            min="1"
                            value={form.max_students}
                            onChange={handleChange}
                            placeholder="e.g. 30"
                            className={`form-input${errors.max_students ? ' error' : ''}`}
                        />
                        {errors.max_students && <span style={errStyle}>{errors.max_students}</span>}
                    </div>

                    {/* Duration */}
                    <div className="form-group">
                        <label className="form-label">
                            Duration (weeks) <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>— optional</span>
                        </label>
                        <input
                            name="duration_weeks"
                            type="number"
                            min="1"
                            max="260"
                            value={form.duration_weeks}
                            onChange={handleChange}
                            placeholder="e.g. 12  (leave blank for open-ended)"
                            className={`form-input${errors.duration_weeks ? ' error' : ''}`}
                        />
                        {errors.duration_weeks && <span style={errStyle}>{errors.duration_weeks}</span>}
                        {/* Live end-date preview */}
                        {previewEndDate && (
                            <div style={{
                                marginTop: 6, padding: '6px 10px', borderRadius: 8,
                                background: 'var(--blue-dim)', fontSize: 12,
                                color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                📅 Ends on <strong>{fmt(previewEndDate)}</strong>
                                <span style={{ color: 'var(--text-3)', marginLeft: 2 }}>({fmtDuration(form.duration_weeks)})</span>
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="form-input"
                                style={{ appearance: 'auto' }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Institution */}
                        <div className="form-group">
                            <label className="form-label">Institute</label>
                            <select
                                name="institution"
                                value={form.institution}
                                onChange={handleChange}
                                className={`form-input${errors.institution ? ' error' : ''}`}
                                style={{ appearance: 'auto' }}
                            >
                                <option value="">Select Institute</option>
                                {institutes.map(inst => (
                                    <option key={inst.id} value={inst.id}>
                                        {inst.name}
                                    </option>
                                ))}
                            </select>
                            {errors.institution && <span style={errStyle}>{errors.institution}</span>}
                        </div>
                    </div>

                    {errors.non_field_errors && (
                        <div className="alert alert-error">{errors.non_field_errors}</div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button className="btn btn-ghost" onClick={onClose} type="button">Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} type="button" disabled={loading}>
                            {loading ? <span className="spinner" /> : (isEdit ? 'Save Changes' : 'Create Batch')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Delete Confirm ── */
function DeleteConfirm({ batch, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const confirm = async () => {
        setLoading(true);
        try {
            await api.delete(`${ENDPOINT}${batch.id}/`);
            onDeleted();
        } catch {
            setLoading(false);
        }
    };

    return (
        <div style={overlay}>
            <div style={{ ...modalBox, maxWidth: 400 }}>
                <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>Delete Batch?</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.6 }}>
                        You're about to permanently delete <strong>"{batch.name}"</strong>. This action cannot be undone.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={confirm} disabled={loading}>
                        {loading ? <span className="spinner dark" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Batch Card ── */
function BatchCard({ batch, onEdit, onDelete }) {
    const enrolled = batch.enrolled ?? 0;
    const pct = batch.max_students > 0 ? Math.min(100, Math.round((enrolled / batch.max_students) * 100)) : 0;

    // end_date comes from the API (serializer exposes the @property)
    const endDate = batch.end_date ? new Date(batch.end_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isExpired = endDate && endDate < today;
    const daysLeft = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--blue-dim)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>🎓</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {isExpired && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: 'var(--coral)',
                            background: 'rgba(255,80,80,0.1)', padding: '2px 7px', borderRadius: 99
                        }}>
                            ENDED
                        </span>
                    )}
                    <StatusBadge status={batch.status} />
                </div>
            </div>

            {/* Name */}
            <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.2px' }}>{batch.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Started {fmt(batch.start_date)}</div>
            </div>

            {/* Duration / End date row */}
            {batch.duration_weeks ? (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 10px', borderRadius: 8,
                    background: isExpired ? 'rgba(255,80,80,0.07)' : 'var(--blue-dim)',
                    fontSize: 11,
                }}>
                    <span style={{ color: 'var(--text-3)' }}>
                        ⏱ {fmtDuration(batch.duration_weeks)}
                    </span>
                    <span style={{ fontWeight: 700, color: isExpired ? 'var(--coral)' : 'var(--blue)' }}>
                        {isExpired
                            ? `Ended ${fmt(endDate)}`
                            : daysLeft === 0
                                ? 'Ends today!'
                                : `Ends ${fmt(endDate)} (${daysLeft}d left)`
                        }
                    </span>
                </div>
            ) : (
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
                    📅 Open-ended batch
                </div>
            )}

            {/* Capacity bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Capacity</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>
                        {enrolled} / {batch.max_students}
                    </span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--blue-dim)', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: 99,
                        background: pct >= 90 ? 'var(--coral)' : pct >= 70 ? 'var(--amber)' : 'var(--blue)',
                        transition: 'width 0.6s ease',
                    }} />
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                    className="btn btn-ghost"
                    style={{ flex: 1, fontSize: 12, padding: '0.5rem' }}
                    onClick={() => onEdit(batch)}
                >✏️ Edit</button>
                <button
                    className="btn btn-danger"
                    style={{ flex: 1, fontSize: 12, padding: '0.5rem' }}
                    onClick={() => onDelete(batch)}
                >🗑️ Delete</button>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function BatchesHub() {
    // authTokens removed — api axios instance handles JWT auth automatically
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [modal, setModal] = useState(null);

    // FIX: removed `authTokens` from dependency array — it's not used inside and caused
    // an infinite re-render loop (authTokens reference changes → fetchBatches recreated
    // → useEffect fires → fetch → re-render → repeat).
    const fetchBatches = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(ENDPOINT);
            // Handle both paginated ({ results: [...] }) and plain array responses
            setBatches(Array.isArray(data) ? data : (data.results ?? []));
        } catch {
            setError('Failed to load batches. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []); // ← empty deps: function never needs to be recreated

    useEffect(() => { fetchBatches(); }, [fetchBatches]);

    const filtered = batches.filter(b => {
        const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || b.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: batches.length,
        active: batches.filter(b => b.status === 'active').length,
        inactive: batches.filter(b => b.status === 'inactive').length,
        totalCapacity: batches.reduce((s, b) => s + b.max_students, 0),
    };

    return (
        <div className="page-content animate-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">Batches</h1>
                    <p className="page-subtitle">Manage student batches and their capacities</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal('create')}>
                    ＋ New Batch
                </button>
            </div>

            {/* Stat strip */}
            <div className="stat-grid" style={{ marginBottom: '1.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {[
                    { label: 'Total Batches', value: stats.total, color: 'blue', icon: '📦' },
                    { label: 'Active', value: stats.active, color: 'teal', icon: '✅' },
                    { label: 'Inactive', value: stats.inactive, color: 'coral', icon: '⏸️' },
                    { label: 'Total Seats', value: stats.totalCapacity, color: 'purple', icon: '💺' },
                ].map(s => (
                    <div key={s.label} className={`card stat-card ${s.color}`}>
                        <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                        <div className={`stat-value ${s.color}`}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    className="form-input"
                    style={{ maxWidth: 280 }}
                    placeholder="🔍  Search batches…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {['all', 'active', 'inactive'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={filterStatus === s ? 'btn btn-primary' : 'btn btn-ghost'}
                        style={{ fontSize: 13, padding: '0.55rem 1rem', textTransform: 'capitalize' }}
                    >
                        {s === 'all' ? 'All' : s === 'active' ? '✅ Active' : '⏸️ Inactive'}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Content */}
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
                            <div className="skeleton" style={{ width: '70%', height: 16 }} />
                            <div className="skeleton" style={{ width: '50%', height: 12 }} />
                            <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 99 }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
                                <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-3)' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-2)' }}>No batches found</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                        {search ? 'Try a different search term' : 'Create your first batch to get started'}
                    </div>
                    {!search && (
                        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setModal('create')}>
                            ➕ Create Batch
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {filtered.map(b => (
                        <BatchCard
                            key={b.id}
                            batch={b}
                            onEdit={batch => setModal({ edit: batch })}
                            onDelete={batch => setModal({ del: batch })}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {modal === 'create' && (
                <BatchModal
                    batch={null}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); fetchBatches(); }}
                />
            )}
            {modal?.edit && (
                <BatchModal
                    batch={modal.edit}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); fetchBatches(); }}
                />
            )}
            {modal?.del && (
                <DeleteConfirm
                    batch={modal.del}
                    onClose={() => setModal(null)}
                    onDeleted={() => { setModal(null); fetchBatches(); }}
                />
            )}
        </div>
    );
}

/* ── Inline styles ── */
const overlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
};

const modalBox = {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
    padding: '1.75rem',
    width: '100%',
    maxWidth: 480,
};

const errStyle = { fontSize: 11, color: 'var(--red)', marginTop: 2 };