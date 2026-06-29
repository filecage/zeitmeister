// This is identical to date-fns `Duration` but doesn't allow units larger than days
export interface Duration {
    /** The number of days in the duration */
    days?: number;
    /** The number of hours in the duration */
    hours?: number;
    /** The number of minutes in the duration */
    minutes?: number;
    /** The number of seconds in the duration */
    seconds?: number;
}