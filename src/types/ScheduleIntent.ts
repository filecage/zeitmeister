import {Duration} from 'date-fns';

type ScheduleIntent = {
    datetime: Date,
    duration: Duration,
    title: string,
    description: string,
    location: {type: 'virtual', url: string} | {type: 'physical', address: string},
    attendee: {
        emailAddress: string,
        name: string,
    }
};

export default ScheduleIntent;