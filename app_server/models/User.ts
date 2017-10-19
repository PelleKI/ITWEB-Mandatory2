import { ObjectID } from "mongodb";

export class User {
    _id: ObjectID;
    Email: string;
    Name: string;
    HashedPassword: string;
    Salt: string;

    constructor(id: ObjectID = undefined) {
        this._id = id;
    }
    static CreateNewUser(email: string, name: string): User {
        let user = new User();
        user.Email = email;
        user.Name = name;
        return user;
    }
}