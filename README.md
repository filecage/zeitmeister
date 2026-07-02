# zeitmeister
zeitmeister is an open source library for scheduling appointments over an unlimited number of calendars.

I built it for myself because I wanted a custom, slim solution that doesn't force me to give third parties
access to my calendars.

It uses
- [`@filecage/ical-ts`](https://github.com/filecage/ical-ts) for iCal parsing
- [`@natelindev/tsdav`](https://github.com/natelindev/tsdav) as CalDAV client
- [`date-fns`](https://github.com/date-fns/date-fns) for DateTime- and timezone handling

## Calendar Connectors
zeitmeister supports CalDAV and WebDAV based calendars and implements access via tsdav.

You can add a calendar to the config like this:

```ts
type Calendar = {
    // A unique identifier for this calendar. Only required if you want to reference it as SchedulingCalendar.
    identifier?: string,
    
    // Type of the calendar. Be aware that `ical` cannot be used as SchedulingCalendar because it's read-only.
    adapter: 'caldav', // not supported yet: | 'googlecalendar' | 'ical',

    // URIs of the exact calendars that you want to check for. Can be relative to the server URI
    uris: string[],
    
    // Currently only username/password for HTTP basic auth supported
    auth: {
        username: string,
        password: string,
    }
}
```

## Usage
### Create instance
Create an instance of `zeitmeister.Scheduler` with your calendar- and availability configuration:
```ts
import {Scheduler} from 'zeitmeister';

const scheduler = new Scheduler({
    calendars,
    availability: [
        {
            // A string in the date-fns format of `EEEE HH:mm`
            start: 'monday 10:00',
            end: 'monday 17:30',
        },
        {
            // Days in the date-fns format of `EEEE`, start/end in the format of `HH:mm`
            days: ['thursday', 'friday'],
            start: '10:30',
            end: '18:00',
        }
    ],
    defaults: {
        duration: '30m',
        padding: '15m',
        planningAhead: '10d',
    },
    scheduleActors: [],
});

type ScheduleActor = (intent: {
    datetime: Date,
    duration: Interval,
    title: string,
    description: string,
    location: {type: 'virtual', url: string} | {type: 'physical', address: string},
    attendee: {
        emailAddress: string,
        name: string,
    }
}) => Promise<void>;
```

### Query for available timeslots
```ts
const slots = scheduler.query({
    start: new Date('2026-02-09'),
    end: new Date('2026-02-21'), // Note: if you omit the "end" date, the scheduler will use `start` + your default planning ahead interval
});

type slot = {
    start: Date,
    end: Date,
    available: boolean, // whether this slot is available or not
}
```

This will
1. Read your calendars and create busy times from all of your events within the query timeframe that don't have `FBTYPE` set to `FREE`
2. Create a negative of busy times from your `availability config` for each week within the query timeframe 
3. Return available slots

### Schedule a slot
> [!WARN] Scheduling is not yet implemented :)

```ts

enum ScheduleResult {
    SCHEDULED,
    FAILED_INVALID_INTENT,
    FAILED_SLOT_UNAVAILABLE,
}

const event = scheduler.schedule(scheduleIntent);
```

This will
1. Verify that the intent follows all given rules (duration, padding and within the previously defined availability slots - otherwise returns `ScheduleResult.FAILED_INVALID_INTENT`)
2. Get up-to-date calendar data (bypassing caches) to verify that the intended slot really is available (otherwise returns `ScheduleResult.FAILED_SLOT_UNAVAILABLE`)
3. Calls all defined schedule actors with the given intent. All actors will be called asynchronously. If any actor fails, an `SchedulingError` will be thrown with all errors that occurred during scheduling. However, actors will not be aborted.

