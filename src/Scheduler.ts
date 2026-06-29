import CalendarConfig from "@/zeitmeister/types/CalendarConfig";
import AvailabilityRule from "@/zeitmeister/types/AvailabilityRule";
import ScheduleActor from "@/zeitmeister/types/ScheduleActor";
import Timeslot from "@/zeitmeister/types/Timeslot";
import ScheduleIntent from "@/zeitmeister/types/ScheduleIntent";
import ScheduleResult from "@/zeitmeister/types/ScheduleResult";
import CalendarProvider from "./CalendarProvider";

export default class Scheduler {

    static fromConfig (schedulerConfig: {
        calendars: CalendarConfig[],
        availability: AvailabilityRule[],
        scheduleActors: ScheduleActor[],
        defaults: {
            /**
             * The default duration of an event in the format of an interval string
             * Example values: 30m, 1h30m
             */
            duration: string,

            /**
             * The default padding / duration between events in the format of an interval string
             * Example values: 10m, 30m
             */
            padding: string,

            /**
             * The default maximum time we're allowing users to plan ahead
             * Example values: 14d, 30d
             */
            planningAhead: string,
        }
    }) : Scheduler {
    }

    constructor (
        private readonly calendarProvider: CalendarProvider
    ) {}

    async query (query: Timeslot) : Promise<Timeslot[]> {
        // TODO: Implement me!
    }

    /**
     *
     * @param {ScheduleIntent} intent
     * @throws SchedulingError
     */
    async schedule (intent: ScheduleIntent) : Promise<ScheduleResult> {
        // TODO: Implement me!
    }
}