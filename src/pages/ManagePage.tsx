import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../lib/api';
import type { Task } from '../types';

export default function ManagePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newName, setNewName] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getTasks();
    setTasks(data);
  }

  async function handleAdd() {
    const pts = parseInt(newPoints);
    if (!newName.trim() || !pts || pts < 1 || submitting) return;
    setSubmitting(true);
    try {
      await createTask(newName.trim(), pts);
      setNewName('');
      setNewPoints('');
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(task: Task) {
    setEditId(task.id);
    setEditName(task.name);
    setEditPoints(String(task.points));
  }

  async function handleSave() {
    const pts = parseInt(editPoints);
    if (!editId || !editName.trim() || !pts || pts < 1) return;
    setSubmitting(true);
    try {
      await updateTask(editId, editName.trim(), pts);
      setEditId(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('このタスクを削除しますか？')) return;
    await deleteTask(id);
    await load();
  }

  return (
    <div className="page">
      <h2>タスク管理</h2>

      <div className="add-form">
        <h3>タスクを追加</h3>
        <div className="form-row">
          <input
            className="input-field"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="タスク名"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            className="input-field pts-field"
            type="number"
            min="1"
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            placeholder="pt"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn-primary btn-sm" onClick={handleAdd} disabled={submitting}>
            追加
          </button>
        </div>
      </div>

      <div className="manage-list">
        {tasks.length === 0 && <p className="empty-msg">タスクがまだありません。</p>}
        {tasks.map((task) => (
          <div key={task.id} className="manage-card">
            {editId === task.id ? (
              <div className="edit-row">
                <input
                  className="input-field"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className="input-field pts-field"
                  type="number"
                  min="1"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                />
                <button className="btn-primary btn-sm" onClick={handleSave} disabled={submitting}>保存</button>
                <button className="btn-ghost btn-sm" onClick={() => setEditId(null)}>取消</button>
              </div>
            ) : (
              <div className="task-row">
                <div className="task-info">
                  <span className="task-name">{task.name}</span>
                  <span className="pts-badge">{task.points}pt</span>
                </div>
                <div className="row-gap">
                  <button className="btn-ghost btn-sm" onClick={() => startEdit(task)}>編集</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(task.id)}>削除</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
