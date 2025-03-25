const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
    validate: [arr => arr.length === 4, 'Must have exactly four answers']
  },
  correct: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return this.answers.includes(value);
      },
      message: 'Correct answer must be one of the four answers'
    }
  },
  category: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Question', questionSchema);
