const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
let playerContainer = document.getElementById('player-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')


let playerList = playerContainer;
let emptyContainer = playerContainer;

//Game variables
let state = {}
let alreadyBuzzed = false

//SOUNDS
var sfx_buzzer = new Audio('/sfx/windows_error.mp3');

if (messageForm != null) {
  const name = prompt('What is your name?') || "No name"
  appendMessage('You joined')
  socket.emit('new-user', roomName, name)

  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    if(alreadyBuzzed){return}
    socket.emit('buzz', roomName);
    sfx_buzzer.play();
    alreadyBuzzed = true
    //const message = messageInput.value
    //appendMessage(`You: ${message}`)
    //messageInput.value = ''
  })

  messageForm.addEventListener('reset', e => {
    e.preventDefault()
    console.log('reset pressed');
    socket.emit('reset', roomName);
    alreadyBuzzed = false;
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
  //console.log(state)
  drawPlayers()   
})

function drawPlayers(){
  for(const n of playerContainer.childNodes) {
    playerContainer.removeChild(n)
  }

  first_buzz = 9999999999999999999;
  for(const [id, person] of Object.entries(state.players)) {
    if (person.time - 1 < first_buzz){
      first_buzz = person.time;
      console.log(person);
    }  
  }

  for(const [id, person] of Object.entries(state.players)) {
    const playerElement = document.createElement('div');
    
    const playerName = document.createElement('div');
    playerName.setAttribute('id','player-name');
    playerName.innerText = JSON.stringify(person.name);

    const playerBuzz = document.createElement('div');
    playerBuzz.setAttribute('id','player-buzz');
    playerBuzz.innerText = JSON.stringify(person.buzzed);
    
    const playerTime = document.createElement('div');
    playerTime.setAttribute('id','player-buzz');
    if(person.buzzed){
      playerTime.innerText = (person.time-first_buzz)/1000;
      //console.log(person.time);
    }else{
      playerTime.innerText = 'f ';
    }
    playerElement.append(playerName, playerBuzz, playerTime);


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

socket.on('reset', () => {
  console.log('back back');
  alreadyBuzzed = false;
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}