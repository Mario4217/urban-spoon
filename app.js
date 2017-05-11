const PORT = 4217;

var express = require('express');
app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Client = require('./code/client.js');
var Lobby = require('./code/lobby.js');

server.listen(PORT,function(){
  console.log("Server runs on Port "+PORT)
});

app.use(express.static('game'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

clients = [];
lobbies = {};

io.on('connection', function (socket) {
  //player connect
  var client = new Client(socket); //create the client instance for the player
  clients.push(client);

  console.log("Connection opened!");

  socket.on('login',function(data){
    if(typeof data !== typeof {}){
      return false;
    }
    if(client.lobby == null && data.name && data.lobby){  //if player is not in a lobby and has the player give a name / lobby
      client.name = data.name;
      //console.log("Player: "+data.name+" connected into lobby: "+data.lobby);
      if(lobbies[data.lobby] == undefined){ 
        lobbies[data.lobby] = new Lobby(client,data.lobby); //if the lobby does not exists create a new one and set the player as the host
      }else{
        lobbies[data.lobby].addClient(client); //else add the player to the existing lobby
      }
    }
  });
  socket.on('leave',function(){
    client.leave();
    socket.emit('leave'); //when the player leaves say him he left
  });
  socket.on('disconnect',function(){
    client.disconnect(); //removes the player from the current lobby and other stuff
  });
  socket.on('ready',function(data){
    if (typeof data !== typeof true){
      return false;
    }
    client.setReady(data);
  });
  socket.on('lobbySetting',function(data){
    if(client.lobby != null){
      if(client.lobby.host == client){
        client.lobby.changeSettings(data);
      }
    }
  });
  socket.on('changeTeam',function(data){
    if (typeof data !== typeof 1){
      return false;
    }
    if (client.lobby != null){
      client.lobby.changeTeam(client,data);
    }
  });
});