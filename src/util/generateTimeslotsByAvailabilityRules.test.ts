import { test, expect } from "vitest";
import {generateTimeslotsByAvailabilityRules} from "./generateTimeslotsByAvailabilityRules";

const DEFAULT_QUERY = {start: new Date('2026-06-30T00:00:00Z'), end: new Date('2026-07-11T00:00:00Z')};

test('Should correctly generate slots for next day', () => {
    expect([...generateTimeslotsByAvailabilityRules(DEFAULT_QUERY, [
        {start: 'monday 23:00', end: 'wednesday 02:30'}
    ])]).toMatchSnapshot();
});

test('Should correctly merge availability slots', () => {
    expect([...generateTimeslotsByAvailabilityRules(DEFAULT_QUERY, [
        {start: '09:42', end: '14:30', days: ['friday', 'saturday']},
        {start: '11:11', end: '14:44'}
    ])]).toMatchSnapshot();
});

test('Should correctly create availability slots', () => {
    expect([...generateTimeslotsByAvailabilityRules(DEFAULT_QUERY, [
        {start: 'monday 10:00', end: 'thursday 18:00'},
        {start: 'friday 10:00', end: 'friday 13:00'}, // Freitag um eins macht jeder seins
    ])]).toMatchSnapshot();
});

test('Should correctly end slot generation if last day has 23:59:59', () => {
    expect([...generateTimeslotsByAvailabilityRules({start: new Date('2026-02-17T00:00:00Z'), end: new Date('2026-02-17T23:59:59Z')}, [
        {days: ['tuesday', 'wednesday', 'thursday', 'friday'], start: '10:00', end: '18:00'},
        {days: ['monday'], start: '13:00', end: '18:00'},
    ])]).toEqual([
        {
            "end": new Date("2026-02-17T17:00:00.000Z"),
            "start": new Date("2026-02-17T09:00:00.000Z"),
        }
    ])
});