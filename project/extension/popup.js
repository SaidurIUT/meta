document
  .getElementById("screenshot-btn")
  .addEventListener("click", async () => {
    try {
      // Get the active tab in the current window
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        alert("No active tab found!");
        return;
      }

      // Capture the visible part of the current tab
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error("Error capturing tab:", chrome.runtime.lastError);
          alert("Failed to capture the screenshot.");
          return;
        }

        // Display the screenshot in the popup
        const screenshotContainer = document.getElementById(
          "screenshot-container"
        );
        screenshotContainer.innerHTML = `<img src="${dataUrl}" alt="Screenshot">`;
      });
    } catch (error) {
      console.error("Error taking screenshot:", error);
      alert("An unexpected error occurred.");
    }
  });
