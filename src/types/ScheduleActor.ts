import ScheduleIntent from "@/zeitmeister/types/ScheduleIntent";

/**
 * An actor that takes the schedule intent and acts upon it
 * This can be used for actually storing the event, sending an email or starting a workflow.
 *
 * Errors may be thrown. The handler will catch them, wait until all other actors have finished
 * and then throw a combined `SchedulingError` to the callee.
 *
 * Multiple actors will be run in parallel.
 */
type ScheduleActor = (intent: ScheduleIntent) => Promise<void>;

export default ScheduleActor;