// JavaScript Code
const API_KEYS = [
    'b5c0a7e5f611464cb4a124ac31b1fc3b',
    '00b29c021b7344748bbd91c2949d812b',
    '21e069bc6218433fb80c1fa07462dbbc',
    '1b834d402bf249aab8763736a426d780'
];
let currentApiKeyIndex = 0;
let currentPage = 1;
let currentCategory = 'general';
let isLoading = false;
let isSearching = false;
let currentSearchTerm = '';

// DOM Elements
const newsContainer = document.getElementById('newsContainer');
const loading = document.getElementById('loading');
const darkModeToggle = document.getElementById('darkModeToggle');
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupCategories();
    loadNews();
    setupEventListeners();
    setupIntersectionObserver();
});

function setupEventListeners() {
    window.addEventListener('scroll', handleScroll);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    hamburger.addEventListener('click', toggleSidebar);
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('input', debounce(performSearch, 500));
}

async function loadNews() {
    if (isLoading) return;
    isLoading = true;
    loading.style.display = 'block';

    try {
        const url = isSearching ? 
            `https://newsapi.org/v2/everything?q=${currentSearchTerm}&page=${currentPage}` :
            `https://newsapi.org/v2/top-headlines?country=us&category=${currentCategory}&page=${currentPage}`;

        const response = await fetch(url, {
            headers: { 'X-Api-Key': API_KEYS[currentApiKeyIndex] }
        });

        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        displayNews(data.articles);
        currentPage++;

    } catch (error) {
        currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
        loadNews();
    } finally {
        isLoading = false;
        loading.style.display = 'none';
    }
}

function displayNews(articles) {
    if (currentPage === 1) newsContainer.innerHTML = '';
    
    articles.forEach(article => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
            <img src="${article.urlToImage || 'placeholder.jpg'}" class="news-image" alt="${article.title}">
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || ''}</p>
                <div class="social-sharing">
                    <i class="fab fa-facebook social-icon" onclick="shareToFacebook('${article.url}')"></i>
                    <i class="fab fa-twitter social-icon" onclick="shareToTwitter('${article.url}', '${article.title}')"></i>
                    <i class="fab fa-linkedin social-icon" onclick="shareToLinkedIn('${article.url}', '${article.title}')"></i>
                    <i class="fab fa-whatsapp social-icon" onclick="shareToWhatsApp('${article.url}', '${article.title}')"></i>
                </div>
                <button class="read-more" onclick="window.open('${article.url}', '_blank')">Read More</button>
            </div>
        `;
        newsContainer.appendChild(newsCard);
    });
}

function setupCategories() {
    const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    const categoriesContainer = document.getElementById('categories');
    const sidebarCategories = document.getElementById('sidebarCategories');
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        button.addEventListener('click', () => filterByCategory(category));
        categoriesContainer.appendChild(button.cloneNode(true));
        sidebarCategories.appendChild(button);
    });
}

function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    isSearching = false;
    loadNews();
}

function performSearch() {
    currentSearchTerm = searchInput.value.trim();
    if (currentSearchTerm) {
        isSearching = true;
        currentPage = 1;
        loadNews();
    }
}

function shareToFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareToTwitter(url, title) {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareToLinkedIn(url, title) {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
}

function shareToWhatsApp(url, title) {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.querySelector('i').classList.toggle('fa-moon');
    darkModeToggle.querySelector('i').classList.toggle('fa-sun');
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadNews();
        }
    }, { threshold: 1.0 });

    observer.observe(loading);
}

function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        loadNews();
    }
}