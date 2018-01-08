const express = require('express');

// middlewares
const AuthenticationMiddleware = require('../middlewares/auth/AuthenticateMiddleware');

const TodoRouter = (User, Todo) => {
  const router = express.Router();

  // router.use('/', AuthenticationMiddleware(User));

  router
    .post('/', (req, res) => {
      const { user, body: { text } } = req;

      const todo = new Todo({
        text: text,
        // _creator: user._id,
      });

      todo.save().then((todo) => {
        res.status(201).json(todo);
      }, (e) => {
        res.status(400).send(e);
      });
    })
    .get('/', (req, res) => {
      Todo.find().then((todos) => {
        res.json({
          todos,
        });
      }).catch(err => res.status(400).send(err));
    });

  return router;
}

module.exports = TodoRouter;
