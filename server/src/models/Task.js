import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  status: { type: String, enum: ['To do', 'Done'], default: 'To do' },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
