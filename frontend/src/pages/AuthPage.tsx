import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, signup } from '../auth/authApi';
import { clearTokens } from '../auth/authStore';
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ApiError } from '@/api/http';
import { useToast } from "@/components/ui/ToastHost"
import { Field } from '@/components/ui/Field';

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})

  // Phase 2 decision
  const appId = "storyapp";
  // const roles = "WRITER"; // comma-separated for signup

  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    try {
      if (mode === 'signup') {
        await signup({
          email,
          password,
          appId,
          // roles: roles.split(',').map(r => r.trim()).filter(Boolean),
        });
      } else {
        await login({ email, password, appId });
      }
      toast.push({ title: `${mode === 'login' ? 'Login' : 'Signup'} successful`, kind: "success" })
      nav('/write');
    } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message)
          setFieldErrors(err.fieldErrors)
        } else {
          setError(err instanceof Error ? err.message : `${mode === 'login' ? 'Login' : 'Signup'} failed`)
        }
        toast.push({ title: `${mode === 'login' ? 'Login' : 'Signup'} failed`, kind: "error" })
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
        <Field label="Email" error={fieldErrors.email}>
          <Input
            aria-invalid={!!fieldErrors.email}
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Password" error={fieldErrors.password}> 
          <Input
            aria-invalid={!!fieldErrors.password}
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Button variant="secondary" type="submit">
          {mode === 'login' ? 'Login' : 'Create account'}
        </Button>
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
