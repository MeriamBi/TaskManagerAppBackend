import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import { notFoundError, errorHandler } from './middlewares/error-handling.js';
import taskRoutes from './routes/task.js';

const app = express();

const mongo_uri = `mongodb://127.0.0.1:27017`;
const port = 9090;

const dbName = 'task_manager_db';

mongoose.set('debug', true);

// connect to MongoDB
mongoose.connect(`${mongo_uri}/${dbName}`)
    .then(
        () => { console.log("Connected to MongoDB") },
    )
    .catch(
        err => { console.log(err) }
    );

/** MIDDLEWARES **/
app.use(cors());
// log HTTP requests to the console
app.use(morgan('dev'));
// parse the JSON data and make it available in req.body property
app.use(express.json());
// parse URL-encoded form data sent in requests
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static('public/images'));

/** ROUTES **/
app.use('/task', taskRoutes);


/** ERROR HANDLING MIDDLEWARES **/
// catch 404 and forward to error handler
app.use(notFoundError);
// error handler
app.use(errorHandler);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
});