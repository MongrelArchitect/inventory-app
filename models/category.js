const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategorySchema = new Schema({
  description: String,
  name: { required: true, type: String },
});

CategorySchema.virtual('url').get(function () {
  return `/categories/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);
