async function saveScript() {
    const script = document.getElementById('lua-script').value;
    if (!script) {
        alert('Please enter a Lua script.');
        return;
    }

    try {
        const response = await fetch('/api/save-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script })
        });

        if (response.ok) {
            const loaderCodeBlock = document.getElementById('loader-code-block');
            loaderCodeBlock.style.display = 'block';
            alert('Script saved successfully!');
        } else {
            alert('Failed to save script. Please try again.');
        }
    } catch (error) {
        console.error('Error saving script:', error);
        alert('An error occurred. Please check the console and try again.');
    }
}

function copy boutique() {
    const code = document.getElementById('loader-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Loader code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy code:', err);
        alert('Failed to copy code. Please try again.');
    });
}
