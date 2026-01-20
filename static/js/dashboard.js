// Dashboard functionality
function changeMood(mood) {
    // 1. Instant UI Feedback: Change Color and Button State
    const container = document.getElementById('dashboard-container');

    // Update container background
    container.classList.forEach(className => {
        if (className.startsWith('mood-bg-')) {
            container.classList.remove(className);
        }
    });
    container.classList.add(`mood-bg-${mood}`);

    // Update mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('border-indigo-600', 'ring-4', 'ring-indigo-600/10', 'scale-[1.02]');
        btn.classList.add('border-transparent');
    });

    const activeBtn = Array.from(document.querySelectorAll('.mood-btn')).find(btn => btn.getAttribute('onclick').includes(`'${mood}'`));
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent');
        activeBtn.classList.add('border-indigo-600', 'ring-4', 'ring-indigo-600/10', 'scale-[1.02]');
    }

    // Show loading state on suggestions
    const suggestionsContainer = document.getElementById('suggestions-container');
    suggestionsContainer.style.opacity = '0.5';

    // 2. Fetch new suggestions from Gemini
    fetch('/api/change-mood/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ mood: mood })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.suggestions && data.suggestions.length > 0) {
                    suggestionsContainer.innerHTML = data.suggestions.map((suggestion, index) => `
                        <div class="group relative">
                            <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <button class="relative w-full flex items-center space-x-4 p-5 bg-white dark:bg-gray-800/80 rounded-[1.25rem] transition-all hover:translate-x-1 border border-white/20 shadow-sm">
                                <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
                                    ${index + 1}
                                </div>
                                <span class="text-sm font-semibold text-left text-gray-800 dark:text-gray-200">${suggestion}</span>
                            </button>
                        </div>
                    `).join('');
                }
            }
        })
        .finally(() => {
            suggestionsContainer.style.opacity = '1';
        });
}

function syncData() {
    const btn = document.getElementById('sync-btn');
    const text = document.getElementById('sync-text');

    // Disable button and show loading
    btn.disabled = true;
    text.innerHTML = '🔄 Syncing...';
    text.classList.add('spin');

    // Send sync request
    fetch('/api/sync/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(response => response.json())
        .then(data => {
            setTimeout(() => {
                text.classList.remove('spin');
                btn.disabled = false;
                text.innerHTML = '🔄 Sync My Life';

                // Reload page to show updated data
                window.location.reload();
            }, 2000);
        });
}

// Get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
