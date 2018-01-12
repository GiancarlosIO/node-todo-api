const express = require('express');

// middlewares
const AuthenticationMiddleware = require('../middlewares/auth/AuthenticateMiddleware');
const GetTodoMiddleware = require('../middlewares/todo/GetTodoMiddleware');

const TodoRouter = (User, Todo) => {
  const router = express.Router();

  // middleware to get the current user
  router.use('/', AuthenticationMiddleware(User));
  // middleware to find the todo
  router.use('/:todoId', GetTodoMiddleware(Todo));

  router
    .post('/', (req, res) => {
      const { user, body: { text } } = req;

      const todo = new Todo({
        text: text,
        _creator: user._id,
      });

      todo.save().then((todo) => {
        res.status(201).json(todo);
      }, (e) => {
        res.status(400).send(e);
      });
    })
    .get('/', (req, res) => {
      Todo.find({ _creator: req.user._id }).then((todos) => {
        res.json({
          todos,
        });
      }).catch(err => res.status(400).send(err));
    })
    .get('/:todoId', (req, res) => {
      const { todo } = req;

      res.json({ todo });
    })
    .delete('/:todoId', (req, res) => {
      const { todoId } = req;

      Todo.findOneAndRemove(todoId).then((todo) => {
        res.json({ message: 'deleted successfully', todo });
      }).catch(err => res.status(400).send(err));
    })
    .patch('/:todoId', (req, res) => {
      const { todoId, todo, body } = req;

      if (body._id) delete body._id;

      if (body.completed) {
        body.completedAt = new Date().getTime();
      } else {
        body.completed = false;
        body.completedAt = null;
      }

      for (p in body) {
        todo[p] = body[p];
      }

      todo.save().then((todo) => {
        res.json({ todo });
      }).catch(err => res.status(400).send(err));
    });

  return router;
}

module.exports = TodoRouter;
