const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: { type: String, required: true },
  question: { type: String, required: true },
  answers: { type: [String], required: true }, // Array of strings
  correct: { type: String, required: true }     // Exact match with one of the answers
});

module.exports = mongoose.model('Question', questionSchema);
