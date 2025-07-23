import { videos } from './data/videos.js'; // 從獨立檔案引入影片資料
import { translations } from './data/translations.js'; // 從獨立檔案引入翻譯資料

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const sidebarContainer = document.getElementById('sidebar-container');
    const accountMenuContainer = document.getElementById('account-menu-container');
    const mainContent = document.getElementById('main-content'); // Main content area for closing sidebar
    const messageBox = document.getElementById('message-box');
    const loadingOverlayContainer = document.getElementById('loading-overlay-container'); // New container for loading overlay
    const overlay = document.getElementById('overlay'); // Get the new overlay element

    let loadingOverlay = null; // Will be set after loading the component

    // Video Player Elements
    const videoElement = document.getElementById('video-element');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const volumeButton = document.getElementById('volume-button');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const progressHandle = document.getElementById('progress-handle');
    const currentTimeElement = document.getElementById('current-time');
    const durationElement = document.getElementById('duration');
    const captionsButton = document.getElementById('captions-button');
    const settingsButton = document.getElementById('settings-button');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const customVideoPlayer = document.getElementById('custom-video-player'); // The container for the video and its controls

    let currentLang = 'en'; // Default language
    let isDraggingProgressBar = false; // Flag for progress bar dragging

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
    console.log('Final check: Video element:', videoElement);
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

        // 重新載入影片詳細資訊和相關影片以應用新語言
        const urlParams = new URLSearchParams(window.location.search);
        const videoIdFromUrl = urlParams.get('id');
        const currentVideoId = videoIdFromUrl || videos[0].id; // 預設載入第一個影片

        await loadVideoDetails(currentVideoId);
        await renderRelatedVideos(currentVideoId);

        // Note: loadingOverlay.classList.remove('show') is now handled inside loadVideoDetails
        // after the video is ready to play.
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

    /**
     * Formats time in HH:MM:SS or MM:SS format.
     * @param {number} seconds - The time in seconds.
     * @returns {string} Formatted time string.
     */
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const pad = (num) => String(num).padStart(2, '0');
        if (h > 0) {
            return `${pad(h)}:${pad(m)}:${pad(s)}`;
        }
        return `${pad(m)}:${pad(s)}`;
    }

    // --- Video Player Controls Logic ---

    // Play/Pause Toggle
    if (playPauseButton && videoElement) {
        playPauseButton.addEventListener('click', () => {
            if (videoElement.paused || videoElement.ended) {
                videoElement.play();
                playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                videoElement.pause();
                playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    }

    // Volume Control
    if (volumeSlider && videoElement && volumeButton) {
        volumeSlider.addEventListener('input', () => {
            videoElement.volume = volumeSlider.value;
            if (videoElement.volume === 0) {
                volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else if (videoElement.volume < 0.5) {
                volumeButton.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                volumeButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        });

        volumeButton.addEventListener('click', () => {
            if (videoElement.volume === 0) {
                videoElement.volume = volumeSlider.value > 0 ? volumeSlider.value : 0.5; // Restore previous volume or default
                volumeButton.innerHTML = videoElement.volume < 0.5 ? '<i class="fas fa-volume-down"></i>' : '<i class="fas fa-volume-up"></i>';
            } else {
                videoElement.volume = 0;
                volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
            volumeSlider.value = videoElement.volume;
        });
    }

    // Progress Bar
    if (progressBarContainer && progressBar && progressHandle && videoElement && currentTimeElement && durationElement) {
        videoElement.addEventListener('timeupdate', () => {
            if (!isDraggingProgressBar) {
                const progress = (videoElement.currentTime / videoElement.duration) * 100;
                progressBar.style.width = `${progress}%`;
                progressHandle.style.left = `${progress}%`;
            }
            currentTimeElement.textContent = formatTime(videoElement.currentTime);
        });

        videoElement.addEventListener('loadedmetadata', () => {
            durationElement.textContent = formatTime(videoElement.duration);
        });

        progressBarContainer.addEventListener('mousedown', (e) => {
            isDraggingProgressBar = true;
            updateProgressBar(e);
            videoElement.pause();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDraggingProgressBar) {
                updateProgressBar(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDraggingProgressBar) {
                isDraggingProgressBar = false;
                videoElement.play();
            }
        });

        function updateProgressBar(e) {
            const rect = progressBarContainer.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            if (clickX < 0) clickX = 0;
            if (clickX > rect.width) clickX = rect.width;

            const newTime = (clickX / rect.width) * videoElement.duration;
            videoElement.currentTime = newTime;

            const progress = (newTime / videoElement.duration) * 100;
            progressBar.style.width = `${progress}%`;
            progressHandle.style.left = `${progress}%`;
        }
    }

    // Fullscreen Toggle
    if (fullscreenButton && customVideoPlayer) {
        fullscreenButton.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            } else {
                customVideoPlayer.requestFullscreen();
                fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });
    }

    // Captions Toggle (Placeholder functionality)
    if (captionsButton && videoElement) {
        captionsButton.addEventListener('click', async () => {
            // This is a placeholder. Real caption implementation would involve:
            // 1. Checking if video has text tracks (e.g., <track kind="captions" src="captions.vtt" srclang="en" label="English">)
            // 2. Iterating through videoElement.textTracks to find and enable/disable them.
            // For now, it just shows a message.
            await showMessage('message_clicked', { clicked_item: 'Captions Toggle' });
            console.log("Captions toggle clicked. (Placeholder - real caption logic needed)");
        });
    }

    // Settings Button (Placeholder functionality)
    if (settingsButton) {
        settingsButton.addEventListener('click', async () => {
            await showMessage('message_clicked', { clicked_item: 'Settings' });
            console.log("Settings button clicked. (Placeholder - real settings logic needed)");
        });
    }

    // Previous/Next Video Logic
    let currentVideoIndex = 0; // Track the index of the currently playing video

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', async () => {
            currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
            const newVideoId = videos[currentVideoIndex].id;
            // Update URL to watch.html
            window.history.pushState({}, '', `watch.html?id=${newVideoId}`);
            await loadVideoDetails(newVideoId);
            await renderRelatedVideos(newVideoId);
        });

        nextButton.addEventListener('click', async () => {
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;
            const newVideoId = videos[currentVideoIndex].id;
            // Update URL to watch.html
            window.history.pushState({}, '', `watch.html?id=${newVideoId}`);
            await loadVideoDetails(newVideoId);
            await renderRelatedVideos(newVideoId);
        });
    }

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
            if (videoElement) {
                videoElement.src = video.videoUrl; // Use videoUrl for custom player
                videoElement.load(); // Load the new video
                // Do NOT play immediately. Wait for the loading overlay to be removed.
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
            if (videoElement) {
                videoElement.src = ''; // Clear video source
                videoElement.pause();
                videoElement.innerHTML = `<source src="" type="video/mp4">`; // Clear sources
                playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
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

        // Hide loading overlay and then play the video
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
            // Only play if a video was found and loaded
            if (video && videoElement) {
                videoElement.play();
                playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; // Ensure play icon is updated
            }
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
    const initialVideoId = videoIdFromUrl || videos[0].id; // Use ID from URL or default to first video

    await loadVideoDetails(initialVideoId);
    await renderRelatedVideos(initialVideoId);
    await applyTranslations(currentLang); // Apply translations after initial load
});
