const { ObjectId } = require('mongodb');

const GetTodoMiddleware = (Todo) => (req, res, next) => {
  const { user, params: { todoId } } = req;

  if (!ObjectId.isValid(todoId)) {
    return res.status(400).send({ error: 'id is invalid' });
  }

  Todo.findOne({
    _id: todoId,
    _creator: user._id,
  })
    .then((todo) => {
      if (!todo) return res.status(404).json({ error: 'Todo not exists' });

      req.todoId = todoId;
      req.todo = todo;
      next();
    })
    .catch(err => res.status(400).send({ error: 'error to find todo' }));

  // validate id using isValid
}

module.exports = GetTodoMiddleware;