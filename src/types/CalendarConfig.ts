type CalendarConfigBase = {
    /**
     * A unique identifier for the calendar. Only required if the calendar is referenced.
     */
    identifier?: string,

    /**
     * Type of the calendar.
     * Be aware that `ical` cannot be used as Scheduling calendar because it's read-only
     */
    adapter: string,

    /**
     * Server URI of the calendar
     */
    server: string,

    /**
     * URIs of the exact calendars that you want to check for
     * Can be relative to the server URI
     */
    uris: string[],
};

type CalDavCalendarConfig = Omit<CalendarConfigBase, 'adapter'> & {
    adapter: 'caldav',

    /**
     * Authentication credentials
     * Currently only username/password (HTTP basic auth) supported
     */
    auth: {
        username: string,
        password: string,
    }
}

type CalendarConfig = CalDavCalendarConfig;

export default CalendarConfig;