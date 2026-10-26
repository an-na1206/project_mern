import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Task from './models/Task.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(value => value.trim()).filter(Boolean);

app.use(cors({ origin(origin, callback) {
  // Allow server-to-server tools with no Origin header, and configured frontend origins.
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('This website is not allowed to access the API.'));
} }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ name: 'Project Board API', status: 'ok', docs: 'Try GET /api/health' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' }));

app.get('/api/tasks', async (_req, res, next) => {
  try { res.json(await Task.find().sort({ createdAt: -1 }).limit(200).lean()); }
  catch (error) { next(error); }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const { title, description = '', status = 'To do' } = req.body || {};
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'Task title is required.' });
    if (title.trim().length > 120) return res.status(400).json({ message: 'Task title must be 120 characters or fewer.' });
    if (typeof description !== 'string' || description.length > 500) return res.status(400).json({ message: 'Description must be 500 characters or fewer.' });
    if (!['To do', 'Done'].includes(status)) return res.status(400).json({ message: 'Status must be To do or Done.' });
    const task = await Task.create({ title: title.trim(), description: description.trim(), status });
    res.status(201).json(task);
  } catch (error) { next(error); }
});

app.patch('/api/tasks/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task ID.' });
    const updates = {};
    if (req.body?.status !== undefined) {
      if (!['To do', 'Done'].includes(req.body.status)) return res.status(400).json({ message: 'Status must be To do or Done.' });
      updates.status = req.body.status;
    }
    if (req.body?.title !== undefined) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim() || req.body.title.trim().length > 120) return res.status(400).json({ message: 'A valid task title is required (maximum 120 characters).' });
      updates.title = req.body.title.trim();
    }
    if (req.body?.description !== undefined) {
      if (typeof req.body.description !== 'string' || req.body.description.length > 500) return res.status(400).json({ message: 'Description must be 500 characters or fewer.' });
      updates.description = req.body.description.trim();
    }
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'Provide at least one field to update.' });
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (error) { next(error); }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task ID.' });
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((_req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error.message);
  if (error.message?.includes('not allowed to access the API')) return res.status(403).json({ message: error.message });
  if (error.name === 'ValidationError') return res.status(400).json({ message: 'Please check the submitted values.' });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try { await mongoose.connect(process.env.MONGODB_URI); console.log('Connected to MongoDB.'); }
    catch (error) { console.error('MongoDB connection failed:', error.message); process.exit(1); }
  } else {
    console.warn('MONGODB_URI is missing. API health works, but task endpoints need MongoDB.');
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Project Board API listening on port ${PORT}`));
}
start();
