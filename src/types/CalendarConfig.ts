type CalendarConfig = {
    /**
     * A unique identifier for the calendar. Only required if the calendar is referenced.
     */
    identifier?: string,

    /**
     * Type of the calendar.
     * Be aware that `ical` cannot be used as Scheduling calendar because it's read-only
     */
    adapter: 'caldav' | 'googlecalendar' | 'ical',
};

export default CalendarConfig;