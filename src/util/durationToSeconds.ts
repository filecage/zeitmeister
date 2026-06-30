import {Duration} from "@/zeitmeister/types/Duration";

export function durationToSeconds (duration: Duration) : number {
    const { days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}