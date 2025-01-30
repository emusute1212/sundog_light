"use client";
import {useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";

export default function Host() {
    const [socket, setSocket] = useState<Socket | null>(null)
    useEffect(()=>{
        const webSocketConnect = async() => {
            await fetch('http://localhost:3000/api/sockets', { method: 'POST' });
            setSocket(io({ autoConnect: true }));
            socket?.connect();
            socket?.on('connect', () => {
                console.log('Connected to the server');
            });
            socket?.on('disconnect', () => {
                console.log('Disconnected from the server');
            });
        }
        webSocketConnect().then()
    },[])
    return (
        <input type="color" onChange={
            e => {
                socket?.emit('selected_color', e.target.value)
                console.log(e.target.value)
            }
        } />
    );
}
