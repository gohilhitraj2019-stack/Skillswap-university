import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5050${endpoint}`, formData);

      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_0.92fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),transparent_25%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-violet-100 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-violet-300" />
              SkillSwap Community
            </div>
            <h1 className="mt-8 max-w-md text-4xl font-semibold tracking-tight">Learn together. Teach together. Grow together.</h1>
            <p className="mt-4 max-w-sm text-base text-slate-300">
              Exchange knowledge with students across your university and build practical skills through peer learning.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              { label: 'Verified sessions', value: '4.9/5' },
              { label: 'Active peer mentors', value: '320+' },
              { label: 'Credits exchanged', value: '18K' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="text-lg font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background p-6 sm:p-8 lg:p-10">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="px-0 pb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-3xl tracking-tight text-foreground">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {isLogin ? 'Sign in to keep learning and sharing skills.' : 'Join the peer-to-peer learning network.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-0 pb-0">
              {error && (
                <div className={`rounded-xl border p-3 text-sm font-medium ${error.includes('successful') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full name</label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="you@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-sm font-medium text-violet-700 transition-colors hover:text-violet-600"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
