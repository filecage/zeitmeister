import {describe, test, expect} from "vitest";
import {isDurationString, parseDurationString} from "./parseDurationString";
import {DurationString} from "@/zeitmeister/types/DurationString";
import {Duration} from "@/zeitmeister/types/Duration";

const DURATIONS_VALID: {duration: DurationString, expected: Duration}[] = [
    {duration: '1d2h3m4s', expected: {days: 1, hours: 2, minutes: 3, seconds: 4}},
    {duration: '365d', expected: {days: 365, hours: 0, minutes: 0, seconds: 0}},
    {duration: '23h', expected: {days: 0, hours: 23, minutes: 0, seconds: 0}},
    {duration: '59m', expected: {days: 0, hours: 0, minutes: 59, seconds: 0}},
    {duration: '59s', expected: {days: 0, hours: 0, minutes: 0, seconds: 59}},
    {duration: '0s', expected: {days: 0, hours: 0, minutes: 0, seconds: 0}},
    {duration: '0d0h0m0s', expected: {days: 0, hours: 0, minutes: 0, seconds: 0}},
    {duration: '', expected: {days: 0, hours: 0, minutes: 0, seconds: 0}},
];

describe.each(DURATIONS_VALID)(`DurationString $duration is valid and parsed`, ({duration, expected}) => {
    test('validates correctly', () => expect(isDurationString(duration)).toBe(true));
    test('parses correctly', () => expect(parseDurationString(duration)).toStrictEqual(expected));
});

const DURATIONS_INVALID = [
    'hello world',
    '1h30m12',
    'hms',
    '-12d'
];

describe.each(DURATIONS_INVALID)(`Broken DurationString '%s' is invalid and rejected`, duration => {
    test('invalidates correctly', () => expect(isDurationString(duration)).toBe(false));
    test('is rejected when parsed', () => expect(() => parseDurationString(duration as DurationString)).toThrow(`Invalid duration string: '${duration}'`))
});