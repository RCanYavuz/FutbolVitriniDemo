import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, Check, X, ShieldAlert } from 'lucide-react';
import {
  adminApi,
  type AdminStats,
  type PendingUser,
} from '../../lib/admin.api';

const mockPendingUsers: PendingUser[] = [
  { id: 'mock-1', name: 'Ahmet Yılmaz', role: 'Scout', date: '2023-10-24', status: 'Bekliyor', email: 'ahmet@scout.com' },
  { id: 'mock-2', name: 'Caner Erkin', role: 'Oyuncu', date: '2023-10-23', status: 'Bekliyor', email: 'caner@player.com' },
  { id: 'mock-3', name: 'Fatih Terim', role: 'Antrenör', date: '2023-10-23', status: 'Bekliyor', email: 'fatih@coach.com' },
  { id: 'mock-4', name: 'Mehmet Ali', role: 'Menajer', date: '2023-10-22', status: 'Bekliyor', email: 'mehmet@agency.com' },
];

const mockStats: AdminStats = {
  totalStaff: 1248,
  activePlayers: 8430,
  pendingApprovals: mockPendingUsers.length,
};

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(mockPendingUsers);
  const [stats, setStats] = useState<AdminStats>(mockStats);
  const [feedback, setFeedback] = useState<{
    kind: 'error' | 'success';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const [statsResult, pendingResult] = await Promise.allSettled([
        adminApi.stats(),
        adminApi.pendingUsers(),
      ]);

      if (cancelled) return;

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      }
      if (pendingResult.status === 'fulfilled') {
        setPendingUsers(pendingResult.value);
      }
      if (statsResult.status === 'rejected' || pendingResult.status === 'rejected') {
        setFeedback({
          kind: 'error',
          message: 'Yönetim verileri sunucudan alınamadı. Örnek veriler gösteriliyor.',
        });
      }
      setIsLoading(false);
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const completeAction = (id: string, message: string) => {
    setPendingUsers((users) => users.filter((user) => user.id !== id));
    setStats((current) => ({
      ...current,
      pendingApprovals: Math.max(0, current.pendingApprovals - 1),
    }));
    setFeedback({ kind: 'success', message });
  };

  const refreshStats = async () => {
    try {
      setStats(await adminApi.stats());
    } catch {
      // Aksiyon tamamlandi; yeni istatistik okunamazsa yerel sayaç duzeltmesini koru.
    }
  };

  const handleApprove = async (id: string, name: string) => {
    setProcessingUserId(id);
    setFeedback(null);
    try {
      await adminApi.approve(id);
      completeAction(id, `${name} adlı kullanıcı onaylandı.`);
      await refreshStats();
    } catch {
      setFeedback({
        kind: 'error',
        message: `${name} adlı kullanıcı onaylanamadı. Lütfen tekrar deneyin.`,
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setProcessingUserId(id);
    setFeedback(null);
    try {
      await adminApi.reject(id);
      completeAction(id, `${name} adlı kullanıcının başvurusu reddedildi.`);
      await refreshStats();
    } catch {
      setFeedback({
        kind: 'error',
        message: `${name} adlı kullanıcının başvurusu reddedilemedi. Lütfen tekrar deneyin.`,
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-primary p-4 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-standard pb-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
              Yönetim Paneli
            </h1>
            <p className="text-text-muted mt-1">Sistem istatistikleri ve kullanıcı onay işlemleri.</p>
          </div>
        </div>

        {feedback && (
          <p
            role={feedback.kind === 'error' ? 'alert' : 'status'}
            className={`rounded-xl border px-4 py-3 text-sm ${
              feedback.kind === 'error'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {feedback.message}
          </p>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container rounded-2xl border border-border-standard p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 relative z-10 border border-rose-500/30">
              <Users className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-text-muted text-sm font-medium mb-1">Toplam Yetkili (Scout/Coach)</p>
              <h3 className="text-3xl font-bold text-on-surface">{stats.totalStaff.toLocaleString('tr-TR')}</h3>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl border border-border-standard p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 relative z-10 border border-rose-500/30">
              <UserCheck className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-text-muted text-sm font-medium mb-1">Aktif Oyuncu Profili</p>
              <h3 className="text-3xl font-bold text-on-surface">{stats.activePlayers.toLocaleString('tr-TR')}</h3>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl border border-border-standard p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 relative z-10 border border-rose-500/30">
              <Clock className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-text-muted text-sm font-medium mb-1">Onay Bekleyen Profil</p>
              <h3 className="text-3xl font-bold text-on-surface">{stats.pendingApprovals.toLocaleString('tr-TR')}</h3>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-surface-container rounded-2xl border border-border-standard overflow-hidden shadow-lg">
          <div className="p-6 border-b border-border-standard flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Onay Bekleyen Kullanıcılar</h2>
            <span className="bg-rose-500/20 text-rose-400 py-1 px-3 rounded-full text-sm font-bold border border-rose-500/30">
              {pendingUsers.length} Bekleyen
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high text-text-muted text-sm uppercase tracking-wider border-b border-border-standard">
                  <th className="py-4 px-6 font-semibold">Kullanıcı</th>
                  <th className="py-4 px-6 font-semibold">İletişim</th>
                  <th className="py-4 px-6 font-semibold">Rol</th>
                  <th className="py-4 px-6 font-semibold">Tarih</th>
                  <th className="py-4 px-6 font-semibold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-standard/50">
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">
                      Bekleyen onay işlemi bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-bold border border-border-standard">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-on-surface">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-text-muted border border-border-standard">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted">{user.date}</td>
                      <td className="py-4 px-6 text-right space-x-2 flex justify-end">
                        <button 
                          onClick={() => void handleApprove(user.id, user.name)}
                          disabled={isLoading || processingUserId !== null || user.id.startsWith('mock-')}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          title={user.id.startsWith('mock-') ? 'API bağlantısı gerekli' : 'Onayla'}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => void handleReject(user.id, user.name)}
                          disabled={isLoading || processingUserId !== null || user.id.startsWith('mock-')}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          title={user.id.startsWith('mock-') ? 'API bağlantısı gerekli' : 'Reddet'}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
