import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import './Chat.css';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import TextContainer from '../TextContainer/TextContainer';


const ENDPOINT = 'https://react-chat-application-ok.herokuapp.com';

let socket;

const Chat = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const {name, room} = queryString.parse(window.location.search);
        setName(name);
        setRoom(room);

        socket = io(ENDPOINT);

        socket.emit('join', {name, room}, callback => {

        });

        return () => {
            socket.io('disconnect');
            socket.off();
        }
    }, [ENDPOINT, window.location.search]);

    useEffect(() => {
        socket.on('message', message => {
          setMessages(msgs => [ ...msgs, message ]);
        });        
    }, []);

    useEffect(() => {
        socket.on("roomData", ({ users }) => {
            setUsers(users);
          });
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message) {
            socket.emit('sendMessage', message, () => {
            setMessage('');
            })
        }
    }

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={ room } />
                <Messages messages={ messages } name={name}/>
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={ users } />
        </div>
    )
}

export default Chat;