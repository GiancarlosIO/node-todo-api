const { ObjectId } = require('mongodb');

const GetTodoMiddleware = (Todo) => (req, res, next) => {
  const { params: { todoId } } = req;

  if (!ObjectId.isValid(todoId)) {
    return res.status(400).send({ error: 'id is invalid' });
  }

  Todo.findById(todoId)
    .then((todo) => {
      if (!todo) return res.status(404).json({ error: 'Todo not exists' });

      res.json({ todo });
    })
    .catch(err => res.status(400).send({ error: 'error to find todo' }));

  // validate id using isValid
}

module.exports = GetTodoMiddleware;