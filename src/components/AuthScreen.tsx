import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Info, Sparkles, UserCheck } from 'lucide-react';
import anatomyImg from '../assets/anatomy.jpg';
import { UserRole } from '../utils/healthcareLogic.js';

interface Props {
  onSuccessAuth: (role: UserRole, userName: string) => void;
  onExplorePreview: () => void;
}

const labels = [
  { name: 'Cranium', top: '6%', left: '56%', side: 'r' },
  { name: 'Clavicle', top: '17%', left: '64%', side: 'r' },
  { name: 'Rib cage', top: '26%', left: '30%', side: 'l' },
  { name: 'Lumbar spine', top: '36%', left: '54%', side: 'r' },
  { name: 'Pelvis', top: '42%', left: '30%', side: 'l' },
  { name: 'Femur', top: '57%', left: '58%', side: 'r' },
  { name: 'Patella', top: '68%', left: '32%', side: 'l' },
  { name: 'Tibia', top: '80%', left: '58%', side: 'r' },
];

export const Logo: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div onClick={onClick} className="flex items-center gap-2.5 shrink-0 cursor-pointer">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gold shadow-gold">
        <span className="h-3.5 w-3.5 rounded-full bg-background" />
      </span>
      <span className="text-xl font-bold tracking-tight text-white">vitalora</span>
    </div>
  );
};

export const AuthScreen: React.FC<Props> = ({ onSuccessAuth, onExplorePreview }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [show, setShow] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT');

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = String(f.get('id') ?? '').trim();
    const pw = String(f.get('password') ?? '');
    const name = String(f.get('name') ?? 'Rameshwar Kumar Singh').trim();

    setNotice('');
    if (!/^\S+@\S+\.\S+$/.test(id) && !/^\+?\d{10,13}$/.test(id)) {
      return setError('Enter a valid email or phone number.');
    }
    if (pw.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (tab === 'signup' && !f.get('consent')) {
      return setError('Please accept the privacy terms to continue.');
    }

    setError('');
    // Successful login transition into Vitalora
    onSuccessAuth(selectedRole, name || 'Rameshwar Kumar Singh');
  }

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-background lg:grid-cols-[1.1fr_1fr]">
      <div className="absolute inset-0 bg-ambient" />

      {/* Left side: Cinematic Anatomical Skeleton with callout pins */}
      <section className="relative hidden items-center justify-center lg:flex">
        <div className="relative h-[88dvh] aspect-[896/1408]">
          <img
            src={anatomyImg}
            alt="Anatomical human skeleton"
            width={896}
            height={1408}
            className="h-full w-full object-contain mix-blend-lighten"
          />
          {labels.map((l, i) => (
            <div
              key={l.name}
              className="animate-rise absolute flex items-center gap-2"
              style={{
                top: l.top,
                left: l.left,
                animationDelay: `${300 + i * 90}ms`,
                flexDirection: l.side === 'l' ? 'row-reverse' : 'row',
              }}
            >
              <span className="h-2 w-2 rounded-full bg-primary shadow-gold" />
              <span className="h-px w-12 bg-primary/60" />
              <span className="glass whitespace-nowrap rounded-full px-3 py-1 text-xs text-slate-200">
                {l.name}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute left-10 top-8">
          <Logo onClick={onExplorePreview} />
        </div>
      </section>

      {/* Right side: Glass Authentication Card */}
      <section className="relative flex items-center justify-center px-6 py-12">
        <div className="glass animate-rise w-full max-w-md rounded-3xl p-8 shadow-2xl">
          <div className="lg:hidden mb-6">
            <Logo onClick={onExplorePreview} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Your health universe, understood.</p>

          <div role="tablist" className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setNotice('');
                }}
                className={`rounded-full py-2 transition-colors ${
                  tab === t ? 'bg-gold text-primary-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {tab === 'signup' && (
              <div>
                <label htmlFor="name" className="text-xs text-muted-foreground">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  maxLength={255}
                  placeholder="Aarav Sharma"
                  defaultValue="Rameshwar Kumar Singh"
                  className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background/40 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary text-white"
                />
              </div>
            )}

            <div>
              <label htmlFor="id" className="text-xs text-muted-foreground">
                Email or phone
              </label>
              <input
                id="id"
                name="id"
                maxLength={255}
                defaultValue="rameshwar.singh@vitalora.health"
                placeholder="you@example.com"
                className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background/40 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs text-muted-foreground">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={show ? 'text' : 'password'}
                  maxLength={128}
                  defaultValue="vitalora2026#"
                  className="h-12 w-full rounded-xl border border-input bg-background/40 px-4 pr-12 text-sm outline-none placeholder:text-muted-foreground focus:border-primary text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role selection pill */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Sign in as:</label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                {(['PATIENT', 'DOCTOR', 'HOSPITAL_STAFF'] as UserRole[]).map(r => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`py-1.5 px-2 rounded-lg border transition-all ${
                      selectedRole === r
                        ? 'bg-gold text-primary-foreground font-bold border-transparent'
                        : 'bg-background/40 text-muted-foreground border-input hover:text-white'
                    }`}
                  >
                    {r === 'HOSPITAL_STAFF' ? 'Staff' : r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'login' ? (
              <div className="text-right">
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            ) : (
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  defaultChecked
                  className="mt-0.5 accent-[var(--primary)]"
                />
                I agree to the privacy policy and consent to processing of my health data.
              </label>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            {notice && (
              <p
                role="status"
                className="flex gap-2 rounded-xl border border-border bg-muted/60 p-3 text-xs text-muted-foreground"
              >
                <Info className="h-4 w-4 shrink-0 text-accent" />
                {notice}
              </p>
            )}

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-gold font-medium text-primary-foreground shadow-gold transition-transform active:scale-[0.98] cursor-pointer"
            >
              {tab === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <button
            type="button"
            onClick={onExplorePreview}
            className="mt-4 block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Explore preview →
          </button>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Encrypted. Your data stays yours.
          </p>
        </div>
      </section>
    </main>
  );
};
