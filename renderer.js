const navForm = document.getElementById('nav-form');
const urlInput = document.getElementById('url-input');
const contentView = document.getElementById('content-view');
const welcomeScreen = document.getElementById('welcome-screen');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const reloadButton = document.getElementById('reload-button');
const homeButton = document.getElementById('home-button');
const suggestions = document.getElementById('suggestions');

// Popular HNS domains for suggestions
const popularDomains = [
    'shakeshift/',
    'mahadev/',
    'australia/',
    'impervious/',
    'freedom/',
    'open/',
    'decentralized/'
];

const setNavState = (state) => {
    // Update reload button based on loading state
    if (state === 'loading') {
        reloadButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                <path d="M21.5 2v6h-6M2.5 22v-6h6"></path>
                <path d="M22 12.5A10 10 0 0 0 9.004 2.5M2 12.5A10 10 0 0 0 14.996 22.5"></path>
            </svg>
        `;
    } else {
        reloadButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6"></path>
                <path d="M22 12.5A10 10 0 0 0 9.004 2.5M2 12.5A10 10 0 0 0 14.996 22.5"></path>
            </svg>
        `;
    }
};

const goHome = () => {
    welcomeScreen.style.display = 'flex';
    contentView.src = 'about:blank';
    urlInput.value = '';
    document.title = 'HNS Browser'; // <-- FIX: Reset the title
    setNavState('loaded');
};

// Show domain suggestions
const showSuggestions = (value) => {
    if (!value) {
        suggestions.classList.add('hidden');
        return;
    }
    
    const filtered = popularDomains.filter(domain => 
        domain.toLowerCase().includes(value.toLowerCase())
    );
    
    if (filtered.length === 0) {
        suggestions.classList.add('hidden');
        return;
    }
    
    suggestions.innerHTML = filtered.map(domain => `
        <div class="suggestion-item px-4 py-2 cursor-pointer hover:bg-dark-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="12" y1="2" x2="12" y2="22"></line>
            </svg>
            ${domain}
        </div>
    `).join('');
    
    suggestions.classList.remove('hidden');
    
    // Add click event to suggestions
    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            urlInput.value = item.textContent.trim();
            suggestions.classList.add('hidden');
            navForm.dispatchEvent(new Event('submit', { cancelable: true }));
        });
    });
};

// Event Listeners
navForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let url = urlInput.value.trim();
    if (!url) return;

    if (!url.startsWith('hns://')) {
        url = `hns://${url}`;
    }
    welcomeScreen.style.display = 'none';
    suggestions.classList.add('hidden');
    
    // Load the URL
    contentView.src = url;
});

urlInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

urlInput.addEventListener('focus', () => {
    showSuggestions(urlInput.value);
});

document.addEventListener('click', (e) => {
    if (!suggestions.contains(e.target) && e.target !== urlInput) {
        suggestions.classList.add('hidden');
    }
});

backButton.addEventListener('click', () => {
    if (contentView.canGoBack()) {
        contentView.goBack();
    }
});

forwardButton.addEventListener('click', () => {
    if (contentView.canGoForward()) {
        contentView.goForward();
    }
});

reloadButton.addEventListener('click', () => {
    contentView.reload();
});

homeButton.addEventListener('click', goHome);

// Webview event listeners
contentView.addEventListener('did-start-loading', () => {
    setNavState('loading');
});

contentView.addEventListener('did-stop-loading', () => {
    setNavState('loaded');
    
    // Update navigation buttons state
    backButton.classList.toggle('opacity-50', !contentView.canGoBack());
    forwardButton.classList.toggle('opacity-50', !contentView.canGoForward());
});

contentView.addEventListener('did-fail-load', (e) => {
    console.error('Webview failed to load:', e);
    setNavState('loaded');
});

contentView.addEventListener('did-navigate', (event) => {
    const url = event.url;
    if (url.startsWith('hns://')) {
        urlInput.value = url.slice(6);
    }
});

contentView.addEventListener('page-title-updated', (event) => {
    document.title = `${event.title} - HNS Browser`;
});

// Add click handlers for example domains on welcome screen
document.querySelectorAll('[data-domain]').forEach(el => {
    el.addEventListener('click', () => {
        urlInput.value = el.getAttribute('data-domain');
        navForm.dispatchEvent(new Event('submit', { cancelable: true }));
    });
});

// Initialize
urlInput.focus();