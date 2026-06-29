import {Duration} from "@/zeitmeister/types/Duration";
import {DurationString} from "@/zeitmeister/types/DurationString";

const DURATION_STRING_REGEX = new RegExp(/^(?<days>\d+d)?(?<hours>[0-9]+h)?(?<minutes>[0-9]+m)?(?<seconds>[0-9]+s)?$/);

export function parseDurationString (duration: DurationString) : Duration {
    const matches = duration.match(DURATION_STRING_REGEX);
    if (matches === null) {
        throw new Error(`Invalid duration string: '${duration}'`);
    }

    return {
        days: parseInt(matches.groups?.days || '0'),
        hours: parseInt(matches.groups?.hours || '0'),
        minutes: parseInt(matches.groups?.minutes || '0'),
        seconds: parseInt(matches.groups?.seconds || '0'),
    };
}

export function isDurationString (duration: string) : duration is DurationString {
    return DURATION_STRING_REGEX.test(duration);
}