import Msgs from './components/message';
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Input from './components/input';
import Members from './components/online';
import 'bootstrap/dist/css/bootstrap.min.css';

let drone = null

const colors = ['#FF5733', '#33FF57', '#5733FF', '#FF33A1', '#33A1FF', '#A1FF33', '#FF33F3', '#33F3FF'];

const adjectives = ['Red', 'Blue', 'Green', 'Yellow', 'Funny', 'Brave', 'Smart', 'Clever', 'Witty', 'White'];
const nouns = ['Elephant', 'Lion', 'Tiger', 'Giraffe', 'Monkey', 'Kangaroo', 'Penguin', 'Dolphin', 'Ostrich', 'Koala'];

function makeRandomName() {
  const randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
  const randomNounIndex = Math.floor(Math.random() * nouns.length);
  
  const randomAdjective = adjectives[randomAdjectiveIndex];
  const randomNoun = nouns[randomNounIndex];
  
  const randomName = `${randomAdjective} ${randomNoun}`;
  return randomName;
}

function makeRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

//testiranje
const randomName = makeRandomName();
const randomColor = makeRandomColor();

console.log('Name:', randomName);
console.log('Color:', randomColor);
//-----------------------------------------


function App() {

  // eslint-disable-next-line
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState({
    username: makeRandomName(),
    color: makeRandomColor(),
  });


  //scaledrone
const messagesRef = useRef();
messagesRef.current = messages;
const membersRef = useRef();
membersRef.current = members;
const meRef = useRef();
meRef.current = me;

function connectToScaledrone() {
  drone = new window.Scaledrone('mLDESRdHDZ4HA5Kc', {
    data: meRef.current,
  });
  drone.on('open', error => {
    if (error) {
      return console.error(error);
    }
    meRef.current.id = drone.clientId;
    setMe(meRef.current);
  });

  const room = drone.subscribe('observable-room');

  room.on('message', message => {
    const {data, member} = message;
    if (typeof data === 'object' && typeof data.typing === 'boolean') {
      const newMembers = [...membersRef.current];
      const index = newMembers.findIndex(m => m.id === member.id);
      newMembers[index].typing = data.typing;
      setMembers(newMembers);
    } else {
      setMessages([...messagesRef.current, message]);
    }
  });
  room.on('members', members => {
    setMembers(members);
  });
  room.on('member_join', member => {
    setMembers([...membersRef.current, member]);
  });
  room.on('member_leave', ({id}) => {
    const index = membersRef.current.findIndex(m => m.id === id);
    const newMembers = [...membersRef.current];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  });
}

useEffect(() => {
  if (drone === null) {
    connectToScaledrone();
  }
}, []);

function send(message) {
  drone.publish({
    room: 'observable-room',
    message
  });
}

  return (
    <div className="App">
      <header className="App-header"></header>
      <Members members={members} me={me}/>
      <Msgs messages={messages} me={me}/>
      <Input send={send} />
      
    </div>
  );
}

export default App;
