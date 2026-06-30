import {test, expect} from 'vitest';
import {chunkTimeslot} from "./chunkTimeslot";

test('Should chunk the timeslot from 10:30 to 17:00 in 13 chunks of 30 minutes', () => {
    expect([...chunkTimeslot({
        start: new Date('2026-06-30T10:30:00Z'),
        end: new Date('2026-06-30T17:00:00Z')
    }, 30)]).toMatchSnapshot();
});

test('Should chunk the timeslot from 10:30 to 17:00 in 9 chunks of 30 minutes with 15 minutes padding', () => {
    expect([...chunkTimeslot({
        start: new Date('2026-07-01T10:30:00Z'),
        end: new Date('2026-07-01T17:00:00Z')
    }, 30, 15)]).toMatchSnapshot();
})

test('Should chunk the timeslot over multiple days and months', () => {
    expect([...chunkTimeslot({
        start: new Date('2026-06-30T10:30:00Z'),
        end: new Date('2026-07-02T17:00:00Z')
    }, 360, 10)]).toMatchSnapshot();
});

test('Should chunk zero-length chunks', () => {
    expect([...chunkTimeslot({
        start: new Date('2026-06-30T10:00:00Z'),
        end: new Date('2026-06-30T10:05:00Z')
    }, 0, 1)]).toMatchSnapshot();

})

test('Should throw error if length and padding is zero', () => {
    expect(() => [...chunkTimeslot({start: new Date('2026-06-30T10:00:00Z'), end: new Date('2026-06-30T10:42:00')}, 0, 0)])
        .toThrow(`Can not chunk`);
})