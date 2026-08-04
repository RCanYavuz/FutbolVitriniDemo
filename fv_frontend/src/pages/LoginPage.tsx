import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, MOCK_CREDENTIALS } from '../store/authStore';
import { getDefaultPath } from '../lib/navigation';
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  User,
  Lock,
  AlertCircle,
  Info,
  Search,
  ClipboardList,
  Target,
  Copy,
  Check,
} from 'lucide-react';

/* ─── Animated Background Orbs ─────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary green orb */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-pitch-green/[0.04] blur-[120px] animate-pulse" />
      {/* Secondary blue orb */}
      <div
        className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-tactical-blue/[0.06] blur-[100px]"
        style={{ animation: 'pulse 4s ease-in-out infinite' }}
      />
      {/* Accent line */}
      <div className="absolute top-1/3 left-1/2 h-px w-80 -translate-x-1/2 bg-gradient-to-r from-transparent via-tactical-blue/20 to-transparent rotate-12" />
      <div className="absolute bottom-1/4 left-1/3 h-px w-64 bg-gradient-to-r from-transparent via-pitch-green/15 to-transparent -rotate-6" />
    </div>
  );
}

/* ─── Test Credentials Hint ────────────────────────────────────── */
function TestHint() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (username: string, password: string, index: number) => {
    navigator.clipboard.writeText(`${username} / ${password}`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 w-72">
      <div className="glass-panel rounded-xl p-4 shadow-2xl border-border-standard/50">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-tactical-blue" />
          <h4 className="text-xs font-bold text-on-surface tracking-wide uppercase">
            Test Bilgileri
          </h4>
        </div>
        <div className="space-y-2">
          {MOCK_CREDENTIALS.map((cred, i) => (
            <div
              key={cred.username}
              className="flex items-center justify-between bg-surface-container-high/60 rounded-lg px-3 py-2 group"
            >
              <div>
                <span className="text-xs font-medium text-on-surface">{cred.username}</span>
                <span className="text-xs text-text-muted mx-1.5">/</span>
                <span className="text-xs font-mono text-text-muted">{cred.password}</span>
              </div>
              <button
                onClick={() => handleCopy(cred.username, cred.password, i)}
                className="p-1 rounded hover:bg-surface-bright transition-colors"
                title="Kopyala"
              >
                {copiedIndex === i ? (
                  <Check className="w-3 h-3 text-pitch-green" />
                ) : (
                  <Copy className="w-3 h-3 text-text-muted group-hover:text-on-surface transition-colors" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginError, clearError, isAuthenticated, user } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect away
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    const success = await login(username, password);
    setLoading(false);

    if (success) {
      // Rol bilgisi girisi yapan gercek kullanicidan (mock ya da backend) gelir.
      const role = useAuthStore.getState().user?.role;
      if (role) {
        navigate(getDefaultPath(role), { replace: true });
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen w-full bg-pitch-black flex items-center justify-center p-4">
      <FloatingOrbs />

      {/* ── Main Card ── */}
      <div className="relative z-10 w-full max-w-[920px] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-border-standard/60 shadow-2xl shadow-black/40">

        {/* ━━━ LEFT: Brand Panel ━━━ */}
        <div className="relative bg-surface-primary p-8 lg:p-10 flex flex-col justify-between min-h-[520px]">
          {/* Subtle top-right gradient accent */}
          <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-pitch-green/[0.08] to-transparent rounded-bl-full" />

          <div>
            <Link to="/vitrin" className="inline-block hover:opacity-80 transition-opacity">
              <h1 className="text-headline-lg text-pitch-green tracking-tight mb-1.5 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                Futbol Vitrini
              </h1>
            </Link>
            <p className="text-sm text-text-muted font-medium tracking-wide">
              Elite Analytics & Scouting Network
            </p>
          </div>

          <div className="space-y-7 mt-auto">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5">
              <div className="flex-shrink-0 p-2 bg-pitch-green/10 rounded-lg text-pitch-green">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-1">Keşfedil</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Doğrulanmış fiziksel ve teknik verilerinizi profesyonel
                  ağlarda küresel olarak sergileyin.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5">
              <div className="flex-shrink-0 p-2 bg-tactical-blue/10 rounded-lg text-tactical-blue">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-1">Elit Yetenek Bul</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Gelişmiş filtreler ve AI değerlendirmelerini kullanarak
                  geleceğin yıldızlarını keşfedin.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5">
              <div className="flex-shrink-0 p-2 bg-accent-red/10 rounded-lg text-accent-red">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-1">Takım Analizi</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Football Manager tarzı derinlemesine veri analitiği ile
                  performansı ölçün.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="mt-8 h-px w-full bg-gradient-to-r from-pitch-green/30 via-border-standard to-transparent" />
        </div>

        {/* ━━━ RIGHT: Login Form ━━━ */}
        <div className="relative bg-surface-container border-l border-border-standard/60 p-8 lg:p-10 flex flex-col justify-center">
          <div className="animate-fade-in">
            <h2 className="text-headline-md text-on-surface mb-1.5">Giriş Yap</h2>
            <p className="text-sm text-text-muted mb-7">
              Hesabınıza erişmek için bilgilerinizi girin.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="login-username" className="block text-label-sm text-text-muted mb-2">
                  Kullanıcı Adı veya E-posta
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    className="w-full bg-surface-container-high border border-border-standard rounded-lg py-3 pl-10 pr-4 text-on-surface text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-pitch-green/60 focus:ring-1 focus:ring-pitch-green/20 transition-all"
                    placeholder="E-posta adresiniz veya kullanıcı adınız"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearError();
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-label-sm text-text-muted mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full bg-surface-container-high border border-border-standard rounded-lg py-3 pl-10 pr-10 text-on-surface text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-pitch-green/60 focus:ring-1 focus:ring-pitch-green/20 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {/* @ts-ignore */}
              {loginError && (
                <div className="flex items-center gap-2 text-accent-red text-xs bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full bg-surface-secondary border border-border-standard text-on-surface text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-high hover:border-pitch-green/60 hover:shadow-[0_0_20px_rgba(0,230,118,0.1)] transition-all duration-300 disabled:opacity-40 disabled:hover:border-border-standard disabled:hover:shadow-none"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Giriş Yap
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              Hesabınız yok mu?{' '}
              <Link
                to="/register"
                className="text-pitch-green font-semibold hover:underline"
              >
                Kayıt Olun
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Test credentials hint card ── */}
      <TestHint />
    </div>
  );
}
