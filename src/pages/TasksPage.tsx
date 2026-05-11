import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, addCompletion } from '../lib/api';
import type { Task } from '../types';

export default function TasksPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completing, setCompleting] = useState<string | null>(null);
  const [recentDone, setRecentDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks().then((data) => { setTasks(data); setLoading(false); });
  }, []);

  async function handleComplete(task: Task) {
    if (!currentUser || completing) return;
    setCompleting(task.id);
    try {
      await addCompletion(currentUser.id, task.id, task.name, task.points);
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
    </div>
  );
}
