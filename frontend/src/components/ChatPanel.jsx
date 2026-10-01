import { ArrowUp, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function ChatPanel({ messages, loading, onSend, rsvps, busyEventId, onToggleRsvp }) {
  const [draft, setDraft] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onSend(draft);
    setDraft('');
  }

  return (
    <section className="chat-panel" aria-label="Event chat">
      <div className="chat-heading">
        <span className="chat-icon"><MessageCircle size={17} /></span>
        <div><span className="eyebrow">Ask around</span><h2>Find it in a conversation.</h2></div>
      </div>
      <div className="chat-transcript" aria-live="polite">
        {messages.length === 0 && <p className="chat-placeholder">Try a vibe, a venue, or something to do.</p>}
        {messages.map((item, index) => (
          <div className={`chat-message ${item.role}`} key={`${item.role}-${index}`}>
            <p>{item.role === 'user' ? item.text : item.reply}</p>
            {item.events?.length > 0 && <div className="chat-event-results">
              {item.events.map((event) => {
                const interested = rsvps.some((rsvp) => rsvp.eventId === event.id);
                return <article className="chat-event" key={event.id}>
                  <div><strong>{event.title}</strong><span>{event.date} · {event.venue}</span><small>Friends Attending: {event.friendsAttending}</small></div>
                  <button type="button" disabled={busyEventId === event.id} onClick={() => onToggleRsvp(event)}>{interested ? 'Interested' : 'Interested?'}</button>
                </article>;
              })}
            </div>}
          </div>
        ))}
        {loading && <div className="chat-message assistant"><p>Looking…</p></div>}
      </div>
      <form className="chat-compose" onSubmit={handleSubmit}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What sounds good?" aria-label="Message" />
        <button type="submit" disabled={loading} aria-label="Send message"><ArrowUp size={17} /></button>
      </form>
    </section>
  );
}