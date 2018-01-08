const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = process.env.NODE_ENV === 'TEST' ? 'TodoApp_test' : 'TodoApp';

mongoose.connect(`${MONGO_URL}/${DB_NAME}`);

module.exports = {
  mongoose,
};
