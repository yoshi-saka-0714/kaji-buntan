import { useState } from 'react';
import { createUser } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Form {
  name: string;
  pin: string;
  confirmPin: string;
}

const empty: Form = { name: '', pin: '', confirmPin: '' };

function validate(form: Form): string {
  if (!form.name.trim()) return '名前を入力してください';
  if (form.pin.length < 4) return 'PINは4桁以上で設定してください';
  if (form.pin !== form.confirmPin) return 'PINが一致しません';
  return '';
}

export default function SetupPage() {
  const { refreshUsers } = useAuth();
  const [step, setStep] = useState(1);
  const [user1, setUser1] = useState<Form>(empty);
  const [user2, setUser2] = useState<Form>(empty);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const form = step === 1 ? user1 : user2;
  const setForm = step === 1 ? setUser1 : setUser2;

  function handleNext() {
    const err = validate(user1);
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  }

  async function handleComplete() {
    const err = validate(user2);
    if (err) { setError(err); return; }
    setSubmitting(true);
    try {
      await createUser(user1.name.trim(), user1.pin);
      await createUser(user2.name.trim(), user2.pin);
      await refreshUsers();
    } catch {
      setError('エラーが発生しました。Supabaseの設定を確認してください。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>初期設定</h1>
        <p className="login-sub">ステップ {step}/2：{step === 1 ? '1人目' : '2人目'}の情報</p>

        <div className="setup-form">
          <label className="setup-label">名前</label>
          <input
            className="input-field full-width"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={step === 1 ? '例：夫' : '例：妻'}
            autoFocus
          />

          <label className="setup-label">PIN（4桁以上の数字）</label>
          <input
            className="input-field full-width"
            type="password"
            inputMode="numeric"
            value={form.pin}
            onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value }))}
            placeholder="PIN"
          />

          <label className="setup-label">PIN確認</label>
          <input
            className="input-field full-width"
            type="password"
            inputMode="numeric"
            value={form.confirmPin}
            onChange={(e) => setForm((p) => ({ ...p, confirmPin: e.target.value }))}
            placeholder="もう一度入力"
          />

          {error && <p className="error-msg">{error}</p>}

          {step === 1 ? (
            <button className="btn-primary full-width" onClick={handleNext}>
              次へ →
            </button>
          ) : (
            <div className="row-gap">
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setStep(1); setError(''); }}>
                ← 戻る
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2 }}
                onClick={handleComplete}
                disabled={submitting}
              >
                {submitting ? '作成中...' : '設定完了'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
