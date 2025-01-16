// FloatingChatBot.tsx
import React, { useState } from "react";
import styles from "./FloatingChatBot.module.css";
import { MessageSquare } from "lucide-react"; // Example icon, replace as needed
import { Button } from "@/components/ui/button";

interface FloatingChatProps {
  onSendChat: () => void;
  chatInput: string;
  setChatInput: (value: string) => void;
  chatResponse: string;
  chatLoading: boolean;
  chatError: string | null;
  themeTextStyle: React.CSSProperties;
  themeInputStyle: React.CSSProperties;
}

const FloatingChatBot: React.FC<FloatingChatProps> = ({
  onSendChat,
  chatInput,
  setChatInput,
  chatResponse,
  chatLoading,
  chatError,
  themeTextStyle,
  themeInputStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Toggle chat visibility

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={styles.chatToggleButton}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: themeInputStyle.backgroundColor,
          color: themeTextStyle.color,
        }}
        aria-label="Toggle Chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Floating Chat */}
      <div
        className={`${styles.floatingChat} ${
          isOpen ? styles.open : styles.closed
        }`}
        style={themeInputStyle}
      >
        <div style={{ marginBottom: "1rem", ...themeTextStyle }}>
          <strong>AI Chatbot</strong>
        </div>
        <textarea
          className={styles.chatInput}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your query here..."
          style={themeInputStyle}
        />
        <Button
          onClick={onSendChat}
          style={{
            marginTop: "1rem", 
            width: "100%",
            backgroundColor: "#4caf50", 
            color: "#fff",
          }}
          disabled={chatLoading}
        >
          {chatLoading ? "Sending..." : "Send"}
        </Button>
        {chatError && (
          <div className={styles.chatError} style={themeTextStyle}>
            {chatError}
          </div>
        )}
        {chatResponse && (
          <div className={styles.chatResponse} style={themeTextStyle}>
            {chatResponse}
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingChatBot;
