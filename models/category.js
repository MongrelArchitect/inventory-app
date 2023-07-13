const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategorySchema = new Schema({
  description: String,
  name: { minLength: 2, required: true, type: String },
});

CategorySchema.virtual('url').get(function getCategoryURL() {
  return `/categories/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);
