import * as fs from 'fs';

export interface ConfigSettings {
    DBConnectionString: string;
    WorkoutProgramsCollection: string;
    ExerciseLogCollection: string;
}

const defaultConf: ConfigSettings = {
    DBConnectionString: "hurhdurh",
    WorkoutProgramsCollection: "WorkoutPrograms",
    ExerciseLogCollection: "ExerciseLogs"
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
                    return WriteConfFile(path, defaultConf)
                        .then(err => {
                            if (err) {
                                throw err;
                            }
                            else {
                                console.log("File doesn't exist, creating default");
                                curConf = defaultConf;
                                let connectionString = process.env.CONNECTION_STRING != undefined ? process.env.CONNECTION_STRING : curConf.DBConnectionString;
                                curConf.DBConnectionString = connectionString;
                                return CurrentConfig();
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
                }
                curConf = conf;
                WriteConfFile(path, curConf);
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