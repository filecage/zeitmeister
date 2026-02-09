type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type HourMinute = `${number}:${number}`;

interface AvailabilityRuleSingle {
    start: `${Weekday} ${HourMinute}`,
    end: `${Weekday} ${HourMinute}`,
}

interface AvailabilityRuleMultiple {
    start: HourMinute,
    end: HourMinute,
    days?: Weekday[],
}

type AvailabilityRule = AvailabilityRuleSingle | AvailabilityRuleMultiple;

export default AvailabilityRule;