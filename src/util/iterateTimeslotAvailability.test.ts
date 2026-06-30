import { describe, expect, it } from "vitest";
import { iterateTimeslotAvailability } from './iterateTimeslotAvailability';

type Timeslot = { start: Date; end: Date };
type AvailabilityTimeslot = Timeslot & { available: boolean };

// Helper: build a Date from a simple "HH:MM" string on a fixed day
function t(time: string): Date {
    const [h, m] = time.split(':').map(Number);
    return new Date(2026, 0, 1, h, m, 0, 0);
}

function slot(start: string, end: string): Timeslot {
    return { start: t(start), end: t(end) };
}

function collect(
    timeslots: Timeslot[],
    busyTimes: Timeslot[],
    options: { busyThresholdBefore: number; busyThresholdAfter: number }
): AvailabilityTimeslot[] {
    return [...iterateTimeslotAvailability(timeslots, busyTimes, {busyThresholdSecondsBefore: options.busyThresholdBefore * 60, busyThresholdSecondsAfter: options.busyThresholdAfter * 60})];
}

const noThreshold = { busyThresholdBefore: 0, busyThresholdAfter: 0 };

describe('basic overlap detection', () => {
    it('returns empty generator for empty timeslots', () => {
        const result = collect([], [slot('09:00', '10:00')], noThreshold);
        expect(result).toEqual([]);
    });

    it('marks all timeslots available when busyTimes is empty', () => {
        const timeslots = [slot('09:00', '10:00'), slot('10:00', '11:00')];
        const result = collect(timeslots, [], noThreshold);

        expect(result).toHaveLength(2);
        expect(result.every((r) => r.available)).toBe(true);
    });

    it('marks timeslot as busy when fully overlapping a busy time', () => {
        const timeslots = [slot('09:00', '10:00')];
        const busy = [slot('09:00', '10:00')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(false);
    });

    it('marks timeslot as busy when partially overlapping (busy starts inside timeslot)', () => {
        const timeslots = [slot('09:00', '10:00')];
        const busy = [slot('09:30', '10:30')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(false);
    });

    it('marks timeslot as busy when partially overlapping (busy ends inside timeslot)', () => {
        const timeslots = [slot('09:00', '10:00')];
        const busy = [slot('08:30', '09:30')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(false);
    });

    it('marks timeslot as busy when busy time fully contains it', () => {
        const timeslots = [slot('09:00', '10:00')];
        const busy = [slot('08:00', '11:00')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(false);
    });

    it('marks timeslot as busy when timeslot fully contains the busy time', () => {
        const timeslots = [slot('08:00', '11:00')];
        const busy = [slot('09:00', '10:00')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(false);
    });

    it('marks timeslot as available when there is a gap before busy time', () => {
        const timeslots = [slot('08:00', '09:00')];
        const busy = [slot('10:00', '11:00')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(true);
    });

    it('marks timeslot as available when there is a gap after busy time', () => {
        const timeslots = [slot('12:00', '13:00')];
        const busy = [slot('10:00', '11:00')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(true);
    });

    it('treats touching boundaries as NOT overlapping (busy ends exactly when timeslot starts)', () => {
        const timeslots = [slot('10:00', '11:00')];
        const busy = [slot('09:00', '10:00')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(true);
    });

    it('treats touching boundaries as NOT overlapping (timeslot ends exactly when busy starts)', () => {
        const timeslots = [slot('09:00', '10:00')];
        const busy = [slot('10:00', '11:00')];
        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(true);
    });
});

describe('busyThresholdBefore / busyThresholdAfter', () => {
    // busyThresholdBefore extends the busy window backward from its start
    // e.g. busy starts at 10:00 with a 10m threshold -> effectively busy from 09:50

    it('extends busy window backward by busyThresholdBefore and catches an overlapping timeslot', () => {
        // busy 10:00-11:00, threshold 10 -> effective busy from 09:50
        // timeslot 09:30-09:55 overlaps [09:50, 11:00)
        const timeslots = [slot('09:30', '09:55')];
        const busy = [slot('10:00', '11:00')];
        const result = collect(timeslots, busy, { busyThresholdBefore: 10, busyThresholdAfter: 0 });

        expect(result[0].available).toBe(false);
    });

    it('does not extend busy window backward when timeslot ends exactly at the threshold edge', () => {
        // busy 10:00-11:00, threshold 10 -> effective busy from 09:50 (exclusive)
        // timeslot ends exactly at 09:50 -> touching, not overlapping
        const timeslots = [slot('09:00', '09:50')];
        const busy = [slot('10:00', '11:00')];
        const result = collect(timeslots, busy, { busyThresholdBefore: 10, busyThresholdAfter: 0 });

        expect(result[0].available).toBe(true);
    });

    it('marks timeslot available when it ends before the extended (thresholded) busy window', () => {
        // busy 10:00-11:00, threshold 10 -> effective busy from 09:50
        // timeslot ends 09:45, before 09:50 -> still available
        const timeslots = [slot('09:00', '09:45')];
        const busy = [slot('10:00', '11:00')];
        const result = collect(timeslots, busy, { busyThresholdBefore: 10, busyThresholdAfter: 0 });

        expect(result[0].available).toBe(true);
    });

    // busyThresholdAfter extends the busy window forward from its end.
    // e.g. busy ends at 11:45 with a 15m threshold -> effectively busy until 12:00.

    it('extends busy window forward by busyThresholdAfter and catches an overlapping timeslot', () => {
        // busy 11:00-11:45, threshold 15 -> effective busy until 12:00
        // timeslot 11:50-12:30 overlaps... wait, must start before 12:00
        const timeslots = [slot('11:55', '12:30')];
        const busy = [slot('11:00', '11:45')];
        const result = collect(timeslots, busy, { busyThresholdBefore: 0, busyThresholdAfter: 15 });

        expect(result[0].available).toBe(false);
    });

    it('does not extend busy window forward when timeslot starts exactly at the threshold edge', () => {
        // busy 11:00-11:45, threshold 15 -> effective busy until 12:00 (exclusive)
        // timeslot starts exactly at 12:00 -> touching, not overlapping
        const timeslots = [slot('12:00', '13:00')];
        const busy = [slot('11:00', '11:45')];
        const result = collect(timeslots, busy, { busyThresholdBefore: 0, busyThresholdAfter: 15 });

        expect(result[0].available).toBe(true);
    });

    it('marks timeslot available when it starts after the extended (thresholded) busy window', () => {
        // busy 11:00-11:45, threshold 15 -> effective busy until 12:00
        // timeslot starts 12:05, after 12:00 -> still available
        const timeslots = [slot('12:05', '13:00')];
        const busy = [slot('11:00', '11:45')];
        const result = collect(timeslots, busy, { busyThresholdBefore: 0, busyThresholdAfter: 15 });

        expect(result[0].available).toBe(true);
    });

    it('applies both thresholds simultaneously on the same busy time', () => {
        // busy 10:00-10:30, before threshold 10 -> effective start 09:50
        // after threshold 15 -> effective end 10:45
        const busy = [slot('10:00', '10:30')];
        const options = { busyThresholdBefore: 10, busyThresholdAfter: 15 };

        const beforeEdgeBusy = collect([slot('09:45', '09:55')], busy, options); // overlaps effective 09:50-10:45
        const afterEdgeBusy = collect([slot('10:40', '11:00')], busy, options); // overlaps effective 09:50-10:45
        const stillAvailable = collect([slot('09:00', '09:50')], busy, options); // ends exactly at edge

        expect(beforeEdgeBusy[0].available).toBe(false);
        expect(afterEdgeBusy[0].available).toBe(false);
        expect(stillAvailable[0].available).toBe(true);
    });

});

describe('multiple timeslots and busy times', () => {
    it('correctly marks a mix of available and busy timeslots', () => {
        const timeslots = [
            slot('08:00', '09:00'), // available
            slot('09:00', '10:00'), // busy
            slot('10:00', '11:00'), // available
            slot('11:00', '12:00'), // busy
        ];
        const busy = [slot('09:30', '09:45'), slot('11:15', '11:45')];

        const result = collect(timeslots, busy, noThreshold);

        expect(result.map((r) => r.available)).toEqual([true, false, true, false]);
    });

    it('marks timeslot busy if it overlaps with any one of several busy times', () => {
        const timeslots = [slot('09:00', '10:00')];
        const busy = [slot('06:00', '07:00'), slot('09:30', '09:45'), slot('14:00', '15:00')];

        const result = collect(timeslots, busy, noThreshold);

        expect(result[0].available).toBe(false);
    });

    it('handles a busy time overlapping multiple consecutive timeslots', () => {
        const timeslots = [
            slot('09:00', '09:30'),
            slot('09:30', '10:00'),
            slot('10:00', '10:30'),
        ];
        const busy = [slot('09:15', '10:15')];

        const result = collect(timeslots, busy, noThreshold);

        expect(result.map((r) => r.available)).toEqual([false, false, false]);
    });
});

describe('output shape and generator behavior', () => {
    it('returns a generator (lazy iterable), not an array', () => {
        const gen = iterateTimeslotAvailability([slot('09:00', '10:00')], [], {busyThresholdSecondsBefore: 0, busyThresholdSecondsAfter: 0});
        expect(typeof gen.next).toBe('function');
        expect(typeof (gen)[Symbol.iterator]).toBe('function');
    });

    it('yields the same number of items as input timeslots, in the same order', () => {
        const timeslots = [
            slot('08:00', '09:00'),
            slot('09:00', '10:00'),
            slot('10:00', '11:00'),
        ];
        const result = collect(timeslots, [], noThreshold);

        expect(result).toHaveLength(timeslots.length);
        result.forEach((r, i) => {
            expect(r.start).toEqual(timeslots[i].start);
            expect(r.end).toEqual(timeslots[i].end);
        });
    });

    it('preserves original start/end values while adding the available flag', () => {
        const original = slot('09:00', '10:00');
        const result = collect([original], [], noThreshold);

        expect(result[0]).toMatchObject({
            start: original.start,
            end: original.end,
            available: true,
        });
    });
});