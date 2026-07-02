type Timeslot = {
    start: Date,
    end: Date,
};

export type AvailabilityTimeslot = Timeslot & {
    available: boolean
};

export default Timeslot;