import { videos } from './data/videos.js'; // 從獨立檔案引入影片資料
import { translations } from './data/translations.js'; // 從獨立檔案引入翻譯資料

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const sidebarContainer = document.getElementById('sidebar-container');
    const accountMenuContainer = document.getElementById('account-menu-container');
    const mainContent = document.getElementById('main-content'); // Main content area for closing sidebar
    const messageBox = document.getElementById('message-box');
    const loadingOverlay = document.getElementById('loading-overlay');

    let currentLang = 'en'; // Default language

    // Function to load HTML components dynamically
    async function loadComponent(container, filePath) {
        if (!container) {
            console.error(`Error: Target container for ${filePath} is null. Cannot load component.`);
            return;
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
        } catch (error) {
            console.error(`Error loading component ${filePath}:`, error);
        }
    }

    // Load sidebar and account menu components
    console.log("Loading sidebar component...");
    await loadComponent(sidebarContainer, 'components/sidebar.html');
    console.log("Loading account menu component...");
    await loadComponent(accountMenuContainer, 'components/account_menu.html');

    // Add a small delay to ensure DOM has settled after dynamic insertions
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay

    // Get elements after components are loaded
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const userAvatar = document.getElementById('user-avatar');
    const accountMenu = document.getElementById('account-menu');
    const languageOption = document.getElementById('language-option');
    const languageSubmenu = document.getElementById('language-submenu');

    const videoPlayerContainer = document.getElementById('video-player-container');
    const videoTitleElement = document.getElementById('video-title');
    const channelAvatarElement = document.getElementById('channel-avatar');
    const channelNameElement = document.getElementById('channel-name');
    const channelSubscribersElement = document.getElementById('channel-subscribers');
    const videoMetaElement = document.getElementById('video-meta');
    const videoDescriptionElement = document.getElementById('video-description');
    const relatedVideosGrid = document.getElementById('related-videos-grid');

    const likeButton = document.getElementById('like-button');
    const dislikeButton = document.getElementById('dislike-button');
    const shareButton = document.getElementById('share-button');
    const saveButton = document.getElementById('save-button');
    const subscribeButton = document.querySelector('[data-i18n-key="subscribe_button_text"]');

    // Debug logs for element existence after all loads
    console.log('Final check: Sidebar element:', sidebar);
    console.log('Final check: Sidebar toggle element:', sidebarToggle);
    console.log('Final check: User avatar element:', userAvatar);
    console.log('Final check: Account menu element:', accountMenu);
    console.log('Final check: Language option element:', languageOption);
    console.log('Final check: Language submenu element:', languageSubmenu);
    console.log('Final check: Video player container:', videoPlayerContainer);
    console.log('Final check: Related videos grid:', relatedVideosGrid);


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


    // --- 翻譯函數 ---
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

        // 重新載入影片詳細資訊和相關影片以應用新語言
        // 這裡假設我們有一個預設的 videoId 或從 URL 獲取
        const urlParams = new URLSearchParams(window.location.search);
        const videoIdFromUrl = urlParams.get('id');
        const currentVideoId = videoIdFromUrl || 'dQw4w9WgXcQ'; // 預設載入的影片ID

        await loadVideoDetails(currentVideoId);
        await renderRelatedVideos(currentVideoId);

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
     * Create video card element (for related videos)
     * @param {object} video - Video data object
     * @returns {HTMLElement} - Video card DOM element
     */
    async function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.className = `bg-gray-800 rounded-xl shadow-lg cursor-pointer transition duration-300 ease-in-out overflow-hidden border border-gray-700 video-card-hover flex items-start gap-3`;
        videoCard.setAttribute('data-video-id', video.id);
        videoCard.addEventListener('click', async () => {
            // 點擊相關影片時載入新影片
            window.history.pushState({}, '', `video_playback.html?id=${video.id}`); // Update URL
            await loadVideoDetails(video.id);
            await renderRelatedVideos(video.id);
            // 滾動到頁面頂部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Video thumbnail
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'w-36 h-20 flex-shrink-0 rounded-lg overflow-hidden'; // Fixed size for related videos
        const thumbnail = document.createElement('img');
        thumbnail.src = video.thumbnail;
        thumbnail.alt = video.title;
        thumbnail.className = 'w-full h-full object-cover';
        thumbnailContainer.appendChild(thumbnail);

        // Live badge
        if (video.isLive) {
            const liveBadge = document.createElement('span');
            liveBadge.className = 'absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-1 py-0.5 rounded-md z-10';
            liveBadge.textContent = await fetchTranslation(currentLang, 'live_badge');
            thumbnailContainer.appendChild(liveBadge);
        }

        videoCard.appendChild(thumbnailContainer);

        // Video info (title, channel, views, upload time)
        const videoInfo = document.createElement('div');
        videoInfo.className = `flex-1 overflow-hidden`;

        const title = document.createElement('h4');
        title.className = `font-semibold text-cyan-300 text-sm line-clamp-2`;
        title.textContent = video.title;

        const channelContainer = document.createElement('p');
        channelContainer.className = 'text-gray-400 text-xs mt-1 flex items-center';
        channelContainer.textContent = video.channel;
        if (video.isVerified) {
            const verifiedIcon = document.createElement('i');
            verifiedIcon.className = 'fas fa-check-circle text-blue-400 ml-1';
            channelContainer.appendChild(verifiedIcon);
        }

        const meta = document.createElement('p');
        meta.className = 'text-gray-500 text-xs';
        const viewsSuffix = await fetchTranslation(currentLang, 'views_suffix');
        meta.textContent = `${video.views}${viewsSuffix} • ${video.uploadTime}`;

        videoInfo.appendChild(title);
        videoInfo.appendChild(channelContainer);
        videoInfo.appendChild(meta);

        videoCard.appendChild(videoInfo);

        return videoCard;
    }

    /**
     * Loads details for a specific video and updates the player.
     * @param {string} videoId - The ID of the video to load.
     */
    async function loadVideoDetails(videoId) {
        if (loadingOverlay) {
            loadingOverlay.classList.add('show'); // 顯示載入遮罩
        }
        const video = videos.find(v => v.id === videoId);

        if (video) {
            if (videoPlayerContainer) {
                videoPlayerContainer.innerHTML = `
                    <iframe src="https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                    </iframe>
                `;
            }
            if (videoTitleElement) videoTitleElement.textContent = video.title;
            if (channelAvatarElement) channelAvatarElement.textContent = video.channel.charAt(0).toUpperCase();
            if (channelNameElement) {
                channelNameElement.textContent = video.channel;
                if (video.isVerified) {
                    const verifiedIcon = document.createElement('i');
                    verifiedIcon.className = 'fas fa-check-circle text-blue-400 ml-2';
                    channelNameElement.appendChild(verifiedIcon);
                }
            }

            // No subscribers data in videos.js, so hardcode or remove if not needed
            // const subscribersSuffix = await fetchTranslation(currentLang, 'subscribers_suffix');
            if (channelSubscribersElement) channelSubscribersElement.textContent = `1.2M subscribers`; // Hardcoded for demo

            const viewsSuffix = await fetchTranslation(currentLang, 'views_suffix');
            if (videoMetaElement) videoMetaElement.textContent = `${video.views}${viewsSuffix} • ${video.uploadTime}`;
            if (videoDescriptionElement) videoDescriptionElement.textContent = video.description;

            // Reset like/dislike counts for new video (simple demo)
            const likeCountElement = document.getElementById('like-count');
            const dislikeCountElement = document.getElementById('dislike-count');
            if (likeCountElement) likeCountElement.textContent = Math.floor(Math.random() * 1000) + 'K';
            if (dislikeCountElement) dislikeCountElement.textContent = Math.floor(Math.random() * 100) + 'K';

        } else {
            if (videoPlayerContainer) {
                videoPlayerContainer.innerHTML = `<div class="flex items-center justify-center h-full text-red-500" data-i18n-key="video_not_found">Video not found.</div>`;
            }
            if (videoTitleElement) videoTitleElement.textContent = '';
            if (channelAvatarElement) channelAvatarElement.textContent = '';
            if (channelNameElement) channelNameElement.textContent = '';
            if (channelSubscribersElement) channelSubscribersElement.textContent = '';
            if (videoMetaElement) videoMetaElement.textContent = '';
            if (videoDescriptionElement) videoDescriptionElement.textContent = '';
            console.error(`Video with ID ${videoId} not found.`);
        }
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show'); // 隱藏載入遮罩
        }
    }

    /**
     * Renders related videos in the sidebar.
     * @param {string} currentVideoId - The ID of the currently playing video to exclude.
     */
    async function renderRelatedVideos(currentVideoId) {
        if (relatedVideosGrid) { // Added null check
            relatedVideosGrid.innerHTML = ''; // Clear existing content
            const filteredVideos = videos.filter(v => v.id !== currentVideoId);
            const shuffled = [...filteredVideos].sort(() => 0.5 - Math.random());
            const videosToDisplay = shuffled.slice(0, 6); // Display up to 6 related videos

            for (const video of videosToDisplay) {
                const card = await createVideoCard(video);
                relatedVideosGrid.appendChild(card);
            }
        } else {
            console.error("Related videos grid element not found. Cannot render related videos.");
        }
    }

    // Interaction button click handlers
    if (likeButton) {
        likeButton.addEventListener('click', async () => await showMessage('message_liked'));
    } else {
        console.error("Like button not found. Cannot attach click listener.");
    }
    if (dislikeButton) {
        dislikeButton.addEventListener('click', async () => await showMessage('message_disliked'));
    } else {
        console.error("Dislike button not found. Cannot attach click listener.");
    }
    if (shareButton) {
        shareButton.addEventListener('click', async () => await showMessage('message_shared'));
    } else {
        console.error("Share button not found. Cannot attach click listener.");
    }
    if (saveButton) {
        saveButton.addEventListener('click', async () => await showMessage('message_saved'));
    } else {
        console.error("Save button not found. Cannot attach click listener.");
    }
    if (subscribeButton) {
        subscribeButton.addEventListener('click', async () => await showMessage('message_subscribed'));
    } else {
        console.error("Subscribe button not found. Cannot attach click listener.");
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

    // Initial load of a default video and related videos
    const urlParams = new URLSearchParams(window.location.search);
    const videoIdFromUrl = urlParams.get('id');
    const initialVideoId = videoIdFromUrl || 'dQw4w9WgXcQ'; // Use ID from URL or default

    await loadVideoDetails(initialVideoId);
    await renderRelatedVideos(initialVideoId);
    await applyTranslations(currentLang); // Apply translations after initial load
});
