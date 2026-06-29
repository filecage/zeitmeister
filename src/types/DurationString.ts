export type DurationDaysString = `${number}d`;
export type DurationHoursString = `${number}h`;
export type DurationMinutesString = `${number}m`;
export type DurationSecondsString = `${number}s`;

export type DurationString = `${DurationDaysString | ''}${DurationHoursString | ''}${DurationMinutesString | ''}${DurationSecondsString | ''}`;