import { videos } from './data/videos.js'; // 從獨立檔案引入影片資料
import { translations } from './data/translations.js'; // 從獨立檔案引入翻譯資料

// Removed YouTube player variable and onYouTubeIframeAPIReady as we're not using the API directly
// let player;
// let youtubePlayerReady = false;

// Removed onYouTubeIframeAPIReady function

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const sidebarContainer = document.getElementById('sidebar-container');
    const accountMenuContainer = document.getElementById('account-menu-container');
    const mainContent = document.getElementById('main-content'); // Main content area for closing sidebar
    const messageBox = document.getElementById('message-box');
    const loadingOverlayContainer = document.getElementById('loading-overlay-container'); // New container for loading overlay
    const overlay = document.getElementById('overlay'); // Get the new overlay element

    let loadingOverlay = null; // Will be set after loading the component

    // Video Player Elements (now controlling YouTube iframe src directly)
    const youtubeIframe = document.getElementById('youtube-player'); // Get the YouTube iframe element
    // Removed custom control elements as they are no longer needed
    // const playPauseButton = document.getElementById('play-pause-button');
    // const prevButton = document.getElementById('prev-button');
    // const nextButton = document.getElementById('next-button');
    // const volumeButton = document.getElementById('volume-button');
    // const volumeSlider = document.getElementById('volume-slider');
    // const progressBarContainer = document.getElementById('progress-bar-container');
    // const progressBar = document.getElementById('progress-bar');
    // const progressHandle = document.getElementById('progress-handle');
    // const currentTimeElement = document.getElementById('current-time');
    // const durationElement = document.getElementById('duration');
    // const captionsButton = document.getElementById('captions-button');
    // const settingsButton = document.getElementById('settings-button');
    // const fullscreenButton = document.getElementById('fullscreen-button');
    const customVideoPlayer = document.getElementById('custom-video-player'); // The container for the video and its controls

    let currentLang = 'en'; // Default language
    // Removed isDraggingProgressBar and intervalId as they are for custom controls
    // let isDraggingProgressBar = false;
    // let intervalId;

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

    // Get elements after components are loaded
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const userAvatar = document.getElementById('user-avatar');
    const accountMenu = document.getElementById('account-menu');
    const languageOption = document.getElementById('language-option');
    const languageSubmenu = document.getElementById('language-submenu');

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
    console.log('Final check: Related videos grid:', relatedVideosGrid);
    console.log('Final check: Overlay element:', overlay);
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

    // Initialize sidebar state for video playback page: always collapsed and floating
    if (sidebar) {
        sidebar.classList.add('collapsed', 'video-page-sidebar-floating');
        console.log('Sidebar initialized as collapsed and floating on video page.');
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

        // Re-load video details and related videos to apply new language
        const urlParams = new URLSearchParams(window.location.search);
        const videoIdFromUrl = urlParams.get('id');
        const currentVideoId = videoIdFromUrl || videos[0].id; // Default to first video

        await loadVideoDetails(currentVideoId);
        await renderRelatedVideos(currentVideoId);

        // Hide loading overlay after translations and content load
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
        }
    }

    // Sidebar toggle function
    if (sidebarToggle && sidebar && overlay) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            overlay.classList.toggle('show');
        });
    } else {
        console.error(`Sidebar toggle button (${sidebarToggle}), sidebar element (${sidebar}), or overlay (${overlay}) not found. Cannot attach sidebar toggle listener.`);
    }


    // Close sidebar when clicking main content area or overlay
    if (mainContent && sidebar && overlay) {
        mainContent.addEventListener('click', (event) => {
            // Check if the click was *outside* the sidebar itself
            if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                if (!sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                    overlay.classList.remove('show');
                }
            }
        });
        overlay.addEventListener('click', () => {
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                overlay.classList.remove('show');
            }
        });
    } else {
        console.error(`Main content area (${mainContent}), sidebar element (${sidebar}), or overlay (${overlay}) not found. Cannot attach main/overlay click listener.`);
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

    // Removed formatTime function as it's for custom controls

    // Removed all custom video player control logic (Play/Pause, Volume, Progress Bar, Fullscreen, Captions, Settings)
    // as we are now using the default YouTube iframe.

    // Previous/Next Video Logic (simplified to just load new video details)
    let currentVideoIndex = 0; // Track the index of the currently playing video

    // These buttons are removed from HTML, so this block might become unreachable.
    // Keeping it for now in case the user wants to re-add them for general navigation.
    // if (prevButton && nextButton) { // These elements no longer exist
    //     prevButton.addEventListener('click', async () => {
    //         currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    //         const newVideoId = videos[currentVideoIndex].id;
    //         window.history.pushState({}, '', `watch.html?id=${newVideoId}`);
    //         await loadVideoDetails(newVideoId);
    //         await renderRelatedVideos(newVideoId);
    //     });

    //     nextButton.addEventListener('click', async () => {
    //         currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    //         const newVideoId = videos[currentVideoIndex].id;
    //         window.history.pushState({}, '', `watch.html?id=${newVideoId}`);
    //         await loadVideoDetails(newVideoId);
    //         await renderRelatedVideos(newVideoId);
    //     });
    // }

    /**
     * Loads details for a specific video and updates the player.
     * @param {string} videoId - The ID of the video to load.
     */
    async function loadVideoDetails(videoId) {
        if (loadingOverlay) {
            loadingOverlay.classList.add('show'); // 顯示載入遮罩
        }

        const video = videos.find((v, index) => {
            if (v.id === videoId) {
                currentVideoIndex = index; // Update current index when video is found
                return true;
            }
            return false;
        });

        if (video) {
            const youtubeVideoId = video.youtubeId; // Directly use youtubeId from videos.js

            if (youtubeIframe) {
                // Set the iframe src directly for default YouTube player
                // autoplay=0 to prevent immediate autoplay on page load/navigation
                youtubeIframe.src = `https://www.youtube.com/embed/${youtubeVideoId}?controls=1&autoplay=0`;
            }

            if (videoTitleElement) videoTitleElement.textContent = video.title;
            // Update the document title (browser tab title)
            document.title = video.title + ' - LumiStream Realm';

            if (channelAvatarElement) channelAvatarElement.textContent = video.channel.charAt(0).toUpperCase();
            if (channelNameElement) {
                channelNameElement.innerHTML = video.channel; // Use innerHTML to clear previous verified icon
                if (video.isVerified) {
                    const verifiedIcon = document.createElement('i');
                    verifiedIcon.className = 'fas fa-check-circle text-blue-400 ml-2';
                    channelNameElement.appendChild(verifiedIcon);
                }
            }

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
            // Handle video not found
            if (youtubeIframe) {
                youtubeIframe.src = `about:blank`; // Clear iframe content
            }
            if (videoTitleElement) videoTitleElement.textContent = await fetchTranslation(currentLang, 'video_not_found'); // Use translated message
            document.title = await fetchTranslation(currentLang, 'video_not_found') + ' - LumiStream Realm'; // Update title for not found
            if (channelAvatarElement) channelAvatarElement.textContent = '';
            if (channelNameElement) channelNameElement.textContent = '';
            if (channelSubscribersElement) channelSubscribersElement.textContent = '';
            if (videoMetaElement) videoMetaElement.textContent = '';
            if (videoDescriptionElement) videoDescriptionElement.textContent = '';
            console.error(`Video with ID ${videoId} not found.`);
        }

        // Hide loading overlay immediately after content is loaded
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
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
            // Update URL to watch.html
            window.history.pushState({}, '', `watch.html?id=${video.id}`);
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

    // Initial video player setup
    async function initializeVideoPlayer() {
        const urlParams = new URLSearchParams(window.location.search);
        const videoIdFromUrl = urlParams.get('id');
        const initialVideoId = videoIdFromUrl || videos[0].id; // Use ID from URL or default to first video

        await loadVideoDetails(initialVideoId);
        await renderRelatedVideos(initialVideoId);
        await applyTranslations(currentLang); // Apply translations after initial load
    }

    // Removed onPlayerReady and onPlayerStateChange functions

    // Call initializeVideoPlayer when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeVideoPlayer();
    } else {
        document.addEventListener('DOMContentLoaded', initializeVideoPlayer);
    }
});
