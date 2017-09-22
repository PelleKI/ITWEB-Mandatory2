import { ExerciseLogValidator } from '../services/ExerciseLogValidator';
import { APIControllerBase } from './APIControllerBase';
import { ExerciseLog } from '../models/ExerciseLog';
import { MongoClient, Db, Collection, Cursor, ObjectID } from 'mongodb';
import { CurrentConfig } from '../ConfigLoader';

var express = require('express');
var router = express.Router();

export class ExerciseLogController extends APIControllerBase {
    private repo: Collection;

    public constructor(private dbUrl: string, private exerciseLogCollectionName: string, private modelValidator: ExerciseLogValidator) {
        super();
    }

    public ConnectToDb(): Promise<void> {
        return MongoClient.connect(this.dbUrl).then((db) => {
            this.repo = db.collection(this.exerciseLogCollectionName)
        });
    }

    public GetAll(req, res): void {
        this.SetHeaders(res);
        this.ConnectToDb()
            .then(() => this.repo.find({}).sort({TimeStamp: -1}).toArray())
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
        let id = req.params['Id'];
        this.ConnectToDb()
            .then(() => this.repo.findOne({ '_id': new ObjectID(id) }))
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
            .then(() => this.repo.insertOne(new ExerciseLog()))
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
        let obj = req.body as ExerciseLog;
        if (!this.modelValidator.CheckPutData(obj)) {
            this.SendWrongDataError(res);
            return;
        }       

        this.SetHeaders(res);
        let id = req.params['id'];

        this.ConnectToDb()
            .then(() => this.repo.findOneAndReplace({ '_id': new ObjectID(id) }, obj))
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

        this.ConnectToDb()
            .then(() => this.repo.findOneAndUpdate({ '_id': new ObjectID(id) }, {$set: obj}, { returnOriginal: false }))
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
            .then(() => this.repo.findOneAndDelete({ '_id': new ObjectID(id) }))
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

    private SendDataBaseError(res) {
        res.status(500);
        res.send(JSON.stringify({ err: 'Database error' }));
    }
}

function CreateController(): ExerciseLogController {
    let conf = CurrentConfig();
    return new ExerciseLogController(conf.DBConnectionString, conf.ExerciseLogCollection, new ExerciseLogValidator());
}
let ExerciseLogControllerRoutes = router;

// Root routes
ExerciseLogControllerRoutes.get('/', (req, res) => {
    CreateController().GetAll(req, res);
});
ExerciseLogControllerRoutes.get('/:id', (req, res) => {
    CreateController().Get(req, res);
});
ExerciseLogControllerRoutes.post('/', (req, res) => {
    CreateController().Post(req, res);
});
ExerciseLogControllerRoutes.put('/:id', (req, res) => {
    CreateController().Put(req, res);
});
ExerciseLogControllerRoutes.patch('/:id', (req, res) => {
    CreateController().Patch(req, res);
});
ExerciseLogControllerRoutes.delete('/:id', (req, res) => {
    CreateController().Delete(req, res);
});

export { ExerciseLogControllerRoutes };