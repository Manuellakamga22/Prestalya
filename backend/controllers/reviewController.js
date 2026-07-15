const reviewService = require("../services/reviewService");

const getMine = async (req, res, next) => {
  try {
    const reviews = await reviewService.getMine(req.user.id);
    res.json(reviews);
  } catch (err) { next(err); }
};

const leave = async (req, res, next) => {
  try {
    const review = await reviewService.leave(req.user.id, req.body);
    res.status(201).json(review);
  } catch (err) { next(err); }
};

const getByProvider = async (req, res, next) => {
  try {
    const reviews = await reviewService.getByProvider(req.params.id);
    res.json(reviews);
  } catch (err) { next(err); }
};

module.exports = { getMine, leave, getByProvider };
