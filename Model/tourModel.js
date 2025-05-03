import mongoose from 'mongoose';
import slugify from 'slugify';

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      select: true,
      maxlength: [40, 'A tour name must have less or equal than 40 character'],
      minlength: [10, 'A tour name must have more or equal than 10 character'],
    },
    price: { type: Number, required: [true, 'A tour must have a price'] },

    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `discount ({VALUE})must be lower than price.`,
      },
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a  duration'],
    },
    slug: String,
    summary: {
      type: String,
      required: [true, 'A tour must have a  description'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be either (easy, medium , difficult)',
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'ratingsAverage must be above 1'],
      max: [5, 'ratingsAverage must be below 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    images: [String],
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    //GeoJson is defined as type and coordinates like below
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //inorder to create embedded documents (denormalize) we make the obj as array
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Date,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

TourSchema.index({ price: 1, ratingsAverage: -1 });
TourSchema.index({ slug: 1 });
TourSchema.index({ startLocation: '2dsphere' });
TourSchema.virtual('Duration in weeks').get(function () {
  return this.duration / 7;
});
//virtual populate
TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// document middleware works before .save() and .create()
TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

//query middleware
TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.date = Date.now();
  next();
});
TourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

//Tour model
const Tour = mongoose.model('Tour', TourSchema);
export default Tour;
