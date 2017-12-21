var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;
var net = require('net');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var users = {};
var sockets_map = {};

function subscribeUser(user_id, socket) {

    //check if the socket id already exist, don't allow subscripton two times, especially not on two different users
    if (sockets_map.hasOwnProperty(socket.client.conn.id)) {
        console.log('alrady registered: ' + user_id);
        socket.emit('subscribe', false);
        return;
    }

    var data = {
        user_id: user_id,
        ip: socket.client.conn.remoteAddress,
        socket_id: socket.client.conn.id,
        socket: socket
    }
    socket.client.conn.user_id = user_id;
    sockets_map[data.socket_id] = user_id;

    if (!users.hasOwnProperty(user_id)) {
        users[user_id] = [];
    }

    //check if already registered and unsubscribe.
    unsubscribeUser(socket);

    users[user_id].push(data);
    console.log('user: '+user_id+' subscribed');
    socket.emit('subscribe', true);
    return data;
}

function unsubscribeUser(socket) {
    socket_id = socket.client.conn.id;
    user_id = socket.client.conn.user_id;

    if (sockets_map.hasOwnProperty(socket_id)) {
        delete sockets_map[socket_id];
    }

    if (users.hasOwnProperty(user_id) && socket.client.conn.hasOwnProperty('user_id')) {
        for (var i = 0; i < users[user_id].length; i++) {
            var user = users[user_id][i];
            if (user.socket_id === socket_id) {
                console.log('user: ' + user_id + ' usubscribed');
                return users[user_id].splice(i, 1);
            }
        }
    }

    return null;
}


function push(user_id, message) {
    if (user_id === '*') {
        io.sockets.emit('push', message);
        return;
    }

    if (users.hasOwnProperty(user_id)) {
        for (var i = 0; i < users[user_id].length; i++) {
            io.to(users[user_id][i].socket_id).emit('push', message);
        }
    }
}

io.on('connection', function(socket) {
    //TODO: on socket.handshake you can check the cookies and decide if the user is logged in, and if not reject the connection
    //NOTE: Actually these push messages shouldn't carry any important data, but - this should prevent the loging of too many clients and probable DoS in that case

    socket.on('subscribe', function(user_id) {
        //registers a user, you can check for validity via the passed JWT or via some cookie something if you want
        subscribeUser(user_id, socket);
    });

    socket.on('disconnect', function() {
        unsubscribeUser(socket);
    });
});

http.listen(port, function(){
  console.log('NODE PUSH started on:' + port);
});


//Local socket
net.createServer(function (socket) {
      // Handle incoming messages from clients.
      socket.on('connect', function (data) {
          if (socket.remoteAddress !== '::ffff:127.0.0.1') {
              socket.destroy();
          }
      });

      //TODO: What about AF_UNIX instead of TCP? This should be a local server after all. Although this wontdo good if the PUSH service is relocated
      socket.on('data', function (data) {
          if (socket.remoteAddress === '::ffff:127.0.0.1') {
              var data = JSON.parse(data.toString('utf8'));
              console.log(data.user_id + ': ' + data.message);
              push(data.user_id, data.message);
          }
      });

}).listen(9555);
