import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as routes from './routes';

import { ConfigSettings, LoadConfig} from './ConfigLoader';

let app = express();

/*Clears database and adds initial data*/
LoadConfig().then((val) => {
  console.log("Current environment: " + process.env.NODE_ENV);
}).then(() => {
  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', routes);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    let err = new Error('Not Found');
    (<any>err).status = 404;
    next(err);
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log(err.message);

    // render the error page
    res.status(err.status || 500);
    res.send("error");
    //res.render('error');
  });
  console.log("App started on port: " + app.get('port'));
});
module.exports = app;
