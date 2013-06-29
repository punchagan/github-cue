if (!localStorage.isInitialized) {
    localStorage.isInitialized = true;
    localStorage.login = 'punchagan';
    localStorage.repos = undefined;
    chrome.tabs.create({url: 'options.html'}); // after install, show options page.
    }

// Listen to messages from the content script
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == "username")
      sendResponse({username: localStorage.login});
  }
);
