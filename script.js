// Script links - replace with your actual links
const scripts = {
    hub: "https://raw.githubusercontent.com/example/hub/main/script.lua",
    executor: "https://raw.githubusercontent.com/example/executor/main/script.lua",
    utility: "https://raw.githubusercontent.com/example/utility/main/script.lua"
};

function generateRawLink() {
    const input = document.getElementById('urlInput');
    const url = input.value.trim();
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    let rawUrl = '';
    
    try {
        // GitHub conversion
        if (url.includes('github.com') && url.includes('/blob/')) {
            rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }
        // Pastebin conversion
        else if (url.includes('pastebin.com/') && !url.includes('/raw/')) {
            const pasteId = url.split('/').pop();
            rawUrl = `https://pastebin.com/raw/${pasteId}`;
        }
        // Already raw
        else if (url.includes('raw.githubusercontent.com') || url.includes('pastebin.com/raw/')) {
            rawUrl = url;
        }
        else {
            alert('Unsupported URL format. Please use GitHub or Pastebin links.');
            return;
        }
        
        document.getElementById('rawLink').value = rawUrl;
        document.getElementById('result').style.display = 'flex';
        
    } catch (error) {
        alert('Error generating raw link. Please check your URL.');
    }
}

function copyLink() {
    const rawLinkInput = document.getElementById('rawLink');
    rawLinkInput.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

function getScript(scriptType) {
    if (scripts[scriptType]) {
        const link = scripts[scriptType];
        navigator.clipboard.writeText(link).then(() => {
            alert(`${scriptType} script link copied to clipboard!`);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(`${scriptType} script link copied to clipboard!`);
        });
    } else {
        alert('Script not available');
    }
}
