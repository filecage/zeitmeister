import AvailabilityRule, {AvailabilityRuleMultiple, HourMinute, Weekday} from "@/zeitmeister/types/AvailabilityRule";

export const WEEKDAYS: Weekday[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
] as const;

/**
 * Normalises multi- and single availability rules.
 * CAUTION: This function *does not* validate each rule itself.
 *
 * @param {AvailabilityRule[]} rules
 */
export function *normaliseAvailability (...rules: AvailabilityRule[]) : Generator<AvailabilityRuleMultiple & {days: Weekday[]}> {
    for (const rule of rules) {
        if ('days' in rule && rule.days !== undefined) {
            yield rule as AvailabilityRuleMultiple & {days: Weekday[]};
            continue;
        }

        const [startingWeekday, start] = rule.start.split(' ') as [Weekday, HourMinute];
        const [endingWeekday, end] = rule.end.split(' ') as [Weekday, HourMinute];

        // if start/end does not consist of two parts, it's only time data
        // assume all weekdays then
        if (!start || !end) {
            yield {
                start: startingWeekday as HourMinute,
                end: endingWeekday as HourMinute,
                days: WEEKDAYS,
            };

            continue;
        }

        // Re-order weekdays so that we can iterate from start to end
        // If start and end match, it's the full week
        const days = startingWeekday === endingWeekday
            ? WEEKDAYS
            : (() => {
                const weekdays = [
                    ...WEEKDAYS.slice(WEEKDAYS.indexOf(startingWeekday)),
                    ...WEEKDAYS.slice(0, WEEKDAYS.indexOf(startingWeekday))
                ];

                return weekdays.slice(0, weekdays.indexOf(endingWeekday) + 1);
            })()
        ;

        yield {start, end, days};
    }
}