const timerDisplay = document.getElementById("timerDisplay");
const startButton = document.getElementById("startTimer");
const stopButton = document.getElementById("stopTimer");

let pollingIntervalId;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay(remainingTime) {
    timerDisplay.textContent = formatTime(remainingTime);
}

function calculateRemainingTime(startTime, timerDuration) {
    const now = new Date();
    const start = new Date(startTime);
    const elapsedSeconds = Math.floor((now - start) / 1000);
    return Math.max(timerDuration - elapsedSeconds, 0);
}

function pollTimer() 
{
    chrome.runtime.sendMessage({ action: "getTimerState" }, (response) => {
        if (response && response.timerRunning && response.startTime) {
            const remainingTime = calculateRemainingTime(response.startTime, response.timerDuration);
            if (remainingTime <= 0) {
                clearInterval(pollingIntervalId);
                updateTimerDisplay(0);
            } else {
                updateTimerDisplay(remainingTime);
            }
        } else {
            // Timer not running OR no valid startTime
            clearInterval(pollingIntervalId);
            updateTimerDisplay(0);
        }
    });
}
function startPolling() {
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    pollingIntervalId = setInterval(pollTimer, 1000);
}

// Start session
startButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "startTimer" }, () => {
        startPolling(); // start polling when timer starts
    });
});

// End session
stopButton.addEventListener("click", () => 
{
    chrome.runtime.sendMessage({ action: "stopTimer" }, () => 
    {
        if (pollingIntervalId) clearInterval(pollingIntervalId);
        updateTimerDisplay(0);  // Show 00:00 immediately
    });
});

// Always start polling on popup open
startPolling();