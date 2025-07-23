import { videos } from './data/videos.js'; // 從獨立檔案引入影片資料
import { translations } from './data/translations.js'; // 從獨立檔案引入翻譯資料

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const sidebarContainer = document.getElementById('sidebar-container');
    const accountMenuContainer = document.getElementById('account-menu-container');
    const mainContent = document.getElementById('main-content');
    const messageBox = document.getElementById('message-box');
    const loadingOverlayContainer = document.getElementById('loading-overlay-container'); // New container for loading overlay

    let loadingOverlay = null; // Will be set after loading the component

    let currentLang = 'en'; // Default language
    let currentSelectedCategory = 'All Data'; // Track the currently selected category

    // Function to load HTML components dynamically
    async function loadComponent(container, filePath) {
        if (!container) {
            console.error(`Error: Target container for ${filePath} is null. Cannot load component.`);
            return null; // Return null if container is not found
        }
        try {
            console.log(`Attempting to fetch: ${filePath}`);
            const response = await fetch(filePath);
            console.log(`Fetch response for ${filePath}: OK=${response.ok}, Status=${response.status}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
            }
            const html = await response.text();
            container.innerHTML = html;
            console.log(`Successfully loaded component: ${filePath}. Container innerHTML length: ${container.innerHTML.length}`);
            return container.firstElementChild; // Return the loaded component's root element
        } catch (error) {
            console.error(`Error loading component ${filePath}:`, error);
            return null;
        }
    }

    // Load components
    console.log("Loading sidebar component...");
    await loadComponent(sidebarContainer, 'components/sidebar.html');
    console.log("Loading account menu component...");
    await loadComponent(accountMenuContainer, 'components/account_menu.html');
    console.log("Loading loading overlay component...");
    loadingOverlay = await loadComponent(loadingOverlayContainer, 'components/loading_overlay.html');


    // Add a small delay to ensure DOM has settled after dynamic insertions
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay

    // Get elements after components are loaded (and main content is parsed)
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const userAvatar = document.getElementById('user-avatar');
    const accountMenu = document.getElementById('account-menu');
    const languageOption = document.getElementById('language-option');
    const languageSubmenu = document.getElementById('language-submenu');
    const categoryTagsContainer = document.getElementById('category-tags');
    const homeVideoGrid = document.getElementById('home-video-grid');
    const trendingVideoGrid = document.getElementById('trending-video-grid');
    const musicVideoGrid = document.getElementById('music-video-grid');


    // Debug logs for element existence after all loads
    console.log('Final check: Sidebar element:', sidebar);
    console.log('Final check: Sidebar toggle element:', sidebarToggle);
    console.log('Final check: User avatar element:', userAvatar);
    console.log('Final check: Account menu element:', accountMenu);
    console.log('Final check: Language option element:', languageOption);
    console.log('Final check: Language submenu element:', languageSubmenu);
    console.log('Final check: Category tags container:', categoryTagsContainer);
    console.log('Final check: Home video grid:', homeVideoGrid);
    console.log('Final check: Trending video grid:', trendingVideoGrid);
    console.log('Final check: Music video grid:', musicVideoGrid);
    console.log('Final check: Loading overlay element:', loadingOverlay);


    // Explicitly ensure the account menu and language submenu are hidden on load
    if (accountMenu) {
        accountMenu.classList.remove('show');
        console.log('Account menu hidden on load. accountMenu:', accountMenu);
    }
    if (languageSubmenu) {
        languageSubmenu.classList.remove('show');
        console.log('Language submenu hidden on load. languageSubmenu:', languageSubmenu);
    }

    // Initialize sidebar state based on screen width
    if (sidebar) {
        if (window.innerWidth < 1024) { // On smaller screens, start collapsed
            sidebar.classList.add('collapsed');
            console.log('Sidebar initialized as collapsed on mobile.');
        } else { // On larger screens, start expanded
            sidebar.classList.remove('collapsed');
            console.log('Sidebar initialized as expanded on desktop.');
        }
    }


    // --- 翻譯模擬函數 ---
    async function fetchTranslation(lang, key) {
        // 從導入的 translations 物件中獲取翻譯
        const translatedText = translations[lang] ? translations[lang][key] : null;

        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 100));
        return translatedText;
    }

    /**
     * Applies translations to all elements with data-i18n-key attribute.
     * @param {string} lang - The language code (e.g., 'en', 'ja', 'zh-TW', 'zh-CN').
     */
    async function applyTranslations(lang) {
        if (loadingOverlay) {
            loadingOverlay.classList.add('show'); // 顯示載入遮罩
        }
        document.documentElement.lang = lang; // Update HTML lang attribute

        const elements = document.querySelectorAll('[data-i18n-key]');
        for (const element of elements) {
            const key = element.getAttribute('data-i18n-key');
            const translatedText = await fetchTranslation(lang, key);

            if (translatedText !== null) {
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.placeholder = translatedText;
                } else {
                    element.textContent = translatedText;
                }
            } else {
                console.warn(`Translation key '${key}' not found for language '${lang}'`);
            }
        }

        // 特別處理動態內容，例如影片卡片視圖和直播徽章
        // 重新渲染網格以將新語言應用於動態文本
        // 確保這些元素在調用前不為 null
        if (homeVideoGrid) await renderVideoGrid(homeVideoGrid, getRandomVideos(10, currentSelectedCategory));
        if (trendingVideoGrid) await renderVideoGrid(trendingVideoGrid, getRandomVideos(5, currentSelectedCategory));
        if (musicVideoGrid) await renderVideoGrid(musicVideoGrid, getRandomVideos(5, currentSelectedCategory));

        if (loadingOverlay) {
            loadingOverlay.classList.remove('show'); // 隱藏載入遮罩
        }
    }

    // Sidebar toggle function
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    } else {
        console.error(`Sidebar toggle button (${sidebarToggle}) or sidebar element (${sidebar}) not found. Cannot attach sidebar toggle listener.`);
    }


    // Close sidebar when clicking main content area (mobile only)
    if (mainContent && sidebar) {
        mainContent.addEventListener('click', () => {
            // Only close if sidebar is currently open and on mobile size
            if (window.innerWidth < 1024 && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
            }
        });
    } else {
        console.error(`Main content area (${mainContent}) or sidebar element (${sidebar}) not found. Cannot attach main click listener.`);
    }

    /**
     * Show message box
     * @param {string} messageKey - Message key from translations
     * @param {object} params - Parameters to replace in the message
     */
    async function showMessage(messageKey, params = {}) {
        let message = await fetchTranslation(currentLang, messageKey);
        if (message) {
             // 替換佔位符
            for (const key in params) {
                message = message.replace(`{${key}}`, params[key]);
            }
        } else {
            message = `Translation for "${messageKey}" not found.`;
        }

        if (messageBox) {
            messageBox.textContent = message;
            messageBox.classList.add('show');
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 2000); // Hide after 2 seconds
        } else {
            console.error("Message box element not found. Cannot display message.");
        }
    }

    /**
     * Create video card element
     * @param {object} video - Video data object
     * @param {boolean} isMainGrid - Whether it's for the main grid layout (affects styling)
     * @returns {HTMLElement} - Video card DOM element
     */
    async function createVideoCard(video, isMainGrid = true) {
        const videoCard = document.createElement('div');
        videoCard.className = `bg-gray-800 rounded-xl shadow-lg cursor-pointer transition duration-300 ease-in-out overflow-hidden border border-gray-700 video-card-hover ${isMainGrid ? '' : 'flex items-start gap-3'}`;
        videoCard.setAttribute('data-video-id', video.id);
        videoCard.setAttribute('data-video-title', video.title);
        videoCard.setAttribute('data-video-description', video.description);
        videoCard.addEventListener('click', () => {
            // Navigate to video playback page
            window.location.href = `video_playback.html?id=${video.id}`;
        });

        // Video thumbnail
        const thumbnailContainer = document.createElement('div');
        if (isMainGrid) {
            thumbnailContainer.className = 'thumbnail-container'; // Maintain 16:9 aspect ratio
        } else {
            thumbnailContainer.className = 'w-36 h-20 flex-shrink-0 rounded-lg overflow-hidden'; // Fixed size
        }
        const thumbnail = document.createElement('img');
        thumbnail.src = video.thumbnail;
        thumbnail.alt = video.title;
        thumbnail.className = 'w-full h-full object-cover';
        thumbnailContainer.appendChild(thumbnail);

        // Live badge
        if (video.isLive) {
            const liveBadge = document.createElement('span');
            liveBadge.className = 'absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10';
            liveBadge.textContent = await fetchTranslation(currentLang, 'live_badge'); // Use translated text
            thumbnailContainer.appendChild(liveBadge);
        }

        videoCard.appendChild(thumbnailContainer);

        // Video info (title, channel, views, upload time)
        const videoInfo = document.createElement('div');
        videoInfo.className = `p-4 ${isMainGrid ? '' : 'flex-1 overflow-hidden'}`;

        const title = document.createElement('h4');
        title.className = `font-semibold text-cyan-300 ${isMainGrid ? 'text-base line-clamp-2' : 'text-sm line-clamp-2'}`;
        title.textContent = video.title;

        const channelContainer = document.createElement('p');
        channelContainer.className = 'text-gray-400 text-sm mt-1 flex items-center';
        channelContainer.textContent = video.channel;
        if (video.isVerified) {
            // Verified icon is now Font Awesome
            const verifiedIcon = document.createElement('i');
            verifiedIcon.className = 'fas fa-check-circle text-blue-400 ml-2'; // Font Awesome class and Tailwind color
            channelContainer.appendChild(verifiedIcon);
        }

        const meta = document.createElement('p');
        meta.className = 'text-gray-500 text-xs';
        const viewsSuffix = await fetchTranslation(currentLang, 'views_suffix');
        meta.textContent = `${video.views}${viewsSuffix} • ${video.uploadTime}`; // Use translated suffix

        videoInfo.appendChild(title);
        videoInfo.appendChild(channelContainer);
        videoInfo.appendChild(meta);

        videoCard.appendChild(videoInfo);

        return videoCard;
    }

    /**
     * Render video grid
     * @param {HTMLElement} container - Grid container DOM element
     * @param {Array<object>} videoData - Array of video data to render
     * @param {boolean} isMainGrid - Whether it's for the main grid layout
     */
    async function renderVideoGrid(container, videoData, isMainGrid = true) {
        if (container) { // Added null check
            container.innerHTML = ''; // Clear existing content
            for (const video of videoData) {
                const card = await createVideoCard(video, isMainGrid);
                container.appendChild(card);
            }
        } else {
            console.error("Video grid container not found. Cannot render videos.");
        }
    }

    // Randomly select some videos to populate the grid
    function getRandomVideos(count, category = 'All Data') {
        let filteredVideos = videos;
        if (category !== 'All Data') {
            filteredVideos = videos.filter(video => video.category === category);
        }
        const shuffled = [...filteredVideos].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Initial rendering
    await applyTranslations(currentLang); // Apply default language

    // Category tag click event
    if (categoryTagsContainer) { // Added null check
        categoryTagsContainer.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', async (event) => {
                const selectedCategory = event.currentTarget.dataset.category;
                currentSelectedCategory = selectedCategory; // Update the tracked category
                categoryTagsContainer.querySelectorAll('.category-tag').forEach(t => {
                    t.classList.remove('border-cyan-400', 'bg-cyan-900');
                    t.classList.add('bg-gray-700', 'border-gray-600');
                });
                event.currentTarget.classList.remove('bg-gray-700', 'border-gray-600');
                event.currentTarget.classList.add('border-cyan-400', 'bg-cyan-900');

                // Ensure these elements are not null before rendering
                if (homeVideoGrid) await renderVideoGrid(homeVideoGrid, getRandomVideos(10, selectedCategory));
                if (trendingVideoGrid) await renderVideoGrid(trendingVideoGrid, getRandomVideos(5, selectedCategory));
                if (musicVideoGrid) await renderVideoGrid(musicVideoGrid, getRandomVideos(5, selectedCategory));

                // 獲取分類標籤的文本
                let categoryText = ''; // Declare categoryText here
                if (event.currentTarget) {
                    const textSpan = event.currentTarget.querySelector('span[data-i18n-key]');
                    if (textSpan && textSpan.textContent !== null) {
                        categoryText = textSpan.textContent.trim();
                    } else if (event.currentTarget.textContent !== null) {
                        categoryText = event.currentTarget.textContent.trim();
                    } else {
                        console.error("Failed to get textContent for clicked category tag.");
                    }
                } else {
                    console.error("Category tag is null/undefined on click.");
                }
                await showMessage('message_filtered_by', { filtered_category: categoryText });
            });
        });

        // Default select "All" tag
        const allTag = categoryTagsContainer.querySelector('[data-category="All Data"]');
        if (allTag) {
            allTag.classList.add('border-cyan-400', 'bg-cyan-900');
            allTag.classList.remove('bg-gray-700', 'border-gray-600');
        }
    } else {
        console.error("Category tags container not found. Cannot attach category tag listeners.");
    }


    // User avatar click event
    if (userAvatar && accountMenu && languageSubmenu) {
        userAvatar.addEventListener('click', (event) => {
            event.stopPropagation();
            accountMenu.classList.toggle('show');
            if (!accountMenu.classList.contains('show')) {
                languageSubmenu.classList.remove('show');
            }
        });
    } else {
        console.error(`User avatar (${userAvatar}), account menu (${accountMenu}), or language submenu (${languageSubmenu}) element not found. Cannot attach user avatar click listener.`);
    }


    // Toggle language submenu visibility
    if (languageOption && languageSubmenu) {
        languageOption.addEventListener('click', (event) => {
            event.stopPropagation();
            languageSubmenu.classList.toggle('show');
        });
    } else {
        console.error(`Language option (${languageOption}) or language submenu (${languageSubmenu}) element not found. Cannot attach language option click listener.`);
    }


    // Handle language selection
    if (languageSubmenu && accountMenu) {
        languageSubmenu.querySelectorAll('a').forEach(langItem => {
            langItem.addEventListener('click', async (event) => {
                event.preventDefault();
                const selectedLang = event.currentTarget.dataset.lang;
                currentLang = selectedLang; // Update current language
                await applyTranslations(currentLang); // Apply new language
                await showMessage('message_language_set', { selected_language: event.currentTarget.textContent.trim() });
                accountMenu.classList.remove('show');
                languageSubmenu.classList.remove('show');
            });
        });
    } else {
        console.error(`Language submenu (${languageSubmenu}) or account menu (${accountMenu}) element not found. Cannot attach language selection listeners.`);
    }


    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        // Ensure elements exist before checking contains
        const isClickInsideUserAvatar = userAvatar && userAvatar.contains(event.target);
        const isClickInsideAccountMenu = accountMenu && accountMenu.contains(event.target);

        if (!isClickInsideUserAvatar && !isClickInsideAccountMenu) {
            if (accountMenu) accountMenu.classList.remove('show');
            if (languageSubmenu) languageSubmenu.classList.remove('show');
        }
    });


    // Close menu when clicking on an item within the menu (excluding language option itself)
    if (accountMenu && languageSubmenu) {
        accountMenu.querySelectorAll('li:not(#language-option) > a').forEach(item => {
            item.addEventListener('click', async () => {
                accountMenu.classList.remove('show');
                languageSubmenu.classList.remove('show');
                // 獲取帳戶選單項目的文本
                let clickedItemText = '';
                if (item) {
                    const textSpan = item.querySelector('span[data-i18n-key]');
                    if (textSpan && textSpan.textContent !== null) {
                        clickedItemText = textSpan.textContent.trim();
                    } else if (item.textContent !== null) {
                        clickedItemText = item.textContent.trim();
                    } else {
                        console.error("Failed to get textContent for clicked account menu item.");
                    }
                } else {
                    console.error("Account menu item is null/undefined on click.");
                }
                await showMessage('message_clicked', { clicked_item: clickedItemText });
            });
        });
    } else {
        console.warn(`Account menu (${accountMenu}) or language submenu (${languageSubmenu}) element not found. Menu item click listeners might not work as expected.`);
    }
});
