import * as WebSocket from "ws";
import * as Crypto from "crypto";

console.log("Starting server on localhost:8000");

interface IPacket
{
    type: string;
    senderId: string;
}

const server = new WebSocket.Server({
    port: 8000
});

const sockets: {[id: string]: WebSocket} = {};

server.on("connection", (socket: WebSocket) => {
    const id = Crypto.randomBytes(16).toString("hex");
    console.log(id + " - Opened");
    sockets[id] = socket;

    socket.onclose = (e: WebSocket.CloseEvent) => socketClosed(id, e);
    socket.onmessage = (e: WebSocket.MessageEvent) => messageReceived(id, e);

    socket.send(JSON.stringify({
        type: "clientId",
        value: id,
    }))
});

function socketClosed(id: string, e: WebSocket.CloseEvent) {
    console.log(id + " - Closed");
    delete sockets[id];
}

function messageReceived(id: string, e: WebSocket.MessageEvent) {
    var packet = JSON.parse(e.data.toString()) as IPacket;
    if (packet.type === "syncronize-time-packet") {
        sockets[id].send(JSON.stringify({
            type: "syncronize-time-packet",
            time: (new Date()).getTime(),
        }));
    }
    broadcast(packet);
}

function broadcast(packet: IPacket) {
    // Broadcast the packet to all connected client
    Object.keys(sockets).forEach(id => sockets[id].send(JSON.stringify(packet)));
}