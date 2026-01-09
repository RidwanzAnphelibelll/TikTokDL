const API_BASE_URL = 'https://api-tiktok-rscoders.vercel.app/';

let currentPage = 1;
let currentQuery = '';

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById('tiktok-url');
        input.value = text.trim();
        input.classList.add('paste-effect');
        setTimeout(() => input.classList.remove('paste-effect'), 800);
        input.focus();
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
    xhr.open('GET', API_BASE_URL + 'api/download?url=' + encodeURIComponent(url), true);
    
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
    
    if (data.video_hd) {
        const videoHDCard = createOptionCard(
            'Video HD',
            'High Quality Video',
            'fa-video',
            'video',
            data.video_hd,
            'HD',
            'hd'
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
            'sd'
        );
        optionsGrid.appendChild(videoSDCard);
    }
    
    if (data.audio) {
        const audioCard = createOptionCard(
            'Audio MP3',
            data.title_audio,
            'fa-music',
            'audio',
            data.audio,
            'MP3',
            'audio'
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

function createOptionCard(title, description, icon, type, downloadUrl, badgeText, badgeClass) {
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
            <button class="download-action-btn" onclick="downloadFile('${downloadUrl}')">
                Download <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    return card;
}

function downloadFile(downloadUrl) {
    const link = document.createElement('a');
    link.href = downloadUrl;
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

function showSearchError(message) {
    const errorMessage = document.getElementById('search-error-message');
    const errorText = document.getElementById('search-error-text');
    
    errorText.textContent = message;
    errorMessage.classList.add('active');
}

async function handleSearch(page = 1) {
    const searchInput = document.getElementById('search-query');
    const query = searchInput.value.trim();
    
    if (!query && page === 1) {
        showSearchError('Please enter a search query!');
        return;
    }
    
    if (page === 1) {
        currentQuery = query;
    }
    
    currentPage = page;
    
    const loader = document.getElementById('search-loader');
    const resultsContainer = document.getElementById('search-results');
    const pagination = document.getElementById('search-pagination');
    const errorMessage = document.getElementById('search-error-message');
    
    loader.classList.add('active');
    resultsContainer.style.display = 'none';
    pagination.style.display = 'none';
    errorMessage.classList.remove('active');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + 'api/search?query=' + encodeURIComponent(currentQuery) + '&page=' + page, true);
    
    xhr.onload = function() {
        loader.classList.remove('active');
        
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);
                
                if (data.success && data.data.length > 0) {
                    displaySearchResults(data.data, data.hasMore);
                } else {
                    showSearchError('No videos found for your search.');
                }
            } catch (e) {
                showSearchError('Failed to parse response data!');
            }
        } else {
            showSearchError('Failed to search videos. Please try again.');
        }
    };
    
    xhr.onerror = function() {
        loader.classList.remove('active');
        showSearchError('Network error occurred. Please check your connection.');
    };
    
    xhr.send();
}

function handleVideoClick(videoUrl) {
    document.querySelector('[data-tab="download-tab"]').click();
    
    setTimeout(() => {
        getTikTokData(videoUrl);
    }, 300);
}

function displaySearchResults(videos, hasMore) {
    const resultsContainer = document.getElementById('search-results');
    const pagination = document.getElementById('search-pagination');
    
    resultsContainer.innerHTML = `
        <div class="features-section">
            <h2>Search Results</h2>
            <div class="options-grid">
                ${videos.map(video => `
                    <div class="option-card" onclick="handleVideoClick('${video.video_url}')">
                        <div class="video-preview">
                            <img src="${video.cover}" alt="${video.title}" style="width: 100%; border-radius: 12px 12px 0 0;">
                            <div class="video-stats">
                                <span><i class="fas fa-heart"></i> ${video.digg_count}</span>
                                <span><i class="fas fa-comment"></i> ${video.comment_count}</span>
                                <span><i class="fas fa-eye"></i> ${video.play_count}</span>
                            </div>
                        </div>
                        <div class="option-header">
                            <div style="display: flex; align-items: center; gap: 12px; padding: 16px;">
                                <img src="${video.author.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" alt="${video.author.nickname}">
                                <div>
                                    <h4 style="margin: 0; font-size: 14px;">${video.author.nickname}</h4>
                                    <p style="margin: 0; font-size: 12px; color: #666;">@${video.author.unique_id}</p>
                                </div>
                            </div>
                        </div>
                        <div class="option-details" style="padding: 0 16px 16px;">
                            <h4 style="font-size: 14px; margin-bottom: 8px;">${video.title.substring(0, 60)}${video.title.length > 60 ? '...' : ''}</h4>
                            <p style="font-size: 12px; color: #666;"><i class="fas fa-clock"></i> ${video.duration}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
    
    document.getElementById('page-info').textContent = 'Page ' + currentPage;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = !hasMore;
    pagination.style.display = 'flex';
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
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-query');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    downloadBtn.addEventListener('click', handleDownload);
    pasteBtn.addEventListener('click', pasteFromClipboard);
    searchBtn.addEventListener('click', () => handleSearch(1));
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch(1);
        }
    });
    
    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            handleSearch(currentPage - 1);
        }
    });
    
    nextBtn.addEventListener('click', function() {
        handleSearch(currentPage + 1);
    });
    
    hamburgerMenu.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', function(event) {
        if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName).classList.add('active');
        });
    });
    
    window.addEventListener('scroll', handleScroll);
});