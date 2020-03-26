var express = require("express");
var app = express();
var path = require("path");

app.use(express.static(path.join(__dirname, "src/public")))
app.use(express.static(path.join(__dirname, "asset")))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src/views/displayCamera.html"));
})

app.listen(process.env.PORT || 9000, () => console.log(`Server is listening on ${process.env.PORT} . . .`))