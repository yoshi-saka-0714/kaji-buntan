import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DayData } from '../lib/api';
import type { User } from '../types';

const USER_COLORS = ['#3b82f6', '#ec4899'];

interface Props {
  data: DayData[];
  users: User[];
}

export default function PointsChart({ data, users }: Props) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
          {users.map((user, i) => (
            <Bar
              key={user.id}
              dataKey={user.id}
              name={user.name}
              fill={USER_COLORS[i % USER_COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
