import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'booking must have a tour'],
    ref: 'Tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'booking must have a user'],
    ref: 'User',
  },
  price: {
    type: Number,
    required: [true, 'booking must have a price'],
  },
  createdAt: { type: Date, default: Date.now() },
  paid: { type: Boolean, default: true },
});
bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name' }).populate('user');
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
