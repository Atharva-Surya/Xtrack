import { Bell } from 'lucide-react';

export default function ReminderControl({ reminder, busy, onSave }) {
  return (
    <div className="reminder-control">
      <label className="reminder-toggle">
        <input
          type="checkbox"
          checked={Boolean(reminder?.enabled)}
          disabled={busy}
          onChange={(event) => onSave({
            enabled: event.target.checked,
            minutesBefore: reminder?.minutesBefore ?? 1440,
          })}
        />
        <Bell size={14} /><span>Reminder</span>
      </label>
      <select
        aria-label="Reminder time"
        value={reminder?.minutesBefore ?? 1440}
        disabled={!reminder?.enabled || busy}
        onChange={(event) => onSave({ enabled: true, minutesBefore: Number(event.target.value) })}
      >
        <option value={15}>15 minutes before</option>
        <option value={60}>1 hour before</option>
        <option value={180}>3 hours before</option>
        <option value={1440}>1 day before</option>
      </select>
    </div>
  );
}