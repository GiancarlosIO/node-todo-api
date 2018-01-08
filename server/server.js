const express = require('express');
const bodyParser = require('body-parser');

const UserRouter = require('../routers/UserRouter');
const TodoRouter = require('../routers/TodoRouter');

const { mongoose } = require('./db/mongoose');

const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const PORT = 3000;

const app = express();


app.use(bodyParser.json());

// routes
app.use('/api/users', UserRouter(User));
app.use('/api/todos', TodoRouter(User, Todo));

if (!module.parent) {
  app.listen(PORT, () => {
    console.log(`server is running in port: ${PORT}`);
  });
}


module.exports = app;