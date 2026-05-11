import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getWeekCompletions,
  buildDailyData,
  getTotalPoints,
  isSunday,
} from '../lib/api';
import type { Completion } from '../types';
import PointsChart from '../components/PointsChart';

const USER_COLORS = ['blue', 'pink'];

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
        </>
      )}
    </div>
  );
}
