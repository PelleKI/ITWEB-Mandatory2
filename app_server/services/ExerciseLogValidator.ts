import { ExerciseLog } from "../models/ExerciseLog";

export class ExerciseLogValidator {
    // Could be refactored to skip additional checks if validty is already false
    public CheckPutData(data: ExerciseLog): boolean {
        let validity = true;
        let exerciseLog = new ExerciseLog();
        // Checks that the sent data contains all the data needed for
        // a complete workoutprogram
        for (let field in exerciseLog) {
            if (data[field] == undefined) {
                validity = false;
                break;
            }
        }
        // Checks that it doesn't contain more fields than
        // workout program has
        for (let field in data) {
            if (exerciseLog[field] == undefined) {
                validity = false;
                break;
            }
        }
        return validity;
    }

    public CheckPatchData(data: any): boolean {
        let validity = true;        
        let exerciseLog = new ExerciseLog();
        // Checks that it doesn't contain more fields than
        // workout program has
        for (let field in data) {
            if (exerciseLog[field] == undefined) {
                validity = false;
                break;
            }
        }
        return validity;
    }
}