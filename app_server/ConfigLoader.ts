import * as fs from 'fs';
import { randomBytes } from 'crypto';

export interface ConfigSettings {
    DBConnectionString: string;
    WorkoutProgramsCollection: string;
    ExerciseLogCollection: string;
    UserCollection: string;
    AuthSecret: string;
}

const defaultConf: ConfigSettings = {
    DBConnectionString: "INVALID CONNECTIONSTRING",
    WorkoutProgramsCollection: "WorkoutPrograms",
    ExerciseLogCollection: "ExerciseLogs",
    UserCollection: "Users",
    AuthSecret: randomBytes(20).toString('hex') // Not good, make sure you have a secret set
};

let curConf: ConfigSettings = null;

export function CurrentConfig(): ConfigSettings {
    return curConf;
}

export function LoadConfig(): Promise<ConfigSettings> {
    return new Promise((resolve, reject) => {
        let path = "./conf.json";

        fs.readFile(path, (err, data) => {
            if (err) {
                if (err.code == "ENOENT") {
                    console.log("File doesn't exist, creating default");
                    curConf = defaultConf;
                    let connectionString = process.env.CONNECTION_STRING != undefined ? process.env.CONNECTION_STRING : curConf.DBConnectionString;
                    curConf.DBConnectionString = connectionString;
                    let authSecret = process.env.AUTHSECRET != undefined ? process.env.AUTHSECRET : curConf.AuthSecret;
                    curConf.AuthSecret = authSecret;
                    return WriteConfFile(path, curConf)
                        .then(err => {
                            if (err) {
                                throw err;
                            }
                            else {
                                resolve(CurrentConfig());
                            }
                        });
                }
                else {
                    throw err;
                }
            }
            else {
                console.log("Config file exists, use it");
                let conf = JSON.parse(data.toString()) as ConfigSettings;
                if (!ConfContainsAllFields(conf)) {
                    console.log("Current config missing fields, adding");
                    FillConfWithDefaultValues(conf);
                    WriteConfFile(path, conf);
                }
                curConf = conf;
                return resolve(CurrentConfig());
            }
        });
    });
}

function ConfContainsAllFields(conf: ConfigSettings) {
    for (let field in defaultConf) {
        if (conf[field] == undefined) {
            return false;
        }
    }
    return true;
}

function FillConfWithDefaultValues(conf: ConfigSettings) {
    for (let field in defaultConf) {
        if (conf[field] == undefined) {
            conf[field] = defaultConf[field];
        }
    }
}

function WriteConfFile(path: string, conf: ConfigSettings): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, JSON.stringify(conf, null, 4), (err) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(null);
            }
        });
    });
}