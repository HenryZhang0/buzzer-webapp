const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
let playerContainer = document.getElementById('player-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

state = {}

let playerList = playerContainer;
let emptyContainer = playerContainer;


if (messageForm != null) {
  const name = prompt('What is your name?')
  appendMessage('You joined')
  socket.emit('new-user', roomName, name)

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    socket.emit('buzz', roomName) 
    //const message = messageInput.value
    //appendMessage(`You: ${message}`)
    //messageInput.value = ''
  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('state-change', data => {
  state = data
  drawPlayers()   
})

function drawPlayers(){
  for(const n of playerContainer.childNodes) {
    playerContainer.removeChild(n)
  }

  for(const [id, person] of Object.entries(state.players)) {
    const playerElement = document.createElement('div');
    playerElement.innerText = JSON.stringify(person.name);
    playerContainer.appendChild(playerElement);
    //playerContainer.append(playerElement);
  }
}

socket.on('user-connected', name => {
  drawPlayers()
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  drawPlayers()
  appendMessage(`${name} disconnected`)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}