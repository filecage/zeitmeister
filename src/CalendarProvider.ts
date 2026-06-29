import CalendarConfig from "@/zeitmeister/types/CalendarConfig";
import {DAVCalendar, fetchCalendarObjects, getBasicAuthHeaders} from "tsdav";
import {ICS} from "@filecage/ical";
import {parseString} from "@filecage/ical/parser";
import {getDateFromDateTime, getEventEndDateTime} from "@filecage/ical/Getters";

export default class CalendarProvider {
    constructor (private readonly config: {
        calendars: CalendarConfig[]
    }) {}

    async *queryAllEvents (query: {
        start: Date,
        end: Date,
    }) : AsyncGenerator<{start: Date, end: Date, event: ICS.VEVENT.Published}> {
        const queries = Promise.all(this.config.calendars.map(calendarConfig => {
            const headers = getBasicAuthHeaders(calendarConfig.auth);

            return calendarConfig.uris.map(calendarUri => fetchCalendarObjects({
                calendar: {url: new URL(calendarUri, `https://${calendarConfig.server}`).toString()} satisfies DAVCalendar,
                timeRange: {start: query.start.toISOString(), end: query.end.toISOString()},
                expand: true,
                headers,
            }));
        }).flat());

        for (const query of await queries) {
            for (const object of query) {
                try {
                    const calendars = parseString(object.data);
                    for (const calendar of calendars.VCALENDAR) {
                        for (const event of calendar.VEVENT ?? []) {
                            // Skip non-busy events
                            if (event.TRANSP?.value === 'TRANSPARENT') {
                                continue;
                            }

                            yield {
                                start: getDateFromDateTime(event.DTSTART.value, calendar.VTIMEZONE || []),
                                end: getDateFromDateTime(getEventEndDateTime(event), calendar.VTIMEZONE || []),
                                event,
                            };
                        }
                    }

                } catch (e) {
                    // TODO: Correct error handling, throw an exception/error to the consumer
                    console.error(`Error: '${typeof e === 'object' && e && 'message' in e && e.message}' for object ${object.url}`);
                    console.error(`Object data:\n${object.data}\n`);
                    console.error(e);
                }
            }
        }
    }

}