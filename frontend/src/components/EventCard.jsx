import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';

export default function EventCard({ event, interested, busy, onToggle }) {
  return (
    <article className="event-card">
      <div className="event-art" style={event.image ? { backgroundImage: `url("${event.image}")` } : undefined}>
        {!event.image && <span className="event-art-mark">X / LIVE</span>}
        {event.url && <a className="event-source" href={event.url} target="_blank" rel="noreferrer" aria-label={`Tickets for ${event.title}`}><ArrowUpRight size={16} /></a>}
      </div>
      <div className="event-info">
        <div className="event-date-line"><CalendarDays size={14} /><span>{event.date}</span><span className="event-time">{event.time}</span></div>
        <h3>{event.title}</h3>
        <div className="event-venue"><MapPin size={14} /><span>{event.venue}{event.city ? ` · ${event.city}` : ''}</span></div>
        <button
          className={`interest-button${interested ? ' is-interested' : ''}`}
          type="button"
          disabled={busy}
          aria-pressed={interested}
          onClick={() => onToggle(event)}
        >
          <span className="interest-dot" />{busy ? 'Saving…' : interested ? 'Interested' : 'I’m interested'}
        </button>
      </div>
    </article>
  );
}