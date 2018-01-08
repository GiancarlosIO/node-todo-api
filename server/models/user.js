const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    minLenght: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not valid`,
    },
  },
  password: {
    type: String,
    required: true,
    minLenght: 6,
  },
  tokens: {
    type: [{
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    }],
  }
});

// instance methods

UserSchema.methods.toJSON = function() {
  const user = this;
  const { _id, email } = user.toObject();

  return {
    _id,
    email,
  };
};

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

  user.tokens.push({
    access,
    token,
  });

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function(token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token },
    },
  });
}

// models methods
UserSchema.statics.findByCredentials = function(email, password) {
  const user = this;

  return User.findOne({ email }).then((user) => {
    if (!user) return Promise.reject({ error: 'user does not exists' });

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject({ error: 'invalid email or password' });
        }
      });
    });
  });
}

UserSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
}

// mongoose middleware
UserSchema.pre('save', function(next) {
  const user = this;

  // only hash the password if it has been modified
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User,
};
