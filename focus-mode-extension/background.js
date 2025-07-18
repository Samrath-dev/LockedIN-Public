
function sendSessionToBackend(sessionData) {
    fetch('http://localhost:8080/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...sessionData,
            origin: "extension",
            duration: sessionData.startTime && sessionData.endTime
              ? Math.floor((new Date(sessionData.endTime) - new Date(sessionData.startTime)) / 1000)
              : null
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to save session to backend");
        return res.json();
    })
    .then(data => {
        console.log("Session saved to backend:", data);
    })
    .catch(err => {
        console.error("Backend save error:", err);
    });
}

let timerDuration = 50 * 60;

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.set({
        focusModeState: {
            timerRunning: false,
            startTime: null,
            timerDuration: null
        }
    });
    console.log("Focus Mode: Timer state reset on Chrome startup.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTimer") {
        chrome.storage.local.get("focusModeState", (result) => {
            const focusModeState = result.focusModeState;
            if (focusModeState?.timerRunning) {
                console.log("Focus Mode: Timer already running.");
                sendResponse({ status: "already_running" });
                return;
            }

            const startTime = new Date();
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                chrome.storage.local.set({
                    focusModeState: {
                        timerRunning: true,
                        startTime: startTime.toISOString(),
                        timerDuration: timerDuration,
                        tabId: tab.id,
                        tabUrl: tab.url
                    }
                }, () => {
                    console.log("Focus Mode: Timer started and tab info saved.");
                    sendResponse({ status: "started" });
                });
            });
        });
        return true;
    }

    if (message.action === "stopTimer") {
        chrome.storage.local.get("focusModeState", (result) => {
            const focusModeState = result.focusModeState;
            const endTime = new Date();

            chrome.storage.local.set({
                focusModeState: {
                    timerRunning: false,
                    startTime: null,
                    timerDuration: null
                }
            }, () => {
                console.log("Focus Mode: Timer forcibly stopped.");
            });

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const sessionData = {
                    url: tabs[0]?.url || 'Unknown',
                    startTime: focusModeState?.startTime || null,
                    endTime: endTime.toISOString()
                };

                chrome.storage.local.get({ sessions: [] }, (result) => {
                    const updatedSessions = result.sessions || [];
                    updatedSessions.push(sessionData);
                    chrome.storage.local.set({ sessions: updatedSessions }, () => {
                        console.log("Focus Mode: Session saved.");
                        sendSessionToBackend(sessionData);
                        sendResponse({ status: "stopped" });
                    });
                });
            });
        });
        return true;
    }

    if (message.action === "getTimerState") {
        chrome.storage.local.get("focusModeState", (result) => {
            sendResponse(result.focusModeState || { timerRunning: false });
        });
        return true;
    }
});

chrome.tabs.onRemoved.addListener((closedTabId) => {
    chrome.storage.local.get("focusModeState", (result) => {
        const focus = result.focusModeState;
        if (!focus?.timerRunning || !focus.tabUrl) return;

        const focusOrigin = new URL(focus.tabUrl).origin;

        chrome.tabs.query({}, (tabs) => {
            const siteStillOpen = tabs.some((tab) => {
                try {
                    return new URL(tab.url).origin === focusOrigin;
                } catch {
                    return false;
                }
            });

            if (!siteStillOpen) {
                console.log("Focus Mode: No more tabs with target site. Ending session.");

                const endTime = new Date();
                const sessionData = {
                    url: focus.tabUrl || 'Unknown',
                    startTime: focus.startTime || null,
                    endTime: endTime.toISOString()
                };

                chrome.storage.local.set({
                    focusModeState: {
                        timerRunning: false,
                        startTime: null,
                        timerDuration: null
                    }
                }, () => {
                    console.log("Focus Mode: Timer forcibly stopped (site closed).");
                });

                chrome.storage.local.get({ sessions: [] }, (res) => {
                    const updatedSessions = res.sessions || [];
                    updatedSessions.push(sessionData);
                    chrome.storage.local.set({ sessions: updatedSessions }, () => {
                        console.log("Focus Mode: Session saved due to full site close.");
                        sendSessionToBackend(sessionData);
                    });
                });
            }
        });
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) return;

    chrome.storage.local.get("focusModeState", (result) => {
        const focus = result.focusModeState;
        if (!focus?.timerRunning || tabId !== focus.tabId) return;

        const currentOrigin = new URL(changeInfo.url).origin;
        const focusOrigin = new URL(focus.tabUrl).origin;

        if (currentOrigin !== focusOrigin) {
            console.log("Focus Mode: Tab navigated away from tracked site. Ending session.");

            const endTime = new Date();
            const sessionData = {
                url: focus.tabUrl || 'Unknown',
                startTime: focus.startTime || null,
                endTime: endTime.toISOString()
            };

            chrome.storage.local.set({
                focusModeState: {
                    timerRunning: false,
                    startTime: null,
                    timerDuration: null
                }
            }, () => {
                console.log("Focus Mode: Timer forcibly stopped (navigated site).");
            });

            chrome.storage.local.get({ sessions: [] }, (res) => {
                const updatedSessions = res.sessions || [];
                updatedSessions.push(sessionData);
                chrome.storage.local.set({ sessions: updatedSessions }, () => {
                    console.log("Focus Mode: Session saved due to site navigation.");
                    sendSessionToBackend(sessionData);
                });
            });
        }
    });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.storage.local.get("focusModeState", (result) => {
        const focus = result.focusModeState;
        if (!focus?.timerRunning) return;

        chrome.tabs.get(activeInfo.tabId, (tab) => {
            try {
                const currentOrigin = new URL(tab.url).origin;
                const focusOrigin = new URL(focus.tabUrl).origin;

                if (currentOrigin !== focusOrigin) {
                    console.log("Focus Mode: Switched to a non-focus site tab. Ending session.");

                    const endTime = new Date();
                    const sessionData = {
                        url: focus.tabUrl || 'Unknown',
                        startTime: focus.startTime || null,
                        endTime: endTime.toISOString()
                    };

                    chrome.storage.local.set({
                        focusModeState: {
                            timerRunning: false,
                            startTime: null,
                            timerDuration: null
                        }
                    }, () => {
                        console.log("Focus Mode: Timer forcibly stopped (tab switch).");
                    });

                    chrome.storage.local.get({ sessions: [] }, (res) => {
                        const updatedSessions = res.sessions || [];
                        updatedSessions.push(sessionData);
                        chrome.storage.local.set({ sessions: updatedSessions }, () => {
                            console.log("Focus Mode: Session saved due to tab switch.");
                            sendSessionToBackend(sessionData);
                        });
                    });
                }
            } catch (e) {
                console.log("Focus Mode: Could not parse tab URL. Possibly a blank or internal tab.");
            }
        });
    });
}); 
