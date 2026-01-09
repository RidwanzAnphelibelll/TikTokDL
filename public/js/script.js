const API_BASE_URL = 'https://api-tiktok-rscoders.vercel.app/';

const extractTikTokUrl = (text) => {
    const urlPattern = /https?:\/\/(?:www\.)?(?:vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com)\/[^\s]*/gi;
    const matches = text.match(urlPattern);
    if (matches && matches.length > 0) return matches[0].split(/[\s,]/)[0];
    return null;
};

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const url = extractTikTokUrl(text);
        
        if (url) {
            const input = document.getElementById('tiktok-url');
            input.value = url;
            input.classList.add('paste-effect');
            setTimeout(() => input.classList.remove('paste-effect'), 800);
            input.focus();
        } else {
            showError('No valid TikTok URL found in clipboard!');
        }
    } catch (err) {
        showError('Failed to read clipboard. Please paste manually.');
    }
}

function clearInput() {
    const input = document.getElementById('tiktok-url');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    
    input.value = '';
    errorMessage.classList.remove('active');
    resultContainer.style.display = 'none';
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    input.focus();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDownload() {
    const input = document.getElementById('tiktok-url');
    let url = input.value.trim();
    
    if (!url) {
        showError('Please enter a TikTok URL!');
        return;
    }
    
    const extractedUrl = extractTikTokUrl(url);
    if (extractedUrl) {
        url = extractedUrl;
        input.value = url;
    }
    
    const tiktokRegex = /^https:\/\/.*tiktok\.com\/.+/;
    if (!tiktokRegex.test(url)) {
        showError('Invalid TikTok URL! Please enter a valid TikTok link.');
        return;
    }
    
    getTikTokData(url);
}

function getTikTokData(url) {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    
    loader.classList.add('active');
    errorMessage.classList.remove('active');
    resultContainer.style.display = 'none';
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + 'api/tiktok?url=' + encodeURIComponent(url), true);
    
    xhr.onload = function() {
        loader.classList.remove('active');
        
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.status && response.result) {
                    displayResult(response.result);
                } else {
                    showNoResult(response.message);
                }
            } catch (e) {
                showNoResult('Failed to parse response data!');
            }
        } else {
            showNoResult('Please check your TikTok URL!');
        }
    };
    
    xhr.onerror = function() {
        loader.classList.remove('active');
        showNoResult('Network error occurred. Please check your connection.');
    };
    
    xhr.send();
}

function sanitizeFilename(text) {
    return text
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
}

