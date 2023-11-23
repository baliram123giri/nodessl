const express = require("express");
const app = express();
require('dotenv').config();

const port = process.env.PORT;
const cookieParser = require('cookie-parser');

const cors = require('cors');

app.use(cookieParser())
app.use(express.json())
console.log(process.env.NODE_ENV)
app.use(cors({ credentials: true, origin:"http://localhost:3000" }));

app.use("/api/v1/", require("./Routes/user.route"));

app.use((_, res) => res.status(404).json({ "message": "URL not found" }))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
