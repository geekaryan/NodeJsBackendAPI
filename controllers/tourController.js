const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    //creating an object which contains all the query..
    const queryObj = { ...req.query };
    //removing some the query strings which is used for some other functionality...
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    //looping to deleted the excluded from the queryObj,,
    excludeFields.forEach((el) => delete queryObj[el]);

    // console.log(queryObj);

    //some advanced filterinngg. bascially lessthan and greater than....

    //for this we have to first convert object into a string..
    let queryStr = JSON.stringify(queryObj);
    //here basically what we are doing is that we are replace less than greater sings
    //by converting them into string with adding a $ because that is searchable..
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    //making a query field to find...
    const query = Tour.find(JSON.parse(queryStr));

    //adding pagination...
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;

    //so here basically what we are doing is seeing that skip
    //contain the page - 1 * limit value in which limit is by default set to 10..
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      //used to counting the number of documents in the page....
      const numTours = await Tour.countDocuments();
      //if the skip is more than we must throw an error...
      if (skip >= numTours) throw new Error('This page is not avaliable!!');
    }
    const tours = await query;
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  // console.log(req.body);
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'Success',
      message: 'data added successfully',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
