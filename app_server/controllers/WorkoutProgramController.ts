import { WorkoutProgramValidator } from '../services/WorkoutProgramValidator';
import { APIControllerBase } from './APIControllerBase';
import { WorkoutProgram } from '../models/WorkoutProgram';
import { Exercise } from '../models/Exercise';
import { ExerciseLog } from '../models/ExerciseLog';
import { MongoClient, Db, Collection, Cursor, ObjectID } from 'mongodb';
import { CurrentConfig } from '../ConfigLoader';

var express = require('express');
var router = express.Router();

export class WorkoutController extends APIControllerBase {
    private workoutProgramRepo: Collection<WorkoutProgram>;
    private exerciseLogRepo: Collection<ExerciseLog>;

    public constructor(private dbUrl: string, private workoutProgramCollectionName: string, private exerciseLogCollectionName: string, private modelValidator: WorkoutProgramValidator) {
        super();
    }

    public ConnectToDb(): Promise<void> {
        return MongoClient.connect(this.dbUrl).then((db) => {
            this.workoutProgramRepo = db.collection(this.workoutProgramCollectionName);
            this.exerciseLogRepo = db.collection(this.exerciseLogCollectionName);
        });
    }

    public GetAll(req, res): void {
        this.SetHeaders(res);
        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.find({}).toArray())
            .then(data => {
                if(data != null) {
                    res.status(200);
                    res.send(JSON.stringify(data));   
                }
                else {
                    this.SendDataBaseError(res);
                }
            })
    }

    public Get(req, res): void {
        this.SetHeaders(res);
        let id = req.params['id'];

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOne({ '_id': new ObjectID(id) }))
            .then((data) => {
                if(data != null) {
                    res.status(200);
                    res.send(JSON.stringify(data));   
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public Post(req, res): void {
        this.SetHeaders(res);

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.insertOne(new WorkoutProgram()))
            .then((result) => {
                if (result.result.ok == 1) {
                    res.status(200);
                    res.send(JSON.stringify({ id: result.insertedId, data: result.ops.find(() => true) }));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public Put(req, res): void {
        // Guards against wrong content types
        if (!this.CheckContentType(req)) {
            this.SendWrongContentTypeError(res);
            return;
        }

        // Guards against wrong data
        let obj = req.body as WorkoutProgram;
        if (!this.modelValidator.CheckPutData(obj)) {
            this.SendWrongDataError(res);
            return;
        }       

        this.SetHeaders(res);
        let id = req.params['id'];

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOneAndReplace({ '_id': new ObjectID(id) }, obj))
            .then((result) => {
                if (result.ok == 1) {
                    res.status(200);
                    res.send(JSON.stringify({ id: id, data: obj }));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public Patch(req, res): void {
        // Guards against wrong content types
        if (!this.CheckContentType(req)) {
            this.SendWrongContentTypeError(res);
            return;
        }

        // Guards against wrong data
        let obj = req.body;
        if (!this.modelValidator.CheckPatchData(obj)) {
            this.SendWrongDataError(res);
            return;
        }

        this.SetHeaders(res);
        let id = req.params['id'];

        // Make sure we don't overwrite every single one of the 
        // exercises of the data is incomplete
        if(obj.ExerciseList != undefined) {
            for(let i = 0; i < obj.ExerciseList.length; ++i) {
                for(let field in obj.ExerciseList[i])
                {
                    obj["ExerciseList." + i + "." + field] = obj.ExerciseList[i][field];                    
                }
            }
        }
        // Make sure the update command doesn't contain exerciselist
        // as mongo doesn't know how to use this when doing a partial
        // edit
        delete obj.ExerciseList;

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOneAndUpdate({ '_id': new ObjectID(id) }, {$set: obj}, { returnOriginal: false }))
            .then((result) => {
                if (result.ok == 1) {
                    res.status(200);
                    res.send(JSON.stringify(result.value));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public Delete(req, res): void {
        this.SetHeaders(res);
        let id = req.params['id'];

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOneAndDelete({ '_id': new ObjectID(id) }))
            .then((result) => {
                if (result.ok == 1) {
                    res.status(200);
                    res.send();
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public GetAllExercise(req, res): void {
        this.SetHeaders(res);
        let id = req.params['id'];

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOne({ '_id': new ObjectID(id) }))
            .then((data) => {
                if(data != null) {
                    res.status(200);
                    res.send(JSON.stringify(data.ExerciseList));   
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public GetExercise(req, res): void {
        this.SetHeaders(res);
        let id = req.params['id'];
        let index = req.params['index'];

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOne({ '_id': new ObjectID(id) }))
            .then((data) => {
                if(data != null && data.ExerciseList[index] != undefined) {
                    res.status(200);
                    res.send(JSON.stringify(data.ExerciseList[index]));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public PostExercise(req, res): void {
        this.SetHeaders(res);
        let id = req.params['id'];

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOneAndUpdate({ '_id': new ObjectID(id) },
                { $push: { ExerciseList: new Exercise() } }))
            .then((result) => {
                if (result.ok = 1) {
                    let index = result.value.ExerciseList.length - 1;
                    res.status(200);
                    res.send(JSON.stringify(result.value.ExerciseList[index]));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public PutExercise(req, res): void {
        // Guards against wrong content types
        if (!this.CheckContentType(req)) {
            this.SendWrongContentTypeError(res);
            return;
        }

        // Guards against wrong data
        let obj = req.body as Exercise;
        if (!this.modelValidator.CheckPutExerciseData(obj)) {
            this.SendWrongDataError(res);
            return;
        }

        this.SetHeaders(res);
        let id = req.params['id'];
        let index = req.params['index'];

        let fieldsToUpdate = {};
        fieldsToUpdate['$set']['ExerciseList.' + index] = obj;

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOneAndUpdate({ _id: new ObjectID(id) }, fieldsToUpdate))
            .then((result) => {
                if (result.ok == 1) {
                    res.status(200);
                    res.send(JSON.stringify(result.value.ExerciseList[index]));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public PatchExercise(req, res): void {
        // Guards against wrong content types
        if (!this.CheckContentType(req)) {
            this.SendWrongContentTypeError(res);
            return;
        }

        // Guards against wrong data
        let obj = req.body as Exercise;
        if (!this.modelValidator.CheckPatchExerciseData(obj)) {
            this.SendWrongDataError(res);
            return;
        }

        this.SetHeaders(res);
        let id = req.params['id'];
        let index = req.params['index'];

        let fieldsToUpdate = {};
        for (let field in obj) {
            fieldsToUpdate['$set']['ExerciseList.' + index + '.' + field] = obj[field];
        }

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOneAndUpdate({ _id: new ObjectID(id) }, fieldsToUpdate, { returnOriginal: false }))
            .then((result) => {
                if (result.ok == 1) {
                    res.status(200);
                    res.send(JSON.stringify(result.value.ExerciseList[index]));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public DeleteExercise(req, res): void {
        this.SetHeaders(res);
        let id = req.params['id'];
        let index = req.params['index'];

        this.ConnectToDb()
            .then(() => this.workoutProgramRepo.findOne({ _id: new ObjectID(id) }))
            .then((data) => {
                let obj = data as WorkoutProgram;
                obj.ExerciseList.splice(index, 1);
                return obj;
            })
            .then((obj) => {
                this.workoutProgramRepo.findOneAndUpdate({ _id: new ObjectID(id) }, obj)
                    .then((result) => {
                        if (result.ok == 1) {
                            res.status(200);
                            res.send();
                        }
                        else {
                            this.SendDataBaseError(res);
                        }
                    });
            });
    }

    public GetLogs(req, res): void {
        this.SetHeaders(res);
        let id = req.params['id'];

        this.ConnectToDb()
            .then(() => this.exerciseLogRepo.find({ WorkoutProgramId: new ObjectID(id) }).sort({TimeStamp: -1}).toArray())
            .then((data) => {
                if(data != null) {
                    res.status(200);
                    res.send(JSON.stringify(data));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public PostLog(req, res) {
        this.SetHeaders(res);
        let id = req.params['id'];

        let newLog = new ExerciseLog();
        newLog.WorkoutProgramId = new ObjectID(id);
        newLog.TimeStamp = new Date();

        this.ConnectToDb()
            .then(() => this.exerciseLogRepo.insertOne(newLog))
            .then((result) => {
                if (result.result.ok == 1) {
                    res.status(200);
                    res.send(JSON.stringify({ id: result.insertedId, data: result.ops.find(() => true) }));
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    private SendDataBaseError(res) {
        res.status(500);
        res.send(JSON.stringify({ err: 'Database error' }));
    }
}


function CreateController(): WorkoutController {
    let conf = CurrentConfig();
    return new WorkoutController(conf.DBConnectionString, conf.WorkoutProgramsCollection, conf.ExerciseLogCollection, new WorkoutProgramValidator());
}
let WorkoutControllerRoutes = router;

// Root routes
WorkoutControllerRoutes.get('/', (req, res) => {
    CreateController().GetAll(req, res);
});
WorkoutControllerRoutes.get('/:id', (req, res) => {
    CreateController().Get(req, res);
});
WorkoutControllerRoutes.post('/', (req, res) => {
    CreateController().Post(req, res);
});
WorkoutControllerRoutes.put('/:id', (req, res) => {
    CreateController().Put(req, res);
});
WorkoutControllerRoutes.patch('/:id', (req, res) => {
    CreateController().Patch(req, res);
});
WorkoutControllerRoutes.delete('/:id', (req, res) => {
    CreateController().Delete(req, res);
});

// Exercise logs
WorkoutControllerRoutes.get('/:id/logs', (req, res) => {
    CreateController().GetLogs(req, res);
});
WorkoutControllerRoutes.post('/:id/logs', (req, res) => {
    CreateController().PostLog(req, res);
});

// Exercise routes

WorkoutControllerRoutes.get('/:id/exercise', (req, res) => {
    CreateController().GetAllExercise(req, res);
});
WorkoutControllerRoutes.get('/:id/exercise/:index', (req, res) => {
    CreateController().GetExercise(req, res);
});
WorkoutControllerRoutes.post('/:id/exercise', (req, res) => {
    CreateController().PostExercise(req, res);
});
WorkoutControllerRoutes.put('/:id/exercise/:index', (req, res) => {
    CreateController().PutExercise(req, res);
});
WorkoutControllerRoutes.patch('/:id/exercise/:index', (req, res) => {
    CreateController().PatchExercise(req, res);
});
WorkoutControllerRoutes.delete('/:id/exercise/:index', (req, res) => {
    CreateController().DeleteExercise(req, res);
});

export { WorkoutControllerRoutes };