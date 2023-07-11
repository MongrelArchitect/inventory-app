const mongoose = require('mongoose');

const { Schema } = mongoose;

const AnimalSchema = new Schema({
  category: { ref: 'Category', type: Schema.Types.ObjectId },
  commonName: { required: true, type: String },
  description: String,
  numberInStock: { min: 0, required: true, type: Number },
  price: { min: 0, required: true, type: Number },
  speciesName: { required: true, type: String },
});

AnimalSchema.virtual('url').get(() => `/animals/${this._id}`);

module.exports = mongoose.model('Animal', AnimalSchema);
