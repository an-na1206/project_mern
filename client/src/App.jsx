import { useCallback, useEffect, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To do');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('');
    try { setTasks(await request('/tasks')); }
    catch (err) { setError(`${err.message}. Check that the backend is running and VITE_API_URL is correct.`); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) { setError('Please enter a task title.'); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      const created = await request('/tasks', { method: 'POST', body: JSON.stringify({ title: title.trim(), description: description.trim(), status }) });
      setTasks(current => [created, ...current]); setTitle(''); setDescription(''); setStatus('To do'); setNotice('Task added successfully.');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function updateStatus(task) {
    const next = task.status === 'Done' ? 'To do' : 'Done';
    try {
      const updated = await request(`/tasks/${task._id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      setTasks(current => current.map(item => item._id === task._id ? updated : item));
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    if (!window.confirm('Delete this task?')) return;
    try { await request(`/tasks/${id}`, { method: 'DELETE' }); setTasks(current => current.filter(task => task._id !== id)); setNotice('Task deleted.'); }
    catch (err) { setError(err.message); }
  }

  const doneCount = tasks.filter(task => task.status === 'Done').length;

  return <main className="page-shell">
    <header className="topbar"><div className="brand-mark">PB</div><div><p className="eyebrow">MERN STACK STARTER</p><strong>Project Board</strong></div><span className="topbar-tag">Internship project</span></header>
    <section className="hero"><div className="hero-copy"><p className="eyebrow light">PLAN · BUILD · REVIEW</p><h1>Make progress<br/><span>one task at a time.</span></h1><p className="hero-subtitle">A simple full-stack task board built with React, Express, Node.js and MongoDB.</p></div><div className="hero-stat"><span className="stat-label">YOUR PROGRESS</span><strong>{doneCount}<small> / {tasks.length}</small></strong><div className="progress-track"><div className="progress-fill" style={{ width: `${tasks.length ? doneCount / tasks.length * 100 : 0}%` }} /></div><span className="stat-caption">tasks completed</span></div></section>
    <section className="content-grid">
      <section className="panel form-panel"><div className="section-heading"><div><p className="eyebrow">GET STARTED</p><h2>Add a task</h2></div><span className="plus-icon">+</span></div>
        <form onSubmit={addTask}>
          <label htmlFor="task-title">Task title <span>*</span></label><input id="task-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build the dashboard" maxLength={120} required />
          <label htmlFor="task-description">Description</label><textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What needs to get done?" rows="3" maxLength={500} />
          <label htmlFor="task-status">Starting status</label><select id="task-status" value={status} onChange={e => setStatus(e.target.value)}><option>To do</option><option>Done</option></select>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add to board'} <span>↗</span></button>
        </form><p className="form-footnote">* Required field. Your tasks are stored in MongoDB when the database is configured.</p>
      </section>
      <section className="panel tasks-panel"><div className="section-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h2>Task list <span className="count-pill">{tasks.length}</span></h2></div><button className="refresh-button" onClick={loadTasks} aria-label="Refresh tasks" title="Refresh tasks">↻</button></div>
        {error && <div className="message error-message" role="alert">{error}</div>}{notice && <div className="message success-message" role="status">{notice}</div>}
        {loading ? <div className="empty-state"><div className="loader"/><p>Loading your tasks…</p></div> : tasks.length === 0 && !error ? <div className="empty-state"><div className="empty-icon">✳</div><h3>Your board is clear</h3><p>Add your first task using the form.</p></div> : <div className="task-list">{tasks.map(task => <article className={`task-card ${task.status === 'Done' ? 'task-done' : ''}`} key={task._id}><button className={`check-button ${task.status === 'Done' ? 'checked' : ''}`} onClick={() => updateStatus(task)} aria-label={task.status === 'Done' ? 'Mark as to do' : 'Mark as done'}>{task.status === 'Done' ? '✓' : ''}</button><div className="task-copy"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<span className={`status ${task.status === 'Done' ? 'status-done' : ''}`}>{task.status}</span></div><button className="delete-button" onClick={() => deleteTask(task._id)} aria-label={`Delete ${task.title}`} title="Delete task">×</button></article>)}</div>}
      </section>
    </section>
    <footer><span>Built for learning full-stack development.</span><span>React <b>·</b> Express <b>·</b> MongoDB</span></footer>
  </main>;
}
