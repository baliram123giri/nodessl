const express = require("express");
const app = express();
require('dotenv').config();

const port = process.env.PORT;
const cookieParser = require('cookie-parser');

const cors = require('cors');

app.use(cookieParser())
app.use(express.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "*");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use("/api/v1/", require("./Routes/user.route"));

app.use((_, res) => res.status(404).json({ "message": "URL not found" }))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
