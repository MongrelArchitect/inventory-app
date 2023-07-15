const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategorySchema = new Schema({
  animalCount: { type: Number, default: 0 },
  description: String,
  name: { minLength: 2, required: true, type: String },
});

CategorySchema.virtual('url').get(function getCategoryURL() {
  return `/categories/${this._id}`;
});

CategorySchema.statics.updateAnimalCount = async function updateCount() {
  const categoryCount = await this.aggregate([
    {
      $lookup: {
        from: 'animals',
        localField: '_id',
        foreignField: 'category',
        as: 'animals',
      },
    },
    {
      $set: {
        animalCount: { $size: '$animals' },
      },
    },
  ]);

  // Update the animalCount field in each Category document
  categoryCount.forEach(async (category) => {
    await this.updateOne(
      { _id: category._id },
      { animalCount: category.animalCount },
    );
  });
};

module.exports = mongoose.model('Category', CategorySchema);
