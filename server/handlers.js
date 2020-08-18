"use strict";
const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  let start = 0,
    end;

  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("ticket_booker");

    const r = await db.collection("seats").find().toArray();
    r.length > 100 ? (end = 100) : (end = r.length);
    r
      ? res.status(200).json({ status: 200, data: r.slice(start, end) })
      : res.status(404).json({ status: 404, message: "Data not found." });

    client.close();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getSeats };
