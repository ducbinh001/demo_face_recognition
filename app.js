var express = require("express");
var app = express();
var path = require("path");

app.use(express.static(path.join(__dirname, "src/public")))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src/views/displayCamera.html"));
})

app.listen(process.env.PORT, () => console.log(`Server is listening on ${process.env.PORT} . . .`))