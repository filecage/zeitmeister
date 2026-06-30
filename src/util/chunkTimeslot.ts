import Timeslot from "@/zeitmeister/types/Timeslot";
import {addMinutes} from "date-fns";

export function *chunkTimeslot (timeslot: Timeslot, chunkLengthInMinutes: number, paddingInMinutes: number = 0) : Generator<Timeslot> {
    const cursor = new Date(timeslot.start);

    while (cursor < timeslot.end) {
        const start = new Date(cursor);
        const end = addMinutes(cursor, chunkLengthInMinutes);

        if (end <= timeslot.end) {
            yield {start, end};
        }

        cursor.setMinutes(cursor.getMinutes() + chunkLengthInMinutes + paddingInMinutes);
    }
}