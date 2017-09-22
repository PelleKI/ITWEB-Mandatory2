import { Exercise } from "../models/Exercise";
import { WorkoutProgram } from "../models/WorkoutProgram";

export class ModelValidatorService {
    public CheckPutExerciseData(data: Exercise): boolean {
        let validity = true;        
        let exercise = new Exercise();
        for (let field in exercise) {
            if (data[field] == undefined) {
                validity = false;
            }
        }
        return validity;
    }

    public CheckPatchExerciseData(data: any): boolean {
        let validity = true;
        let exercise = new Exercise();
        for (let field in data) {
            if (exercise[field] == undefined) {
                validity = false;
                break;
            }
        }
        return validity;
    }

    // Could be refactored to skip additional checks if validty is already false
    public CheckPutData(data: WorkoutProgram): boolean {
        let validity = true;
        let workoutProgram = new WorkoutProgram();
        // Checks that the sent data contains all the data needed for
        // a complete workoutprogram
        for (let field in workoutProgram) {
            if (data[field] == undefined) {
                validity = false;
                break;
            }
        }
        // Checks that it doesn't contain more fields than
        // workout program has
        for (let field in data) {
            if (workoutProgram[field] == undefined) {
                validity = false;
                break;
            }
        }
        // Check that all exercises are proper for a put operation
        for (let exercise of data.ExerciseList) {
            if(!this.CheckPutExerciseData(exercise)){
                validity = false;
                break;
            }
        }

        return validity;
    }

    public CheckPatchData(data: any): boolean {
        let validity = true;        
        let workoutProgram = new WorkoutProgram();
        // Checks that it doesn't contain more fields than
        // workout program has
        for (let field in data) {
            if (workoutProgram[field] == undefined) {
                validity = false;
                break;
            }
        }
        // Check that all exercises are proper for a patch operation
        if(data.ExerciseList != undefined){
            for (let exercise of data.ExerciseList) {
                if(!this.CheckPatchExerciseData(exercise)){
                    validity = false;
                    break;
                }
            }
        }

        return validity;
    }
}