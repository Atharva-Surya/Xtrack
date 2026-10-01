import { Search, X } from 'lucide-react';
import Calendar from '../components/Calendar.jsx';
import EventCard from '../components/EventCard.jsx';
import { useAppData } from '../state/useAppData.js';

export default function DiscoverPage() {
  const {
    city, setCity, keyword, setKeyword, setMonth, selectedDate,
    setSelectedDate, events, calendar, total, rsvps, eventsLoading,
    eventsError, actionError, busyEventId, toggleRsvp,
  } = useAppData();

  function handleSearch(event) {
    event.preventDefault();
    setSelectedDate(null);
  }

  function changeMonth(nextMonth) {
    setMonth(nextMonth);
    setSelectedDate(null);
  }

  return (
    <main className="discover-page">
      <section className="discover-heading">
        <div>
          <span className="eyebrow">Out there, together</span>
          <h1>Make a night<br /><em>of it.</em></h1>
        </div>
        <p className="discover-note">Good things are happening<br />just around the corner.</p>
      </section>

      <form className="search-bar" onSubmit={handleSearch}>
        <label className="search-field city-field">
          <span>City</span>
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Where are you going?" aria-label="City" />
        </label>
        <span className="search-divider" />
        <label className="search-field keyword-field">
          <span>Find a vibe</span>
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Jazz, food, art…" aria-label="Search events" />
        </label>
        <button className="search-submit" type="submit"><Search size={17} /><span>Find events</span></button>
      </form>

      {actionError && <div className="inline-error" role="alert">{actionError}</div>}
      <div className="discovery-layout">
        <aside className="discovery-rail">
          <Calendar
            calendar={calendar}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeMonth={changeMonth}
          />
          <div className="rail-note"><span className="rail-note-icon">+</span><span>Find a date. Find your people.</span></div>
        </aside>

        <section className="event-results" aria-live="polite">
          <div className="results-heading">
            <div>
              <span className="eyebrow">{selectedDate ?? calendar?.label ?? 'Your city'}</span>
              <h2>{city ? `Events in ${city}` : 'Pick your next plan'}</h2>
            </div>
            <span className="result-count">{eventsLoading ? 'Loading' : `${total} found`}</span>
          </div>
          {selectedDate && <button className="clear-date" type="button" onClick={() => setSelectedDate(null)}><X size={14} /> Clear date</button>}

          {eventsError ? <div className="empty-state error-state"><span className="empty-index">!</span><h3>We hit a pause.</h3><p>{eventsError}</p></div> : null}
          {!eventsError && eventsLoading && <div className="event-loading" aria-label="Loading events"><span /><span /><span /></div>}
          {!eventsError && !eventsLoading && !city && <div className="empty-state"><span className="empty-index">01</span><h3>Start close to home.</h3><p>Enter a city above to see what’s on.</p></div>}
          {!eventsError && !eventsLoading && city && events.length === 0 && <div className="empty-state"><span className="empty-index">02</span><h3>Nothing on this date.</h3><p>Try another day or broaden your search.</p></div>}
          {!eventsError && !eventsLoading && events.length > 0 && (
            <div className="event-grid">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  interested={rsvps.some((rsvp) => rsvp.eventId === event.id)}
                  busy={busyEventId === event.id}
                  onToggle={toggleRsvp}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}