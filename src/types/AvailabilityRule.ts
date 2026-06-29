export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type HourMinute = `${number}:${number}`;

/**
 * @example {start: 'monday 10:30', end: 'friday 18:00'}
 */
export interface AvailabilityRuleSingle {
    start: `${Weekday} ${HourMinute}`,
    end: `${Weekday} ${HourMinute}`,
}

/**
 * @example {start: '10:30', end: '18:30', days: ['monday', 'thursday']}
 */
export interface AvailabilityRuleMultiple {
    start: HourMinute,
    end: HourMinute,
    days?: Weekday[],
}

type AvailabilityRule = AvailabilityRuleSingle | AvailabilityRuleMultiple;

export default AvailabilityRule;