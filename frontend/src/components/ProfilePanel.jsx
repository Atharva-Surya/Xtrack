import { X } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePanel({ profile, profileLoading, error, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const saved = await onSave({ displayName, email });
    setSaving(false);
    if (saved) onClose();
  }

  return (
    <div className="profile-backdrop" role="dialog" aria-modal="true" aria-labelledby="profile-title" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="profile-panel">
        <div className="profile-heading">
          <div><span className="eyebrow">Your details</span><h2 id="profile-title">Profile</h2></div>
          <button className="icon-button" type="button" aria-label="Close profile" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <form className="profile-form" onSubmit={handleSubmit}>
          <label><span>Name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
          <label><span>Email</span><input type="text" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <button className="profile-save" type="submit" disabled={saving || profileLoading}>{saving ? 'Saving…' : 'Save profile'}</button>
        </form>
      </section>
    </div>
  );
}