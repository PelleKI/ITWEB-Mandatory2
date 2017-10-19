import { ObjectID } from "mongodb";

export class Exercise {
    _id: ObjectID;
    ExerciseName: string;
    Description: string;
    Sets: number;
    RepsOrTime: string;

    constructor(id: ObjectID = null) {
        this._id = id;
        this.ExerciseName = "Exercise name";
        this.Description = "Exercise description";
        this.Sets = 0;
        this.RepsOrTime = "x reps / x minutes";
    }
}