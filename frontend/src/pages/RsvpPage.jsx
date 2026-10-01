import { CalendarDays, MapPin, TicketCheck, Trash2 } from 'lucide-react';
import ReminderControl from '../components/ReminderControl.jsx';
import { useAppData } from '../state/useAppData.js';

export default function RsvpPage() {
  const {
    rsvps, rsvpsLoading, actionError, busyEventId, toggleRsvp,
    reminders, saveReminder, busyReminderEventId,
  } = useAppData();

  return (
    <main className="rsvp-page">
      <div className="rsvp-intro">
        <div>
          <span className="eyebrow">Your confirmed plans</span>
          <h1>On the list.</h1>
        </div>
        <span className="rsvp-stamp"><TicketCheck size={17} /> SAVED TO YOUR PLANS</span>
      </div>

      {actionError && <div className="inline-error" role="alert">{actionError}</div>}
      {rsvpsLoading && <div className="rsvp-loading" aria-label="Loading RSVPs"><span /><span /><span /></div>}
      {!rsvpsLoading && rsvps.length === 0 && (
        <div className="rsvp-empty">
          <span className="rsvp-empty-mark"><TicketCheck size={21} /></span>
          <h2>No plans confirmed yet.</h2>
          <p>Events you mark as interested will show up here.</p>
        </div>
      )}
      {!rsvpsLoading && rsvps.length > 0 && (
        <section className="rsvp-list" aria-label="Confirmed event attendance">
          {rsvps.map((rsvp) => (
            <article className="rsvp-row" key={rsvp.eventId}>
              <div className="rsvp-date-block"><CalendarDays size={16} /><span>{rsvp.eventDate}</span><small>{rsvp.eventTime}</small></div>
              <div className="rsvp-event-details">
                <span className="eyebrow">CONFIRMED ATTENDANCE</span>
                <h2>{rsvp.eventTitle}</h2>
                <p><MapPin size={14} />{rsvp.venue}</p>
                <ReminderControl
                  reminder={reminders.find((item) => item.eventId === rsvp.eventId)}
                  busy={busyReminderEventId === rsvp.eventId}
                  onSave={(settings) => saveReminder(rsvp.eventId, settings)}
                />
              </div>
              <button
                className="remove-rsvp"
                type="button"
                aria-label={`Remove RSVP for ${rsvp.eventTitle}`}
                title="Remove RSVP"
                disabled={busyEventId === rsvp.eventId}
                onClick={() => toggleRsvp({
                  id: rsvp.eventId,
                  title: rsvp.eventTitle,
                  venue: rsvp.venue,
                  date: rsvp.eventDate,
                  time: rsvp.eventTime,
                })}
              ><Trash2 size={16} /></button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}