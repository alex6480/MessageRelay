"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var Crypto = require("crypto");
console.log("Starting server on localhost:8000");
var server = new WebSocket.Server({
    port: 8000
});
var sockets = {};
server.on("connection", function (socket) {
    var id = Crypto.randomBytes(16).toString("hex");
    console.log(id + " - Opened");
    sockets[id] = socket;
    socket.onclose = function (e) { return socketClosed(id, e); };
    socket.onmessage = function (e) { return messageReceived(id, e); };
    socket.send(JSON.stringify({
        type: "clientId",
        value: id,
    }));
});
function socketClosed(id, e) {
    console.log(id + " - Closed");
    delete sockets[id];
}
function messageReceived(id, e) {
    var packet = JSON.parse(e.data.toString());
    broadcast(packet);
}
function broadcast(packet) {
    // Broadcast the packet to all connected client
    Object.keys(sockets).forEach(function (id) { return sockets[id].send(JSON.stringify(packet)); });
}
