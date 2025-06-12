function copyCode() {
    const code = document.getElementById('loader-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy code: ', err);
        alert('Failed to copy code. Please try again.');
    });
}
