"use strict";
const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// let state;
// if (!state) {
//     state = {
//       bookedSeats: randomlyBookSeats(30),
//     };
//   }

let lastBookingAttemptSucceeded = false;

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

const randomlyBookSeats = (num) => {
  const bookedSeats = {};

  while (num > 0) {
    const row = Math.floor(Math.random() * NUM_OF_ROWS);
    const seat = Math.floor(Math.random() * SEATS_PER_ROW);

    const seatId = `${getRowName(row)}-${seat + 1}`;

    bookedSeats[seatId] = true;

    num--;
  }

  return bookedSeats;
};

const getSeats = async (req, res) => {
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("ticket_booker");

    const r = await db.collection("seats").find().toArray();
    r
      ? res.status(200).json({
          seats: r,
          bookedSeats: {},
          numOfRows: 8,
          seatsPerRow: 12,
        })
      : res.status(404).json({ status: 404, message: "Data not found." });

    client.close();
  } catch (error) {
    console.log(error);
  }
};

const bookSeat = async (req, res) => {
  const { seatId, creditCard, expiration, fullName, email } = req.body;
  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (!fullName || !email) {
    return res.status(400).json({
      status: 400,
      message: "Please provide your name and email!",
    });
  }

  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("ticket_booker");
    console.log(seatId);
    await db
      .collection("seats")
      .findOne({ _id: seatId }, async (err, result) => {
        if (result) {
          if (result.isBooked === true) {
            return res
              .status(400)
              .json({ message: "This seat has already been booked!" });
          } else {
            const bookedSeat = await db
              .collection("seats")
              .updateOne(
                { _id: seatId },
                {
                  $set: { isBooked: true, passenger: fullName, contact: email },
                }
              );
            assert.equal(1, bookedSeat.matchedCount);
            assert.equal(1, bookedSeat.modifiedCount);

            return res.status(200).json({
              status: 200,
              success: true,
            });
          }
        } else return res.status(404).json({ message: "seat not found" });
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getSeats, bookSeat };
