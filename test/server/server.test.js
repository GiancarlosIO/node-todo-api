const mongoose = require('mongoose');
const expect = require('expect');
const request = require('supertest');

const app = require('../../server/server');

const { Todo } = require('../../server/models/todo');

// clean all models and schemas
mongoose.models = {};
mongoose.modelSchemas = {};

const todos = [
  {
    text: 'first tests todo',
  },
  {
    text: 'second tests todo',
  }
]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done());
});

describe('POST /api/todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test Todo text';

    request(app)
      .post('/api/todos')
      .send({ text })
      .expect(201)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create a todo with invalid text', (done) => {
    const text = '';

    request(app)
      .post('/api/todos')
      .send({ text })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});


describe('GET /api/todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/api/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});