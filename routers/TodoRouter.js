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
    .post('/', async (req, res) => {
      const { user, body: { text } } = req;

      const todo = new Todo({
        text: text,
        _creator: user._id,
      });

      try {
        await todo.save();
        res.status(201).json(todo);
      } catch (e) {
        res.status(400).send(e);
      }
    })
    .get('/', async (req, res) => {
      try {
        const todos = await Todo.find({ _creator: req.user._id })

        res.json({ todos });
      } catch (e) {
        res.status(400).send(e)
      }
    })
    .get('/:todoId', (req, res) => {
      const { todo } = req;

      res.json({ todo });
    })
    .delete('/:todoId', async (req, res) => {
      const { todoId } = req;

      try {
        const todo = await Todo.findOneAndRemove(todoId);

        res.json({ message: 'deleted successfully', todo });
      } catch (e) {
        res.status(400).send(err)
      }

    })
    .patch('/:todoId', async (req, res) => {
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

      try {
        const todoSaved = await todo.save();

        res.json({ todo: todoSaved });
      } catch (e) {
        res.status(400).send(e)
      }
    });

  return router;
}

module.exports = TodoRouter;
