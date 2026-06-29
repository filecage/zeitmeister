import AvailabilityRule from "@/zeitmeister/types/AvailabilityRule";
import {expect, test} from "vitest";
import {normaliseAvailability} from "./normaliseAvailability";

const rules: AvailabilityRule[] = [
    {start: 'monday 09:42', end: 'friday 18:00'},
    {start: '10:00', end: '18:00', days: ['monday', 'thursday']},
    {start: '12:00', end: '16:00', days: ['friday', 'saturday', 'sunday']},
    {start: 'friday 10:30', end: 'friday 18:00'},
    {start: 'friday 10:30', end: 'monday 18:00'},
    {start: '10:42', end: '19:00'},
];

test('Rules are normalised', () => {
    expect([...normaliseAvailability(...rules)]).toMatchSnapshot();
})