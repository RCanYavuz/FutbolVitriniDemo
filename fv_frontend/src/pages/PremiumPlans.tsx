import { Check } from 'lucide-react';

export default function PremiumPlans() {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₺0',
      period: '/ ay',
      description: 'Futbol Vitrini dünyasına giriş yapmak isteyenler için temel özellikler.',
      features: [
        'Sınırlı Oyuncu Araması (Günde 10)',
        'Temel İstatistikleri Görüntüleme',
        'Sadece 1 Adet Video Yükleme',
        'Topluluk Desteği',
      ],
      ctaText: 'Hemen Başla',
      isPopular: false,
    },
    {
      id: 'pro',
      name: 'Pro Scout',
      price: '₺499',
      period: '/ ay',
      description: 'Yetenek avcıları ve profesyonel gözlemciler için gelişmiş analitik araçları.',
      features: [
        'Sınırsız Oyuncu Araması',
        'FM Tarzı Detaylı Gelişmiş Filtreler',
        'Oyuncu Kıyaslama Aracı (Radar Grafik)',
        'Sınırsız Video ve Portfolyo Görüntüleme',
        'Erken Erişim (Yeni Eklenen Oyuncular)',
        'Öncelikli E-posta Desteği',
      ],
      ctaText: 'Pro\'ya Geç',
      isPopular: true,
    },
    {
      id: 'elite',
      name: 'Elite Agency',
      price: '₺1499',
      period: '/ ay',
      description: 'Menajerlik şirketleri ve profesyonel kulüpler için tam kapsamlı çözüm.',
      features: [
        'Pro Scout\'daki Tüm Özellikler',
        'AI Destekli Yetenek Eşleşme Raporları',
        'Kurumsal Dashboard & Alt Kullanıcılar',
        'Oyuncularla Doğrudan İletişim',
        'PDF Export & Toplu Veri Çekme',
        '7/24 Öncelikli Telefon Desteği',
      ],
      ctaText: 'Satış Ekibiyle Görüş',
      isPopular: false,
    },
  ];

  const handleSelectPlan = (planName: string) => {
    alert(`${planName} planını seçtiniz. Yönlendiriliyorsunuz...`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-primary py-12 px-4 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="text-center max-w-2xl mb-12 relative z-10">
        <h1 className="text-4xl lg:text-5xl font-bold text-on-surface mb-4">
          Oyununuzu Bir Üst Seviyeye Taşıyın
        </h1>
        <p className="text-lg text-text-muted">
          Futbol Vitrini'nin gelişmiş araçlarıyla yetenekleri daha hızlı keşfedin veya kendi potansiyelinizi tüm dünyaya kanıtlayın. İhtiyacınıza uygun planı seçin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full relative z-10 items-center">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-surface-container rounded-3xl p-8 flex flex-col transition-transform duration-300 ${
              plan.isPopular 
                ? 'border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)] md:-translate-y-4 md:scale-105 bg-surface-container-high' 
                : 'border border-border-standard shadow-lg hover:border-amber-500/50'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-pitch-black text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                En Popüler
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-on-surface mb-2">{plan.name}</h3>
              <p className="text-sm text-text-muted h-10">{plan.description}</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-on-surface">{plan.price}</span>
              <span className="text-text-muted">{plan.period}</span>
            </div>
            
            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className={`w-5 h-5 flex-shrink-0 ${plan.isPopular ? 'text-amber-400' : 'text-emerald-500'}`} />
                  <span className="text-sm text-text-muted">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSelectPlan(plan.name)}
              className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                plan.isPopular
                  ? 'bg-amber-500 hover:bg-amber-400 text-pitch-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-surface-secondary hover:bg-surface-container-high text-on-surface border border-border-standard hover:border-amber-500/50'
              }`}
            >
              {plan.ctaText}
            </button>
          </div>
        ))}
      </div>
      
    </div>
  );
}
