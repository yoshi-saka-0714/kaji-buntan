import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, addCompletion, getWeekCompletions, deleteCompletion } from '../lib/api';
import type { Task, Completion } from '../types';

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${days[d.getDay()]} ${h}:${m}`;
}

export default function TasksPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [completing, setCompleting] = useState<string | null>(null);
  const [recentDone, setRecentDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [t, c] = await Promise.all([getTasks(), getWeekCompletions()]);
    setTasks(t);
    setCompletions(c);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleComplete(task: Task) {
    if (!currentUser || completing) return;
    setCompleting(task.id);
    try {
      const c = await addCompletion(currentUser.id, task.id, task.name, task.points);
      setCompletions((prev) => [...prev, c]);
      setRecentDone((prev) => new Set(prev).add(task.id));
      setTimeout(() => {
        setRecentDone((prev) => {
          const next = new Set(prev);
          next.delete(task.id);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteCompletion(id);
      setCompletions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  const myCompletions = completions
    .filter((c) => c.user_id === currentUser?.id)
    .slice()
    .reverse();

  if (loading) {
    return <div className="loading-inline"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <h2>タスク一覧</h2>
      {tasks.length === 0 ? (
        <p className="empty-msg">タスクがありません。「管理」タブから追加してください。</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => {
            const done = recentDone.has(task.id);
            return (
              <div key={task.id} className="task-card">
                <div className="task-info">
                  <div className="task-name">{task.name}</div>
                  <div className="task-pts">{task.points}pt</div>
                </div>
                <button
                  className={`complete-btn${done ? ' done' : ''}`}
                  onClick={() => handleComplete(task)}
                  disabled={completing === task.id}
                >
                  {done ? '✓ 完了！' : '完了'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <h2 style={{ marginTop: 28 }}>今週の履歴（あなた）</h2>
      {myCompletions.length === 0 ? (
        <p className="empty-msg" style={{ padding: '20px 0' }}>まだ完了したタスクはありません。</p>
      ) : (
        <div className="history-list">
          {myCompletions.map((c) => (
            <div key={c.id} className="history-card">
              <div className="history-info">
                <span className="history-name">{c.task_name}</span>
                <span className="history-meta">{formatTime(c.completed_at)} · {c.points}pt</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
              >
                {deleting === c.id ? '…' : '取消'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
