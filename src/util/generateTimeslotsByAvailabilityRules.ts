import {endOfDay, startOfDay} from "date-fns";
import AvailabilityRule, {HourMinute} from "@/zeitmeister/types/AvailabilityRule";
import Timeslot from "@/zeitmeister/types/Timeslot";
import {normaliseAvailability, WEEKDAYS} from "./normaliseAvailability";

/**
 * This function generates timeslots for the given availability rules.
 */
export function *generateTimeslotsByAvailabilityRules (between: {start: Date, end: Date}, availabilityRules: AvailabilityRule[]) : Generator<Timeslot> {
    if (between.start >= between.end || availabilityRules.length === 0) {
        return;
    }

    const timeslots: Timeslot[] = [];
    const rules = [...normaliseAvailability(...availabilityRules)]
        // Availability rules are sorted beforehand, so the generated slots are also sorted correctly (this way we have to sort less items)
        .sort((a, b) => hourMinuteToMinutes(a.start) - hourMinuteToMinutes(b.start));


    // For each day, we generate *all* possible timeslots, regardless of the query time
    // If a slot does not match the query, it will be marked as unavailable later
    const cursor = startOfDay(between.start);
    const end = endOfDay(between.end);

    while (cursor < end) {
        const weekday = WEEKDAYS[cursor.getDay()];

        for (const rule of rules) {
            if (!rule.days.includes(weekday)) {
                continue;
            }

            const start = atTime(cursor, rule.start);
            const end = atTime(cursor, rule.end);
            if (end <= start) {
                // If end time is lower than start time, we have to skip to the next day (for example: 23:00-01:00)
                end.setDate(end.getDate() + 1);
            }

            if (start >= between.start && end <= between.end) {
                timeslots.push({start, end});
            }
        }

        // Move cursor to next day
        cursor.setDate(cursor.getDate() + 1);
    }

    if (!timeslots.length) {
        return;
    }

    // Next, we merge all slots that overlap
    let currentSlot = timeslots[0];
    for (let i = 1; i < timeslots.length; i++) {
        const timeslot = timeslots[i];

        if (timeslot.start <= currentSlot.end) {
            // Set current slot end time to latest slot's end time if they overlap
            currentSlot.end.setTime(Math.max(timeslot.end.getTime(), currentSlot.end.getTime()));
        } else {
            // If they don't overlap, emit the current slot and set this slot to the current slot
            yield currentSlot;
            currentSlot = timeslot;
        }
    }

    // Emit last slot when loop has run (or hasn't if there was only one item)
    yield currentSlot;
}

function hourMinuteToMinutes (hm: HourMinute) : number {
    const {hours, minutes} = parseHourMinute(hm);

    return hours * 60 + minutes;
}

function parseHourMinute(hm: HourMinute): { hours: number; minutes: number } {
    const [h, m] = hm.split(':').map(Number);
    return { hours: h, minutes: m };
}

function atTime(date: Date, hm: HourMinute): Date {
    const {hours, minutes} = parseHourMinute(hm);
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);

    return d;
}