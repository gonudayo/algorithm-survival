const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// API 라우트 설정 v1
const usersV1 = require("./src/v1/routes/users");
app.use("/api/v1/users", usersV1);

// API 라우트 설정 v2
const usersV2 = require("./src/v2/routes/users");
app.use("/api/v2/users", usersV2);

module.exports = app;
