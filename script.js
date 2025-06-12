let savedCodes = [];
let currentCodeId = null;

// Load saved codes from memory on page load
function loadSavedCodes() {
    updateSavedCodesList();
    updateStats();
}

// Save code function
function saveCode() {
    const code = document.getElementById('codeEditor').value.trim();
    
    if (!code) {
        showStatus('Please enter some code before saving!', 'error');
        return;
    }

    const codeData = {
        id: Date.now(),
        name: `Script_${savedCodes.length + 1}`,
        code: code,
        date: new Date().toLocaleString(),
        length: code.length,
        lines: code.split('\n').length
    };

    savedCodes.push(codeData);
    currentCodeId = codeData.id;
    
    updateSavedCodesList();
    updateCurrentLoader();
    updateStats();
    
    showStatus('Code saved successfully! Loader updated.', 'success');
}

// Load code into editor
function loadCode(id) {
    const codeData = savedCodes.find(code => code.id === id);
    if (codeData) {
        document.getElementById('codeEditor').value = codeData.code;
        currentCodeId = id;
        updateCurrentLoader();
        updateStats();
        showStatus(`Loaded: ${codeData.name}`, 'success');
    }
}

// Delete saved code
function deleteCode(id) {
    if (confirm('Are you sure you want to delete this code?')) {
        savedCodes = savedCodes.filter(code => code.id !== id);
        if (currentCodeId === id) {
            currentCodeId = null;
            updateCurrentLoader();
        }
        updateSavedCodesList();
        updateStats();
        showStatus('Code deleted successfully!', 'success');
    }
}

// Update saved codes list display
function updateSavedCodesList() {
    const listContainer = document.getElementById('savedCodesList');
    
    if (savedCodes.length === 0) {
        listContainer.innerHTML = '<p style="opacity: 0.7; text-align: center; padding: 1rem;">No saved codes yet</p>';
        return;
    }

    listContainer.innerHTML = savedCodes.map(code => `
        <div class="saved-code-item">
            <div class="code-info">
                <div class="code-name">${code.name}</div>
                <div class="code-date">${code.date} • ${code.lines} lines • ${code.length} chars</div>
            </div>
            <div class="code-actions">
                <button class="small-btn btn-primary" onclick="loadCode(${code.id})">Load</button>
                <button class="small-btn btn-danger" onclick="deleteCode(${code.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update current loader display
function updateCurrentLoader() {
    const loaderElement = document.getElementById('currentLoader');
    
    if (currentCodeId) {
        loaderElement.textContent = `loadstring(game:HttpGet("https://yoursite.com/api/getcode?id=${currentCodeId}"))()`;
    } else {
        loaderElement.textContent = 'loadstring(game:HttpGet("https://yoursite.com/api/getcode"))() -- Save code first!';
    }
}

// Update code statistics
function updateStats() {
    const code = document.getElementById('codeEditor').value;
    const currentCode = currentCodeId ? savedCodes.find(c => c.id === currentCodeId) : null;
    
    document.getElementById('codeLength').textContent = code.length;
    document.getElementById('codeLines').textContent = code.split('\n').length;
    document.getElementById('lastSaved').textContent = currentCode ? currentCode.date : 'Never';
}

// Copy loader to clipboard
function copyLoader() {
    const loaderText = document.getElementById('currentLoader').textContent;
    navigator.clipboard.writeText(loaderText).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#4CAF50';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#4ecdc4';
        }, 2000);
        
        showStatus('Loader copied to clipboard!', 'success');
    }).catch(() => {
        showStatus('Failed to copy to clipboard', 'error');
    });
}

// Clear editor
function clearEditor() {
    if (confirm('Are you sure you want to clear the editor?')) {
        document.getElementById('codeEditor').value = '';
        updateStats();
    }
}

// Load example code
function loadExample() {
    const exampleCode = `-- UNordinary Hub Example Script
local Players = game:GetService("Players")
local player = Players.LocalPlayer
local TweenService = game:GetService("TweenService")

print("🚀 UNordinary Hub Loaded Successfully!")

-- Create GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "UNordinaryHub"
screenGui.Parent = player:WaitForChild("PlayerGui")

-- Main Frame
local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 300, 0, 200)
mainFrame.Position = UDim2.new(0.5, -150, 0.5, -100)
mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

-- Title
local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 40)
title.Position = UDim2.new(0, 0, 0, 0)
title.Text = "UNordinary Hub"
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.TextScaled = true
title.BackgroundColor3 = Color3.fromRGB(78, 205, 196)
title.BorderSizePixel = 0
title.Parent = mainFrame

print("✅ Hub GUI Created!")`;

    document.getElementById('codeEditor').value = exampleCode;
    updateStats();
    showStatus('Example code loaded!', 'success');
}

// Show status message
function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message status-${type}`;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// Update stats when typing
document.getElementById('codeEditor').addEventListener('input', updateStats);

// Load saved codes on page load
document.addEventListener('DOMContentLoaded', loadSavedCodes);
