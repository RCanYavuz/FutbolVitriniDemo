import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getDefaultPath } from '../lib/navigation';
import { PENDING_CLASS, PENDING_HINT } from '../lib/pending';
import { validatePasswordChange } from '../lib/validation';
import { useAuthStore } from '../store/authStore';
import { mockPlayers } from '../store/mockData';

type SettingsTab = 'personal' | 'athletic' | 'media' | 'security';

const allSettingsTabs: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal Details', icon: 'person' },
  { id: 'athletic', label: 'Athletic Profile', icon: 'fitness_center' },
  { id: 'media', label: 'Media Management', icon: 'perm_media' },
  { id: 'security', label: 'Account Security', icon: 'shield' },
];

// Atletik profil ve medya yonetimi yalnizca oyunculara ozgudur; admin ve kulup
// (scout/coach) hesaplari icin sadece kisisel bilgi ve hesap guvenligi gosterilir.
const NON_PLAYER_TABS: SettingsTab[] = ['personal', 'security'];

const positionGroups = ['Attack', 'Midfield', 'Defense', 'Goalkeeper'];

export default function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  // Sadece oyuncular icin atletik/medya sekmeleri; diger rollerde panel kendi
  // giris tipine gore sadelesir.
  const isPlayer = user?.role === 'player';
  const settingsTabs = isPlayer
    ? allSettingsTabs
    : allSettingsTabs.filter((tab) => NON_PLAYER_TABS.includes(tab.id));
  // Oturumdaki kullanicinin adini forma on degerler olarak veriyoruz.
  const [givenName = '', ...restOfName] = (user?.name ?? '').split(' ');

  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');
  const [firstName, setFirstName] = useState(givenName);
  const [lastName, setLastName] = useState(restOfName.join(' '));
  const [email] = useState(user ? `${user.id}@futbolvitrini.local` : '');
  const [phone] = useState('');
  const [positionGroup, setPositionGroup] = useState('Midfield');
  const [height, setHeight] = useState('184');
  const [weight, setWeight] = useState('76');
  const [foot, setFoot] = useState('Right');
  const [hasChanges, setHasChanges] = useState(false);

  /* ── Guvenlik sekmesi: parola degistirme ── */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const handleChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setHasChanges(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validatePasswordChange({ currentPassword, newPassword, confirmPassword });
    if (error) {
      setPasswordFeedback({ type: 'error', message: error });
      return;
    }

    // TODO: backend hazir oldugunda PATCH /api/v1/users/me/password cagrilacak.
    setPasswordFeedback({
      type: 'success',
      message: 'Parolaniz guncellendi (demo: sunucuya gonderilmedi).',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-lg py-lg">
        {/* Breadcrumb */}
        <NavLink
          to={user ? getDefaultPath(user.role) : '/login'}
          className="text-tactical-blue text-sm hover:text-secondary transition-colors flex items-center gap-1 mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Return to Dashboard
        </NavLink>

        {/* Header */}
        <h1 className="text-headline-lg text-on-surface mb-1">Profile Settings</h1>
        <p className="text-body-md text-text-muted mb-8">
          {isPlayer
            ? 'Manage your personal information, athletic metrics, and account security.'
            : 'Manage your personal information and account security.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Settings Sidebar */}
          <div className="lg:col-span-3">
            <nav className="space-y-1 mb-6">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm text-left ${
                    activeTab === tab.id
                      ? 'bg-pitch-green/10 text-pitch-green font-semibold'
                      : 'text-text-muted hover:text-on-surface hover:bg-surface-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* System Status */}
            <div className="border-t border-border-standard pt-4 px-4">
              <h4 className="text-label-xs text-text-muted uppercase tracking-wider mb-3">
                System Status
              </h4>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-pitch-green" />
                <span className="text-label-sm text-text-muted">
                  Profile 100% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9 space-y-lg">
            {/* Identity & Contact */}
            {activeTab === 'personal' && (
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-headline-md text-on-surface">
                    Identity & Contact
                  </h2>
                  <button
                    type="button"
                    disabled
                    title={PENDING_HINT}
                    className={`text-label-sm text-text-muted bg-surface-secondary border border-border-standard px-3 py-1.5 rounded-lg hover:text-on-surface transition-colors ${PENDING_CLASS}`}
                  >
                    Public View
                  </button>
                </div>

                {/* Photo */}
                <div className="flex items-center gap-5 mb-8">
                  <img
                    src={user?.avatarUrl || mockPlayers[10]?.imageUrl || mockPlayers[0].imageUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-xl object-cover border border-border-standard"
                  />
                  <div>
                    <div className="flex gap-3 mb-2">
                      <button
                        type="button"
                        disabled
                        title={PENDING_HINT}
                        className={`text-sm bg-surface-secondary border border-border-standard px-4 py-2 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors ${PENDING_CLASS}`}
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        disabled
                        title={PENDING_HINT}
                        className={`text-sm text-accent-red hover:text-accent-red/80 transition-colors px-2 ${PENDING_CLASS}`}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-label-xs text-text-muted">
                      JPG, GIF or PNG. Max size of 5MB.
                    </p>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label htmlFor="settings-first-name" className="block text-label-sm text-text-muted mb-2">
                      First Name <span className="text-accent-red">*</span>
                    </label>
                    <input
                      id="settings-first-name"
                      type="text"
                      className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                      value={firstName}
                      onChange={(e) => handleChange(setFirstName, e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-last-name" className="block text-label-sm text-text-muted mb-2">
                      Last Name <span className="text-accent-red">*</span>
                    </label>
                    <input
                      id="settings-last-name"
                      type="text"
                      className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                      value={lastName}
                      onChange={(e) => handleChange(setLastName, e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="settings-email" className="block text-label-sm text-text-muted mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                        mail
                      </span>
                      <input
                        id="settings-email"
                        type="email"
                        className="w-full bg-surface-container-high border border-border-standard rounded-lg p-3 pl-10 text-text-muted text-body-md cursor-not-allowed"
                        value={email}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="settings-phone" className="block text-label-sm text-text-muted mb-2">
                      Phone Number
                    </label>
                    <input
                      id="settings-phone"
                      type="tel"
                      className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                      value={phone}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Athletic Core Settings — yalnizca oyuncular icin */}
            {isPlayer && (activeTab === 'personal' || activeTab === 'athletic') && (
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6 lg:p-8">
                <h2 className="text-headline-md text-on-surface mb-1">
                  Athletic Core Settings
                </h2>
                <p className="text-label-sm text-text-muted mb-6">
                  These attributes heavily influence search algorithms for scouts.
                </p>

                {/* Position Group */}
                <div className="mb-6">
                  <label className="block text-label-sm text-text-muted mb-3">
                    Primary Position Group
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {positionGroups.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => {
                          setPositionGroup(pos);
                          setHasChanges(true);
                        }}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          positionGroup === pos
                            ? 'bg-tactical-blue text-white shadow-md'
                            : 'bg-surface-secondary border border-border-standard text-text-muted hover:text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Physical Measurements */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-label-sm text-text-muted mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                      value={height}
                      onChange={(e) => handleChange(setHeight, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-text-muted mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                      value={weight}
                      onChange={(e) => handleChange(setWeight, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-text-muted mb-2">
                      Preferred Foot
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md appearance-none focus:outline-none focus:border-tactical-blue transition-colors"
                        value={foot}
                        onChange={(e) => handleChange(setFoot, e.target.value)}
                      >
                        <option>Right</option>
                        <option>Left</option>
                        <option>Both</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 text-text-muted pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media Management Tab */}
            {activeTab === 'media' && (
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6 lg:p-8">
                <h2 className="text-headline-md text-on-surface mb-4">Media Management</h2>
                <p className="text-text-muted text-sm mb-6">Upload and manage your highlight videos and gallery images.</p>
                <div className="border-2 border-dashed border-border-standard rounded-xl p-12 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-4xl text-text-muted mb-3">cloud_upload</span>
                  <p className="text-on-surface font-semibold mb-1">Drag & drop files here</p>
                  <p className="text-label-sm text-text-muted mb-4">MP4, MOV, JPG, PNG — Max 100MB</p>
                  <button
                    type="button"
                    disabled
                    title={PENDING_HINT}
                    className={`bg-surface-secondary border border-border-standard text-on-surface px-5 py-2 rounded-lg text-sm hover:bg-surface-container-high transition-colors ${PENDING_CLASS}`}
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6 lg:p-8">
                <h2 className="text-headline-md text-on-surface mb-4">Account Security</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="current-password" className="block text-label-sm text-text-muted mb-2">
                      Current Password
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPasswordFeedback(null);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="new-password" className="block text-label-sm text-text-muted mb-2">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordFeedback(null);
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-label-sm text-text-muted mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordFeedback(null);
                        }}
                      />
                    </div>
                  </div>

                  {passwordFeedback && (
                    <p
                      role={passwordFeedback.type === 'error' ? 'alert' : 'status'}
                      className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 border ${
                        passwordFeedback.type === 'error'
                          ? 'text-accent-red bg-accent-red/10 border-accent-red/20'
                          : 'text-pitch-green bg-pitch-green/10 border-pitch-green/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {passwordFeedback.type === 'error' ? 'error' : 'check_circle'}
                      </span>
                      {passwordFeedback.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="bg-pitch-green text-pitch-black font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    Update Password
                  </button>
                </form>

                <div className="space-y-5 mt-5">
                  <div className="flex items-center justify-between p-4 bg-surface-secondary border border-border-standard rounded-lg">
                    <div>
                      <p className="text-sm text-on-surface font-medium">Two-Factor Authentication</p>
                      <p className="text-label-xs text-text-muted">Add an extra layer of security</p>
                    </div>
                    <button
                      type="button"
                      disabled
                      title={PENDING_HINT}
                      className={`bg-pitch-green/10 border border-pitch-green/30 text-pitch-green text-sm font-semibold px-4 py-2 rounded-lg hover:bg-pitch-green/20 transition-colors ${PENDING_CLASS}`}
                    >
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Save Bar */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-surface-secondary border-t border-border-standard p-4 z-50">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Unsaved changes will be lost if you leave this page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setHasChanges(false)}
                  className="px-5 py-2.5 bg-surface-container-high border border-border-standard rounded-lg text-sm text-on-surface hover:bg-surface-bright transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => setHasChanges(false)}
                  className="px-5 py-2.5 bg-pitch-green text-pitch-black font-semibold rounded-lg text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
