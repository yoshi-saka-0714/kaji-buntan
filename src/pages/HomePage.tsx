import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getWeekCompletions,
  buildDailyData,
  getTotalPoints,
  isSunday,
} from '../lib/api';
import type { Completion } from '../types';
import type { User } from '../types';
import PointsChart from '../components/PointsChart';

const USER_COLORS = ['blue', 'pink'];
const USER_DOT_COLORS = ['#3b82f6', '#ec4899'];

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const day = days[d.getDay()];
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day}曜 ${h}:${m}`;
}

function ActivityFeed({ completions, users }: { completions: Completion[]; users: User[] }) {
  const sorted = [...completions].reverse();

  if (sorted.length === 0) {
    return <p className="empty-msg" style={{ padding: '16px 0' }}>まだ記録がありません。</p>;
  }

  return (
    <div className="activity-feed">
      {sorted.map((c, i) => {
        const userIdx = users.findIndex((u) => u.id === c.user_id);
        const user = users[userIdx];
        const dotColor = USER_DOT_COLORS[userIdx] ?? '#94a3b8';
        return (
          <div key={c.id} className="activity-item">
            <div className="activity-stripe" style={{ background: dotColor }} />
            <div className="activity-body">
              <div className="activity-main">
                <span className="activity-user" style={{ color: dotColor }}>{user?.name ?? '?'}</span>
                <span className="activity-task">が「{c.task_name}」を完了</span>
              </div>
              <div className="activity-meta">
                <span className="activity-pts">+{c.points}pt</span>
                <span className="activity-time">{formatDateTime(c.completed_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { currentUser, allUsers } = useAuth();
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getWeekCompletions();
    setCompletions(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!currentUser || allUsers.length < 2) return null;

  const partner = allUsers.find((u) => u.id !== currentUser.id)!;
  const myPoints = getTotalPoints(completions, currentUser.id);
  const partnerPoints = getTotalPoints(completions, partner.id);
  const diff = myPoints - partnerPoints;

  const myColorIdx = allUsers.findIndex((u) => u.id === currentUser.id);
  const partnerColorIdx = allUsers.findIndex((u) => u.id === partner.id);

  const showAlert = isSunday() && myPoints < partnerPoints;
  const dailyData = buildDailyData(completions, allUsers);

  return (
    <div className="page">
      {showAlert && (
        <div className="alert-banner">
          ⚠️ 今週は{partner.name}より{partnerPoints - myPoints}pt少ないです！残り今日中に挽回しましょう。
        </div>
      )}

      <h2>今週の集計</h2>

      {loading ? (
        <div className="loading-inline"><div className="spinner" /></div>
      ) : (
        <>
          <div className="points-grid">
            <div className={`points-card ${USER_COLORS[myColorIdx]}`}>
              <div className="points-name">{currentUser.name}（あなた）</div>
              <div className="points-value">{myPoints}</div>
              <div className="points-unit">pt</div>
            </div>
            <div className={`points-card ${USER_COLORS[partnerColorIdx]}`}>
              <div className="points-name">{partner.name}</div>
              <div className="points-value">{partnerPoints}</div>
              <div className="points-unit">pt</div>
            </div>
          </div>

          <div className="diff-badge">
            <div className="diff-character">
              {diff === 0 ? '🤝' : diff > 0 ? (diff >= 10 ? '🏆' : '😊') : (-diff >= 10 ? '🔥' : '😅')}
            </div>
            <div className="diff-text">
              {diff === 0
                ? 'ふたりとも互角！すごい！'
                : diff > 0
                ? `あなたが ${diff}pt 多い`
                : `あなたが ${-diff}pt 少ない…頑張れ！`}
            </div>
          </div>

          <h2>日次推移</h2>
          <PointsChart data={dailyData} users={allUsers} />

          <h2 style={{ marginTop: 24 }}>今週の記録</h2>
          <ActivityFeed completions={completions} users={allUsers} />
        </>
      )}
    </div>
  );
}
