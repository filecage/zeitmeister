import CalendarConfig from "@/zeitmeister/types/CalendarConfig";
import AvailabilityRule from "@/zeitmeister/types/AvailabilityRule";
import ScheduleActor from "@/zeitmeister/types/ScheduleActor";
import Timeslot from "@/zeitmeister/types/Timeslot";
import ScheduleIntent from "@/zeitmeister/types/ScheduleIntent";
import ScheduleResult from "@/zeitmeister/types/ScheduleResult";

export default class Scheduler {
    constructor (private readonly schedulerConfig: {
        calendars: CalendarConfig[],
        availability: AvailabilityRule[],
        scheduleActors: ScheduleActor[],
        defaults: {
            // These are all interval strings (e.g. 10d, 15m, 1h30m)
            duration: string,
            padding: string,
            planningAhead: string,
        }
    }) {

    }

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