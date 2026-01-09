import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, signup } from '../auth/authApi';
import { clearTokens } from '../auth/authStore';

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phase 2 decision
  const [appId, setAppId] = useState('storyapp');
  const [roles, setRoles] = useState('WRITER'); // comma-separated for signup

  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'signup') {
        await signup({
          email,
          password,
          appId,
          roles: roles.split(',').map(r => r.trim()).filter(Boolean),
        });
      } else {
        await login({ email, password, appId });
      }
      nav('/write');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Auth failed');
    }
  }

  return (
    <div className="p-5 max-w-md mx-auto grid gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Sign up'}</h1>
        <Link to="/" className="text-blue-600 hover:underline">Library</Link>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          className="border p-2 rounded"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="border p-2 rounded"
          placeholder="appId (e.g. storyapp)"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          required
        />

        {mode === 'signup' && (
          <input
            className="border p-2 rounded"
            placeholder='roles (e.g. WRITER,ADMIN)'
            value={roles}
            onChange={(e) => setRoles(e.target.value)}
          />
        )}

        <button className="border px-3 py-2 rounded">
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>

      <div className="flex gap-3 items-center">
        <button className="text-blue-600 hover:underline" onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}>
          Switch to {mode === 'login' ? 'Sign up' : 'Login'}
        </button>

        <button className="text-gray-600 hover:underline" onClick={() => { clearTokens(); setError('Cleared tokens'); }}>
          Clear tokens
        </button>
      </div>
    </div>
  );
}
