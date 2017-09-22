let express = require('express');
let router = express.Router();

import { WorkoutControllerRoutes } from './controllers/WorkoutProgramController';
import { ExerciseLogControllerRoutes } from './controllers/ExerciseLogController';
import * as cors from 'cors';

/* Example web api controller*/
router.use('/api/workoutprogram', cors(), WorkoutControllerRoutes);
router.use('/api/exerciselog', cors(), ExerciseLogControllerRoutes);

export = router;
