import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import "./Chatbox.css";

const Chatbox = ({ roomId, playerName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!roomId) return;

    // Reference to the messages subcollection for the room
    const messagesRef = collection(db, `rooms/${roomId}/messages`);

    // Subscribe to real-time updates
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, `rooms/${roomId}/messages`);
      await addDoc(messagesRef, {
        sender: playerName,
        text: newMessage.trim(),
        timestamp: new Date(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <strong>{message.sender}:</strong> {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbox;
