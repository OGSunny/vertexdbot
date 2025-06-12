function copyCode() {
  const code = document.getElementById('loadstring-code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const message = document.getElementById('copy-message');
    message.textContent = 'Code copied to clipboard!';
    message.style.display = 'block';
    setTimeout(() => {
      message.style.display = 'none';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    const message = document.getElementById('copy-message');
    message.textContent = 'Failed to copy code.';
    message.style.display = 'block';
  });
}
