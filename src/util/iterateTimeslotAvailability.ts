import Timeslot, {AvailabilityTimeslot} from "@/zeitmeister/types/Timeslot";

/**
 * Applies a sweeping line algorithm to mark available timeslots.
 * WARNING: BOTH ARRAYS NEED TO BE SORTED BEFOREHAND!
 *
 * @param timeslots
 * @param busyTimes
 * @param options
 */
export function *iterateTimeslotAvailability (timeslots: Timeslot[], busyTimes: Timeslot[], options: {busyThresholdSecondsBefore: number, busyThresholdSecondsAfter: number}) : Generator<AvailabilityTimeslot> {
    let index = 0;
    let timeslot: Timeslot;

    busyTimesLoop: for (const busyTime of busyTimes) {
        while (index < timeslots.length) {
            let available = true;
            timeslot = timeslots[index];

            // Apply busy threshold
            const busyTimeStart = new Date(busyTime.start.getTime() - options.busyThresholdSecondsBefore * 1000);
            const busyTimeEnd = new Date(busyTime.end.getTime() + options.busyThresholdSecondsAfter * 1000);

            if (busyTimeEnd < timeslot.start) {
                // if busy time occurs before our timeslot, we skip to the next busy time
                continue busyTimesLoop;
            } else if (
                   (busyTimeStart <= timeslot.start && timeslot.start < busyTimeEnd) // timeslot starts during busyTime
                || (busyTimeStart < timeslot.end && timeslot.end < busyTimeEnd)     // timeslot ends during busyTime
                || (timeslot.start < busyTimeStart && busyTimeEnd < timeslot.end)    // busyTime is within timeslot
            ) {
                // if busy time overlaps, we mark this timeslot as unavailable
                available = false;
            }

            // emit the timeslot and go to the next one
            yield {...timeslot, available};
            index++;
        }
    }

    // After we went through all busy times, we still have to emit the remaining timeslots as available
    for (const timeslot of timeslots.slice(index)) {
        yield {...timeslot, available: true};
    }
}