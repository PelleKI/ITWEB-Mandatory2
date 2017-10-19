import { APIControllerBase } from './APIControllerBase';
import { MongoClient, Db, Collection, Cursor, ObjectID } from 'mongodb';
import { CurrentConfig } from '../ConfigLoader';
import { User } from '../models/User';
import { JWT } from '../jwt/Jwt'
import { HashPassword } from '../services/Authentication';
import { randomBytes } from 'crypto';


var express = require('express');
var router = express.Router();

export class UserController extends APIControllerBase {
    private userRepo: Collection<User>;

    public constructor(private dbUrl: string, private userCollectionName: string) {
        super();
    }

    public RegisterUser(req, res) {
        this.SetHeaders(res);        
        let user = req.body as {userName, email, password};
        
        console.log(user);
        
        // Thanks javascript
        if (user.userName === null || user.userName === undefined ||
            user.password === null || user.password === undefined ||
            user.email === null || user.email === undefined) {
            this.SendWrongDataError(res);
        }

        let newUser = new User();

        this.ConnectToDb().then(() => this.userRepo.findOne({ $or: [{ Name: user.userName }, { Email: user.email }] }))
            .then((data) => {
                if (data != null) {
                    return;
                }
                else {
                    let newUser = User.CreateNewUser(user.email, user.userName);
                    newUser.Salt = randomBytes(24).toString('hex');
                    newUser.HashedPassword = HashPassword(user.password, newUser.Salt);
                    return this.userRepo.insertOne(newUser);
                }
            }).then((result) => {
                if(result === undefined) {
                    this.SendUsernameOrEmailTakenError(res);
                }
                else if(result.result.ok == 1) {
                    res.status(200);
                    res.send();
                }
                else {
                    this.SendDataBaseError(res);
                }
            });
    }

    public ConnectToDb(): Promise<void> {
        return MongoClient.connect(this.dbUrl).then((db) => {
            this.userRepo = db.collection(this.userCollectionName);
        });
    }

    private SendDataBaseError(res) {
        res.status(500);
        res.send(JSON.stringify({ err: 'Database error' }));
    }

    private SendUsernameOrEmailTakenError(res) {
        res.status(400);
        res.send(JSON.stringify({ err: 'Username or Email already taken' }));
    }
}

function CreateController(): UserController {
    let conf = CurrentConfig();
    return new UserController(conf.DBConnectionString, conf.UserCollection);
}
let UserControllerRoutes = router;

UserControllerRoutes.post('/register', (req, res) => {
    CreateController().RegisterUser(req, res);
});

export { UserControllerRoutes };