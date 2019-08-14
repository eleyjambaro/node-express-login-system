const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const userSchema = new Schema({
  name: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    unique: true
  },
  googleID: {
    type: String,
    default: ''
  },
  facebookID: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  signupDate: {
    type: Date,
    default: Date.now,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);