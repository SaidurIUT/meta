const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

// Initialize Discord Client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Access to guilds
    GatewayIntentBits.GuildMessages, // Access to guild messages
    GatewayIntentBits.MessageContent, // Access to message content
  ],
});

// Initialize Express App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXTJS_FRONTEND_URL, // Frontend URL (e.g., http://localhost:3000)
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.NEXTJS_FRONTEND_URL, // Frontend URL
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Root endpoint for testing
app.get("/", (req, res) => {
  res.send("Discord Bot Backend is running.");
});

// Send Message endpoint
app.post("/send-message", async (req, res) => {
  console.log("Received /send-message request:", req.body); // Log the entire body

  const { username, message, channelId } = req.body;

  console.log("Extracted Fields:");
  console.log("username:", username);
  console.log("message:", message);
  console.log("channelId:", channelId);

  // Validate required fields
  if (!username || !message || !channelId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: username, message, channelId.",
    });
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid channel ID." });
    }

    // Create a rich embed using EmbedBuilder
    const embed = new EmbedBuilder()
      .setAuthor({ name: username, iconURL: "https://i.imgur.com/mDKlggm.png" }) // Replace with actual avatar if available
      .setDescription(message)
      .setColor(0x00ff00) // Green color
      .setTimestamp()
      .setFooter({ text: "Sent via Discord Bot" });

    // Send the message
    await channel.send({ embeds: [embed] });

    res.json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({
      success: false,
      message: `Problem in sending message: ${err.message}`,
    });
  }
});

// Get Channels endpoint
app.get("/channels", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    if (!guild) {
      return res
        .status(404)
        .json({ success: false, message: "Guild not found." });
    }

    const channels = guild.channels.cache
      .filter((channel) => channel.isTextBased())
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
      }));

    res.json({ success: true, channels });
  } catch (err) {
    console.error("Error fetching channels:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch channels." });
  }
});

// Handle Socket.io connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle joining a channel room
  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
    console.log(`Socket ${socket.id} joined channel ${channelId}`);
  });

  // Handle leaving a channel room
  socket.on("leave-channel", (channelId) => {
    socket.leave(channelId);
    console.log(`Socket ${socket.id} left channel ${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Listen for Discord messages
client.on("messageCreate", (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Construct message data
  const messageData = {
    username: message.author.username,
    avatar: message.author.displayAvatarURL(),
    content: message.content,
    timestamp: message.createdTimestamp,
    channel: message.channel.name,
    channelId: message.channel.id,
    guild: message.guild.name,
  };

  // Emit message to the specific channel room (using channel ID)
  io.to(message.channel.id).emit("new-message", messageData);
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);

// Start the server
const PORT = process.env.PORT || 4000; // Ensure this matches your frontend's backend URL
server.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
