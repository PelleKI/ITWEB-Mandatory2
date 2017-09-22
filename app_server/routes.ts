let express = require('express');
let router = express.Router();

import { WorkoutControllerRoutes } from './controllers/WorkoutProgramController';
import * as cors from 'cors';

/* Example web api controller*/
router.use('/api/workoutprogram', cors(), WorkoutControllerRoutes);

export = router;
