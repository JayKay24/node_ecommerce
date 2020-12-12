require("dotenv").config();

const path = require("path");

const express = require("express");
const { static } = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const validFiles = ["image/png", "image/jpg", "image/jpeg"];

  if (validFiles.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const MONGO_URI = "mongodb://localhost:27017/RestAPI";

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use("/images", static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const msgObj = { message };
  if ("data" in err) {
    msgObj = { ...msgObj, data };
  }
  res.status(status).json({ ...msgObj });
});

mongoose
  .connect(MONGO_URI, { useUnifiedTopology: true })
  .then((result) => {
    const server = app.listen(8080);
    const io = require("socket.io")(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
