const bookingService = require("../services/bookingService");
const providerRepo = require("../repositories/providerRepository");

const create = async (req, res, next) => {
  try {
    const booking = await bookingService.create(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (err) { next(err); }
};

const myBookings = async (req, res, next) => {
  try {
    let provider_profile_id = null;
    if (req.user.role === "prestataire") {
      const p = await providerRepo.findByUserId(req.user.id);
      provider_profile_id = p ? p.id : null;
    }
    const bookings = await bookingService.myBookings(req.user.id, req.user.role, provider_profile_id);
    res.json(bookings);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateStatus(
      req.params.id, req.user.id, req.user.role, req.body.status
    );
    res.json(booking);
  } catch (err) { next(err); }
};

const getOpenBookings = async (req, res, next) => {
  try {
    const p = await providerRepo.findByUserId(req.user.id);
    if (!p) return res.json([]);
    const bookings = await bookingService.getOpenBookings(p.service);
    res.json(bookings);
  } catch (err) { next(err); }
};

const acceptOpenBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.acceptOpenBooking(req.params.id, req.user.id);
    res.json(booking);
  } catch (err) { next(err); }
};

const acceptBooking = async (req, res, next) => {
  try {
    res.json(await bookingService.acceptBooking(req.params.id, req.user.id));
  } catch (err) { next(err); }
};

const refuseBooking = async (req, res, next) => {
  try {
    res.json(await bookingService.refuseBooking(req.params.id, req.user.id));
  } catch (err) { next(err); }
};

const proposeAlternative = async (req, res, next) => {
  try {
    const { date, slot } = req.body;
    res.json(await bookingService.proposeAlternative(req.params.id, req.user.id, date, slot));
  } catch (err) { next(err); }
};

const respondProposal = async (req, res, next) => {
  try {
    res.json(await bookingService.respondProposal(req.params.id, req.user.id, !!req.body.accept));
  } catch (err) { next(err); }
};

const confirmBooking = async (req, res, next) => {
  try {
    res.json(await bookingService.confirmBooking(req.params.id, req.user.id));
  } catch (err) { next(err); }
};

module.exports = {
  create, myBookings, updateStatus, getOpenBookings, acceptOpenBooking,
  acceptBooking, refuseBooking, proposeAlternative, respondProposal, confirmBooking,
};
