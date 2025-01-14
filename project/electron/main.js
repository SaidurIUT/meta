const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true, // Prevents Node.js integration in renderer
      preload: path.join(__dirname, "preload.js"), // Optional: Preload for secure APIs
    },
  });

  //   const startUrl =
  //     process.env.NODE_ENV === "development"
  //       ? "http://localhost:3000" // Development server
  //       : `file://${path.join(__dirname, "out", "index.html")}`; // Static export for production

  const startUrl = `http://localhost:3000`;

  mainWindow.loadURL(startUrl);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
