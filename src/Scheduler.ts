import CalendarConfig from "@/zeitmeister/types/CalendarConfig";
import AvailabilityRule from "@/zeitmeister/types/AvailabilityRule";
import ScheduleActor from "@/zeitmeister/types/ScheduleActor";
import Timeslot, {AvailabilityTimeslot} from "@/zeitmeister/types/Timeslot";
import ScheduleIntent from "@/zeitmeister/types/ScheduleIntent";
import ScheduleResult from "@/zeitmeister/types/ScheduleResult";
import CalendarProvider from "./CalendarProvider";
import {DurationString} from "@/zeitmeister/types/DurationString";
import {generateTimeslotsByAvailabilityRules} from "./util/generateTimeslotsByAvailabilityRules";
import {chunkTimeslot} from "./util/chunkTimeslot";
import {parseDurationString} from "./util/parseDurationString";
import {durationToSeconds} from "./util/durationToSeconds";
import {iterateTimeslotAvailability} from "./util/iterateTimeslotAvailability";

type SchedulerConfig = {
    calendars: CalendarConfig[],
    availability: AvailabilityRule[],
    scheduleActors: ScheduleActor[],
    defaults: {
        /**
         * The default duration of an event in the format of an interval string
         * Example values: 30m, 1h30m
         */
        duration: DurationString,

        /**
         * The default padding / duration between events in the format of an interval string
         * Example values: 10m, 30m
         */
        padding: DurationString,

        /**
         * The default maximum time we're allowing users to plan ahead
         * Example values: 14d, 30d
         */
        planningAhead: DurationString,
    }
};

export default class Scheduler {

    static fromConfig (schedulerConfig: SchedulerConfig) : Scheduler {
        const {calendars, ...config} = schedulerConfig;
        const provider = new CalendarProvider({calendars});

        return new Scheduler(provider, config);
    }

    constructor (
        private readonly calendarProvider: CalendarProvider,
        private readonly config: Omit<SchedulerConfig, 'calendars'>
    ) {}

    async *query (query: Timeslot) : AsyncGenerator<AvailabilityTimeslot> {
        const timeslots: AvailabilityTimeslot[] = [];
        const calendarEvents = this.calendarProvider.queryAllEvents(query);
        const timeslotLengthInSeconds = durationToSeconds(parseDurationString(this.config.defaults.duration));
        const timeslotPaddingInSeconds = durationToSeconds(parseDurationString(this.config.defaults.padding));

        for (const availabilitySlot of generateTimeslotsByAvailabilityRules(query, this.config.availability)) {
            for (const timeslotCandidate of chunkTimeslot(availabilitySlot, timeslotLengthInSeconds, timeslotPaddingInSeconds)) {
                timeslots.push({...timeslotCandidate, available: true});
            }
        }

        const busyTimeslots: Timeslot[] = [];
        for await (const {start, end} of calendarEvents) {
            busyTimeslots.push({start, end});
        }

        yield *iterateTimeslotAvailability(timeslots, busyTimeslots.sort((a, b) => a.start.getTime() - b.start.getTime()), {
            busyThresholdSecondsBefore: timeslotPaddingInSeconds,
            busyThresholdSecondsAfter: timeslotPaddingInSeconds
        });
    }

    /**
     *
     * @param {ScheduleIntent} intent
     * @throws SchedulingError
     */
    async schedule (intent: ScheduleIntent) : Promise<ScheduleResult> {
        // TODO: Implement me!
        throw new Error(`Not implemented`);
    }
}