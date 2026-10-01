import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, TicketCheck } from 'lucide-react';
import { request } from '../services/api.js';
import { useAppData } from '../state/useAppData.js';

export default function InviteLandingPage({ token }) {
  const { userId } = useAppData();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    request(`/share/${encodeURIComponent(token)}?userId=${encodeURIComponent(userId)}`, { signal: controller.signal })
      .then(setInvite)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, userId]);

  return (
    <main className="invite-page">
      <span className="invite-mark"><TicketCheck size={22} /></span>
      <span className="eyebrow">A friend sent you out</span>
      {loading && <h1>Opening the invite…</h1>}
      {error && <><h1>Invite unavailable.</h1><p role="alert">{error}</p></>}
      {invite && <>
        <h1>{invite.event.title}</h1>
        <div className="invite-details">
          {invite.event.date && <span><CalendarDays size={15} />{invite.event.date}{invite.event.time ? ` · ${invite.event.time}` : ''}</span>}
          {invite.event.venue && <span><MapPin size={15} />{invite.event.venue}</span>}
        </div>
        <p className="invite-count">Friends Attending <strong>{invite.friendsAttending}</strong></p>
      </>}
    </main>
  );
}