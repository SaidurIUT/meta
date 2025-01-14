const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("myApi", {
  exampleFunction: () => "Hello from Electron!",
});
