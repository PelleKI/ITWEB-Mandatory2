let express = require('express');
let router = express.Router();

import { WorkoutControllerRoutes } from './controllers/WorkoutProgramController';
import { ExerciseLogControllerRoutes } from './controllers/ExerciseLogController';
import { UserControllerRoutes } from './controllers/UserController';
import { AuthControllerRoutes } from './controllers/AuthTokenController';
import * as cors from 'cors';

/* Example web api controller*/
router.use('/api/workoutprogram', cors(), WorkoutControllerRoutes);
router.use('/api/exerciselog', cors(), ExerciseLogControllerRoutes);
router.use('/api/auth', cors(), UserControllerRoutes);
router.use('/api/auth', cors(), AuthControllerRoutes);

export = router;
