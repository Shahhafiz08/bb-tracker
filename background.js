const cache = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CHECK_SUBREDDIT') {
    const subreddit = request.subreddit;
    
    // Check cache first to avoid redundant network requests
    if (cache.has(subreddit)) {
      sendResponse({ hasBotBouncer: cache.get(subreddit) });
      return true;
    }

    // Fetch the moderators list from Reddit API
    fetch(`https://www.reddit.com/r/${subreddit}/about/moderators.json`)
      .then(res => res.json())
      .then(data => {
        let hasBotBouncer = false;
        if (data && data.data && Array.isArray(data.data.children)) {
          // Look through the moderators list
          hasBotBouncer = data.data.children.some(mod => mod.name.toLowerCase() === 'bot-bouncer');
        }
        // Cache the result for this session
        cache.set(subreddit, hasBotBouncer);
        sendResponse({ hasBotBouncer });
      })
      .catch(e => {
        console.error('Error fetching moderators:', e);
        sendResponse({ hasBotBouncer: false });
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
