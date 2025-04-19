import mongoose from 'mongoose';
import Tour from './tourModel.js';

const reviewschema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'review cant be empty'] },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour.'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must has an Author.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewschema.index({ tour: 1, user: 1 }, { unique: true });

reviewschema.statics.calStats = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numberRating: { $sum: 1 },
        averageRatings: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].averageRatings,
      ratingsQuantity: stats[0].numberRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewschema.post('save', function () {
  this.constructor.calStats(this.tour);
});

reviewschema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.model.findOne(this.getQuery());
  next();
});

reviewschema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calStats(this.review.tour);
});

reviewschema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name' })
  this.populate({ path: 'user', select: 'name photo' }).select('-__v');
  next();
});

const reviewModel = mongoose.model('Review', reviewschema);
export default reviewModel;
