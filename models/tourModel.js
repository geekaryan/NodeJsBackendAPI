const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour must name must have less or equal than 40 characters..',
      ],
      minlength: [10, ' A tour must have at least 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain characters.. ',
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must havee group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be above 1.0'],
      max: [5, 'A rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          //this only points to the current doc on New Document creation...
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below to regulat price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    //imgaes are saved as the array of the type string..
    images: [String],
    //type: Date specifying the current date of creating..
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //used to hide fields from the backend to vaou
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, //to JSON virtuals true..
    toObject: { virtuals: true }, //to object virtuals are ture..
  }
);

//virtual Properties..
// tourSchema.virtual('durationWeeks').get(function () {
//   return this.duration / 7;
// });

//schemaName then .vritual("virtualPropertyname").get() //=> .get is used here
//because we are getting something to perform in our virtual property..

//we are gonna use normal regular function because we have to access this keyword..
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Document middlewaere: runs before the .save() command and .create()..
//goona install slugify use to create string
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });

// //post middlerware of document middleware..
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE..
//===> secret tour..
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.prependOnceListener(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds.`);

  console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE...
//removing which have secret tour equal to truee..
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $mathc: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//Middleware in mongoose contain pre and post methods..
// 4 types of middleware in mongoose..
//Document middleware..

//==> validate is a custom way to validate things..
