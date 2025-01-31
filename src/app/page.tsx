"use client";
import {useEffect, useState} from "react";
import {io} from "socket.io-client";

export default function Client() {
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF")
  useEffect(()=>{
    const webSocketConnect = async() => {
      await fetch('http://localhost:3000/api/sockets', { method: 'POST' });
      const socket = io({ autoConnect: true });
      socket.connect();
      socket.on('connect', () => {
        console.log('Connected to the server');
      });
      socket.on('disconnect', () => {
        console.log('Disconnected from the server');
      });
      socket.on('selected_color', (selectedColor: string) => {
        console.log('selected_color: ' + selectedColor);
        setBackgroundColor(() => selectedColor)
      });
    }
    webSocketConnect().then()
  },[])
  return (
    <div
        className={`w-full h-screen`}
        style={{ backgroundColor: `${backgroundColor}` }}
    ></div>
  );
}