function displayResult(data) {
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    
    document.getElementById('author-nickname').textContent = data.author_nickname;
    
    const authorUsername = data.author_username;
    const authorUsernameLink = document.getElementById('author-username-link');
    const authorUsernameText = document.getElementById('author-username');
    
    authorUsernameText.textContent = '@' + authorUsername;
    authorUsernameLink.href = 'https://tiktok.com/@' + authorUsername;
    
    const authorAvatar = document.getElementById('author-avatar');
    const authorAvatarPlaceholder = document.getElementById('author-avatar-placeholder');
    
    if (data.author_avatar) {
        authorAvatar.src = data.author_avatar;
        authorAvatar.style.display = 'block';
        authorAvatarPlaceholder.style.display = 'none';
    } else {
        authorAvatar.style.display = 'none';
        authorAvatarPlaceholder.style.display = 'flex';
    }
    
    document.getElementById('video-thumbnail').src = data.thumbnail;
    document.getElementById('video-title').textContent = data.title_video;
    document.getElementById('video-duration').textContent = data.duration;
    document.getElementById('stat-likes').textContent = data.likes;
    document.getElementById('stat-comments').textContent = data.comments;
    document.getElementById('stat-shares').textContent = data.shares;
    document.getElementById('stat-views').textContent = data.views;
    
    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';
    
    const baseFilename = sanitizeFilename(data.title_video);
    const author = sanitizeFilename(data.author_username);
    
    if (data.video_hd) {
        const videoHDCard = createOptionCard(
            'Video HD',
            'High Quality Video',
            'fa-video',
            'video',
            data.video_hd,
            'HD',
            'hd',
            `${author}_${baseFilename}_HD.mp4`
        );
        optionsGrid.appendChild(videoHDCard);
    }
    
    if (data.video_sd) {
        const videoSDCard = createOptionCard(
            'Video SD',
            'Standard Quality Video',
            'fa-video',
            'video',
            data.video_sd,
            'SD',
            'sd',
            `${author}_${baseFilename}_SD.mp4`
        );
        optionsGrid.appendChild(videoSDCard);
    }
    
    if (data.audio) {
        const audioFilename = sanitizeFilename(data.title_audio);
        const audioCard = createOptionCard(
            'Audio MP3',
            data.title_audio,
            'fa-music',
            'audio',
            data.audio,
            'MP3',
            'audio',
            `${author}_${audioFilename}.mp3`
        );
        optionsGrid.appendChild(audioCard);
    }
    
    const downloadMoreContainer = document.createElement('div');
    downloadMoreContainer.className = 'download-more-container';
    downloadMoreContainer.innerHTML = `
        <button class="download-more-btn" onclick="clearInput()">
            <i class="fas fa-plus-circle"></i>
            Download More Videos
        </button>
    `;
    
    const downloadOptions = document.getElementById('download-options');
    const existingMore = downloadOptions.querySelector('.download-more-container');
    if (existingMore) {
        existingMore.remove();
    }
    downloadOptions.appendChild(downloadMoreContainer);
    
    resultContainer.style.display = 'block';
    window.scrollTo({ top: resultContainer.offsetTop - 100, behavior: 'smooth' });
}

function showNoResult(message) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'none';
    
    let noResultContainer = document.getElementById('no-result-container');
    
    if (!noResultContainer) {
        noResultContainer = document.createElement('div');
        noResultContainer.id = 'no-result-container';
        noResultContainer.className = 'no-result-container';
        
        const mainContainer = document.querySelector('.container');
        const downloadSection = document.querySelector('.download-section');
        mainContainer.insertBefore(noResultContainer, downloadSection.nextSibling);
    }
    
    noResultContainer.innerHTML = `
        <div class="no-result-content">
            <div class="no-result-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>No Result Found</h3>
            <p>${message}</p>
            <button class="try-again-btn" onclick="clearInput()">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
    
    noResultContainer.style.display = 'block';
    window.scrollTo({ top: noResultContainer.offsetTop - 100, behavior: 'smooth' });
}

function createOptionCard(title, description, icon, type, sourcesUrl, badgeText, badgeClass, filename) {
    const card = document.createElement('div');
    card.className = 'option-card';
    
    card.innerHTML = `
        <div class="option-header">
            <div class="option-icon ${type}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="option-details">
                <h4>${title}</h4>
                <p>${description}</p>
            </div>
        </div>
        <div class="option-action">
            <span class="quality-badge ${badgeClass}">${badgeText}</span>
            <button class="download-action-btn" onclick="downloadFile('${sourcesUrl}', '${filename}')">
                Download <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    return card;
}

function downloadFile(sourcesUrl, filename) {
    const DownloadUrl = API_BASE_URL + 'api/download?url=' + encodeURIComponent(sourcesUrl) + '&filename=' + encodeURIComponent(filename);
    
    const link = document.createElement('a');
    link.href = DownloadUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorMessage.classList.add('active');
}

function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('year').textContent = new Date().getFullYear();
    
    const downloadBtn = document.getElementById('download-btn');
    const input = document.getElementById('tiktok-url');
    const pasteBtn = document.getElementById('paste-btn');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    
    downloadBtn.addEventListener('click', handleDownload);
    pasteBtn.addEventListener('click', pasteFromClipboard);
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });
    
    hamburgerMenu.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', function(event) {
        if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });
    
    window.addEventListener('scroll', handleScroll);
});
