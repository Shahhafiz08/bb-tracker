let lastUrl = location.href;
let currentSubreddit = null;

// Extract the subreddit name from the URL
function extractSubreddit(url) {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const rIndex = pathParts.indexOf('r');
        if (rIndex !== -1 && pathParts.length > rIndex + 1) {
            const sub = pathParts[rIndex + 1];
            if (sub) {
                return sub;
            }
        }
    } catch (e) {
        console.error('Error parsing URL', e);
    }
    return null;
}

// Check the current URL and request bot-bouncer status
function checkAndUpdate() {
    const newSubreddit = extractSubreddit(location.href);
    if (newSubreddit) {
        console.log(`[Bot-Bouncer Tracker] Checking subreddit: ${newSubreddit} for URL: ${location.href}`);

        // Fetch directly from content script context
        fetch(`https://www.reddit.com/r/${newSubreddit}/about/moderators.json`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                let hasBotBouncer = false;
                if (data && data.data && Array.isArray(data.data.children)) {
                    const mods = data.data.children.map(mod => mod.name.toLowerCase());
                    console.log(`[Bot-Bouncer Tracker] Moderators found:`, mods);
                    hasBotBouncer = mods.includes('bot-bouncer') || mods.includes('bot_bouncer');
                }

                console.log(`[Bot-Bouncer Tracker] Has Bot-Bouncer?`, hasBotBouncer);

                if (hasBotBouncer) {
                    showToast(newSubreddit);
                }
            })
            .catch(e => {
                console.error('[Bot-Bouncer Tracker] Error fetching moderators:', e);
            });
    } else {
        console.log('[Bot-Bouncer Tracker] Main page or non-subreddit URL. No alert needed.');
    }
}

// Check immediately on load
checkAndUpdate();

// Check periodically for SPA navigation
setInterval(() => {
    if (location.href !== lastUrl) {
        console.log(`[Bot-Bouncer Tracker] URL changed from ${lastUrl} to ${location.href}`);
        lastUrl = location.href;
        checkAndUpdate();
    }
}, 1000);



// Display the toast notification
function showToast(subreddit) {
    // Remove existing toast to let it pop up fresh on new URL
    const existingToast = document.getElementById('bot-bouncer-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'bot-bouncer-toast';

    toast.innerHTML = `
    <div class="bb-toast-content">
      <span class="bb-toast-icon">⚠️</span>
      <span class="bb-toast-text"><b>bot-bouncer</b> is a moderator in <b>r/${subreddit}</b>!</span>
      <button class="bb-toast-close" title="Dismiss">&times;</button>
    </div>
  `;
    document.body.appendChild(toast);

    // Close button functionality
    const closeBtn = toast.querySelector('.bb-toast-close');
    const closeToast = () => {
        toast.classList.add('bb-toast-leaving');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300); // Wait for the exit animation
    };

    closeBtn.addEventListener('click', closeToast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.getElementById('bot-bouncer-toast') === toast) {
            closeToast();
        }
    }, 5000);
}
