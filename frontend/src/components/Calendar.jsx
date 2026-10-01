import { ChevronLeft, ChevronRight } from 'lucide-react';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({ calendar, selectedDate, onSelectDate, onChangeMonth }) {
  if (!calendar) {
    return <section className="calendar-panel calendar-empty" aria-label="Event calendar">
      <span className="eyebrow">Your local calendar</span>
      <p>Choose a city to see event dates.</p>
    </section>;
  }

  return (
    <section className="calendar-panel" aria-label="Event calendar">
      <div className="calendar-heading">
        <div>
          <span className="eyebrow">Event calendar</span>
          <h2>{calendar.label}</h2>
        </div>
        <div className="calendar-arrows">
          <button className="icon-button" type="button" aria-label="Previous month" onClick={() => onChangeMonth(calendar.previousMonth)}>
            <ChevronLeft size={17} />
          </button>
          <button className="icon-button" type="button" aria-label="Next month" onClick={() => onChangeMonth(calendar.nextMonth)}>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="calendar-grid" role="grid" aria-label={calendar.label}>
        {weekdays.map((weekday) => <span className="weekday" key={weekday}>{weekday}</span>)}
        {calendar.cells.map((cell) => cell.date ? (
          <button
            className={`calendar-day${cell.eventCount ? ' has-events' : ''}${selectedDate === cell.date ? ' selected' : ''}`}
            type="button"
            key={cell.date}
            aria-label={`${cell.date}, ${cell.eventCount} events`}
            aria-pressed={selectedDate === cell.date}
            onClick={() => onSelectDate(selectedDate === cell.date ? null : cell.date)}
          >
            <span>{cell.day}</span>
            {cell.eventCount > 0 && <i aria-hidden="true" />}
          </button>
        ) : <span className="calendar-blank" key={cell.key} />)}
      </div>
      <div className="calendar-legend"><i /> Dates with events</div>
    </section>
  );
}