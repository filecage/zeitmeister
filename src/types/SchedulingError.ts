export default class SchedulingError extends Error {
    constructor(public readonly throwables: {throwable: unknown}[]) {
        super();
    }
}