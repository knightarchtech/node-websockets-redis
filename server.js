const WebSocket = require('ws');
const redis = require("redis")

const server = new WebSocket.Server({
  port: 3000
});

const redisClient = redis.createClient({ host: "localhost", port: 6379 });

(async () => {
    // Connect to redis server
    await redisClient.connect();
})();

let sockets = [];

server.on('connection', function(socket) {
  console.log("connection pushing sockets");
  sockets.push(socket);

  // When you receive a message, send that message to every socket.
  socket.on('message', function(msg) {
    console.log("Message has been sent to the socket");
    sockets.forEach(s => s.send(msg));
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function() {
    sockets = sockets.filter(s => s !== socket);
  });
});

redisClient.subscribe('app:notifications', (message) => {
    console.log("Subscribed message received:" + message);
    sockets.forEach(s => s.send(message));
});  
