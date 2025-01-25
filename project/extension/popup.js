// document
//   .getElementById("screenshot-btn")
//   .addEventListener("click", async () => {
//     try {
//       // Get the active tab in the current window
//       const [tab] = await chrome.tabs.query({
//         active: true,
//         currentWindow: true,
//       });

//       if (!tab) {
//         alert("No active tab found!");
//         return;
//       }

//       // Capture the visible part of the current tab
//       chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
//         if (chrome.runtime.lastError) {
//           console.error("Error capturing tab:", chrome.runtime.lastError);
//           alert("Failed to capture the screenshot.");
//           return;
//         }

//         // Display the screenshot in the popup
//         const screenshotContainer = document.getElementById(
//           "screenshot-container"
//         );
//         screenshotContainer.innerHTML = `<img src="${dataUrl}" alt="Screenshot">`;
//       });
//     } catch (error) {
//       console.error("Error taking screenshot:", error);
//       alert("An unexpected error occurred.");
//     }
//   });

document
  .getElementById("screenshot-btn")
  .addEventListener("click", async () => {
    try {
      // Get all open windows
      const windows = await chrome.windows.getAll({ populate: true });

      // Create a container to display screenshots
      const screenshotContainer = document.getElementById(
        "screenshot-container"
      );
      screenshotContainer.innerHTML = ""; // Clear any previous screenshots

      // Loop through each window
      for (const win of windows) {
        // Get the active tab of the window
        const activeTab = win.tabs.find((tab) => tab.active);

        if (activeTab) {
          // Capture the visible part of the active tab
          await new Promise((resolve) => {
            chrome.tabs.captureVisibleTab(
              win.id,
              { format: "png" },
              (dataUrl) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Error capturing tab in window ${win.id}:`,
                    chrome.runtime.lastError
                  );
                  return resolve();
                }

                // Add the screenshot to the container
                const img = document.createElement("img");
                img.src = dataUrl;
                img.alt = `Screenshot of Window ${win.id}`;
                img.style = "max-width: 100%; margin-top: 10px;";
                screenshotContainer.appendChild(img);

                resolve();
              }
            );
          });
        }
      }
    } catch (error) {
      console.error("Error capturing screenshots:", error);
      alert("An unexpected error occurred.");
    }
  });
