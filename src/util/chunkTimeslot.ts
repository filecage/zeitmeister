import Timeslot from "@/zeitmeister/types/Timeslot";
import {addSeconds} from "date-fns";

export function *chunkTimeslot (timeslot: Timeslot, chunkLengthInSeconds: number, paddingInSeconds: number = 0) : Generator<Timeslot> {
    if (chunkLengthInSeconds === 0 && paddingInSeconds === 0) {
        throw new Error(`Can not chunk timeslot if chunk length and padding is zero`);
    }

    const cursor = new Date(timeslot.start);

    while (cursor < timeslot.end) {
        const start = new Date(cursor);
        const end = addSeconds(cursor, chunkLengthInSeconds);

        if (end <= timeslot.end) {
            yield {start, end};
        }

        cursor.setTime(cursor.getTime() + ((chunkLengthInSeconds + paddingInSeconds) * 1000));
    }
}