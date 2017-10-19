import { APIControllerBase } from './APIControllerBase';
import { MongoClient, Db, Collection, Cursor, ObjectID } from 'mongodb';
import { CurrentConfig } from '../ConfigLoader';
import { User } from '../models/User';
import { JWT } from '../jwt/Jwt'
import { HashPassword } from '../services/Authentication';

var express = require('express');
var router = express.Router();

export class AuthController extends APIControllerBase {
    private userRepo: Collection<User>;
    private expirationTimeAdd = (1000 * 60 * 60 * 24);

    public constructor(private dbUrl: string, private userCollectionName: string, private authSecret: string) {
        super();
    }

    public GetToken(req, res) {
        this.SetHeaders(res);
        let userName = req.body.Username;
        let email = req.body.Email;
        let password = req.body.Password;

        // Thanks javascript
        if(userName === null || userName === undefined || password === null || password === undefined) {
            this.SendWrongCredentialsError(res);
        }

        this.ConnectToDb()
            .then(() => this.userRepo.findOne({ 'Name': userName }))
            .then((data) => {
                if(data != null) {
                    let hashedPassword = HashPassword(password, data.Salt);

                    // Password incorrect
                    if(hashedPassword != data.HashedPassword)
                    {
                        this.SendWrongCredentialsError(res);
                        return;
                    }

                    // Set expiration date somewhere in the future
                    let expirationDate = Date.now() + this.expirationTimeAdd;

                    // Construct claims
                    let claims = {
                        userID: data._id,                // What we're gonna use to indentify the user
                        exp: expirationDate / 1000,      // Expiration date, seconds since 1970, 1, 1, 0:00:00:000
                        iat: Date.now(),                 // Issued at
                    };

                    // Create the token
                    let token = JWT.CreateJWT(claims, CurrentConfig().AuthSecret);

                    // Send it
                    res.status(200);
                    res.send(JSON.stringify({Token: token.ToString()}));   
                }
                else {
                    this.SendWrongCredentialsError(res);
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

    private SendWrongCredentialsError(res){
        res.status(401);
        res.send(JSON.stringify({ err: 'Wrong credentials' }));
    }
}

function CreateController(): AuthController {
    let conf = CurrentConfig();
    return new AuthController(conf.DBConnectionString, conf.UserCollection, conf.AuthSecret);
}
let AuthControllerRoutes = router;

AuthControllerRoutes.post('/token', (req, res) => {
    CreateController().GetToken(req, res);
});

export { AuthControllerRoutes };