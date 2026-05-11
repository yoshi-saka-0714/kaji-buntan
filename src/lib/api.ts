import { supabase } from './supabase';
import type { User, Task, Completion } from '../types';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

export function getWeekDays(): { label: string; date: string }[] {
  const { start } = getWeekBounds();
  const labels = ['月', '火', '水', '木', '金', '土', '日'];
  return labels.map((label, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { label, date: toDateString(d) };
  });
}

export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function createUser(name: string, pin: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, pin })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('points', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createTask(name: string, points: number): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name, points })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, name: string, points: number): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ name, points })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// Completions
export async function getWeekCompletions(): Promise<Completion[]> {
  const { start, end } = getWeekBounds();
  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .gte('completed_at', start.toISOString())
    .lte('completed_at', end.toISOString())
    .order('completed_at');
  if (error) throw error;
  return data || [];
}

export async function addCompletion(
  userId: string,
  taskId: string,
  taskName: string,
  points: number
): Promise<Completion> {
  const { data, error } = await supabase
    .from('completions')
    .insert({ user_id: userId, task_id: taskId, task_name: taskName, points })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserName(id: string, name: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCompletion(id: string): Promise<void> {
  const { error } = await supabase.from('completions').delete().eq('id', id);
  if (error) throw error;
}

// Analytics
export interface DayData {
  label: string;
  date: string;
  [userId: string]: string | number;
}

export function buildDailyData(completions: Completion[], users: User[]): DayData[] {
  const days = getWeekDays();
  const today = toDateString(new Date());

  return days.map(({ label, date }) => {
    const entry: DayData = { label, date };
    users.forEach((u) => {
      if (date > today) {
        entry[u.id] = 0;
        return;
      }
      entry[u.id] = completions
        .filter((c) => {
          if (c.user_id !== u.id) return false;
          return toDateString(new Date(c.completed_at)) === date;
        })
        .reduce((sum, c) => sum + c.points, 0);
    });
    return entry;
  });
}

export function getTotalPoints(completions: Completion[], userId: string): number {
  return completions
    .filter((c) => c.user_id === userId)
    .reduce((sum, c) => sum + c.points, 0);
}
