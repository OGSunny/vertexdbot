// Tab switching
function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// File upload handling
const uploadedFiles = [];
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const scriptList = document.getElementById('scriptList');

uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const files = fileInput.files;
    for (let file of files) {
        const fileURL = URL.createObjectURL(file);
        uploadedFiles.push({ name: file.name, url: fileURL });
        displayFiles();
    }
    fileInput.value = ''; // Reset input
});

function displayFiles() {
    scriptList.innerHTML = '';
    uploadedFiles.forEach(file => {
        const div = document.createElement('div');
        div.className = 'script-item';
        div.innerHTML = `<a href="${file.url}" download="${file.name}">${file.name}</a>`;
        scriptList.appendChild(div);
    });
}
