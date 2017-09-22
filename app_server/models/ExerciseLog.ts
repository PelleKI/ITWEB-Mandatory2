import { Exercise } from './Exercise';
import { ObjectID } from 'mongodb';

export class ExerciseLog {
    TimeStamp: Date;
    WorkoutProgramId: ObjectID;

    constructor() {
        this.TimeStamp = new Date();
        this.WorkoutProgramId = new ObjectID("000000000000");
    }
}