const router = require("express").Router();

const { getSeats, bookSeat } = require("./handlers");

router.get("/api/seat-availability", getSeats);

// return res.json({
//   seats: seats,
//   bookedSeats: state.bookedSeats,
//   numOfRows: 8,
//   seatsPerRow: 12,
// });

router.post("/api/book-seat", bookSeat);

module.exports = router;
