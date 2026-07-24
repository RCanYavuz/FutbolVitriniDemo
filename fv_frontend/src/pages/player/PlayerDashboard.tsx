import { useState } from 'react';
import {
  Eye,
  Bookmark,
  Activity,
  UploadCloud,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadClick = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsUploading(false), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-primary p-4 lg:p-lg">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">Hoş Geldin, {user?.name}</h1>
            <p className="text-text-muted">Profilinin performansını ve son analizleri buradan takip edebilirsin.</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] flex items-center gap-2"
          >
            Profili Düzenle
          </button>
        </div>

        {/* WIDGETS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Widget 1: Haftalık Görüntülenme */}
          <div className="bg-surface-container rounded-2xl border border-border-standard p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 relative z-10 border border-violet-500/30">
              <Eye className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-text-muted text-sm font-medium mb-1">Haftalık Görüntülenme</p>
              <h3 className="text-3xl font-bold text-on-surface">42</h3>
            </div>
          </div>

          {/* Widget 2: Kısa Listeye Eklenme */}
          <div className="bg-surface-container rounded-2xl border border-border-standard p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 relative z-10 border border-violet-500/30">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-text-muted text-sm font-medium mb-1">Kısa Listeye Eklenme</p>
              <h3 className="text-3xl font-bold text-on-surface">3</h3>
            </div>
          </div>

          {/* Widget 3: AI Eşleşme Oranı */}
          <div className="bg-surface-container rounded-2xl border border-border-standard p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 relative z-10 border border-violet-500/30">
              <Activity className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-text-muted text-sm font-medium mb-1">AI Eşleşme Oranı</p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-on-surface">%89</h3>
                <span className="text-emerald-400 text-sm font-semibold pb-1">+2% artış</span>
              </div>
            </div>
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-surface-container rounded-2xl border border-border-standard p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-violet-400" />
              Medya & Portfolyo
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Yeteneklerini gösterecek maç videoları, antrenman kesitleri veya CV'ni yükle.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div 
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isUploading 
                  ? 'border-violet-500/50 bg-violet-500/5' 
                  : 'border-border-standard hover:border-violet-500/50 hover:bg-surface-container-high'
              }`}
            >
              {isUploading ? (
                <div className="w-full max-w-xs space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-violet-300 font-medium">Yükleniyor...</span>
                    <span className="text-violet-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2">
                    Yeni Video/Portfolyo Yükle
                  </h3>
                  <p className="text-sm text-text-muted max-w-sm">
                    Sürükleyip bırakın veya bilgisayarınızdan seçin. (MP4, PDF, MAX 500MB)
                  </p>
                </>
              )}
            </div>

            {/* Recent Uploads (Mock) */}
            <div className="bg-surface-container-high rounded-xl p-5 border border-border-standard/50">
              <h4 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Son Yüklemeler</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-surface-primary rounded-lg border border-border-standard/50 hover:border-violet-500/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">Galatasaray U19 Maç Özeti</p>
                    <p className="text-xs text-text-muted">142 MB • 2 gün önce</p>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                    Aktif
                  </span>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-surface-primary rounded-lg border border-border-standard/50 hover:border-violet-500/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">Atletik Performans Raporu</p>
                    <p className="text-xs text-text-muted">2.4 MB • 1 hafta önce</p>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
