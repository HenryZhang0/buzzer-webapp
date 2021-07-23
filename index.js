const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = { }

const states = {}

class State {
  constructor(room) {
      this.room = room
      this.players = {}
      this.buzzes = {}

      this.addPlayer = (id, playerName) => {
          this.players[id] = playerName;
      }
      this.buzz = (id, time) => {
          this.buzzes[id] = time;
      }
      this.clearBuzz = () => {
          this.buzzes = {};
      }
  }
   
}


app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)

  const roomName = req.body.room;
  console.log(roomName);

  states[roomName] = new State(roomName);
  sendGameState(roomName);

  // Send message that new room was created
  io.emit('room-created', req.body.room)
}) 
 
app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
  console.log('no room')
  return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

server.listen(3000)

io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    if(rooms[room]==null) {
      rooms[room] = { users: {} }
      states[room] = new State(room); 

    }
    socket.join(room)
    rooms[room].users[socket.id] = name || 'no_name'
    socket.to(room).broadcast.emit('user-connected', name)

    states[room].players[socket.id] = {name:name,buzzed:false,time:null};
    sendGameState(room);
  })
  socket.on('buzz', (room) => {
    //socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    
    console.log('buzzed'+rooms[room].users[socket.id]);

    states[room].players[socket.id].buzzed = true;
    let d = new Date()
    states[room].players[socket.id].time = d.getTime();
    sendGameState(room);
  })
  socket.on('reset', (room) =>{
    for(const [id,dat] of Object.entries(states[room].players)) {
      states[room].players[id].buzzed = false;
    }
    socket.in(room).emit('reset');
    sendGameState(room);
  });
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
      delete states[room].players[socket.id]

      if(Object.keys(rooms[room].users).length==0) {
        delete rooms[room]
        delete states[room]
      }
      console.log(rooms)
      console.log(states)
      sendGameState(room)    
    })
  })
})


function sendGameState(room) {
  io.sockets.in(room).emit("state-change", states[room]);
}

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}