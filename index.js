const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const PORT = process.env.PORT || 8000;
const path = require("path");

// membuat realtime api
const http = require("http");
const socketio = require("socket.io");

const app = express();

// membuat server http
const server = http.createServer(app);

// membuat socketio
const io = socketio(server, {
    transports: ["websocket", "polling"],
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// membuat socketio
io.on("connection", (socket) => {
    console.log("Socket.io Connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

app.use(cors());
app.options("*", cors());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// socket router
const socketRouter = require("./routerSocket")(io);
app.use("/api/monitor_dc", socketRouter);

app.use("/api/", require("./router/index"));

app.use((req, res, next) => {
    res.status(404).json({
        status: 0,
        message: "Not Found",
    });
});


app.use((error, req, res, next) => {
    res.status = (error.status || 500)
    res.json({
        error: error.message
    });
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});