import { videos } from './data/videos.js'; // 從獨立檔案引入影片資料

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const sidebarContainer = document.getElementById('sidebar-container');
    const accountMenuContainer = document.getElementById('account-menu-container');
    const mainContent = document.getElementById('main-content');
    const messageBox = document.getElementById('message-box');
    const loadingOverlay = document.getElementById('loading-overlay');

    let currentLang = 'en'; // Default language
    let currentSelectedCategory = 'All Data'; // Track the currently selected category

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
    // video_list.html 的內容現在直接在 index.html 中，所以不需要再次載入 mainContent

    // Add a small delay to ensure DOM has settled after dynamic insertions
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay

    // Get elements after components are loaded (and main content is parsed)
    // Re-querying these elements to ensure they are available after dynamic content insertion
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


    // Explicitly ensure the account menu and language submenu are hidden on load
    if (accountMenu) {
        accountMenu.classList.remove('show');
        console.log('Account menu hidden on load. accountMenu:', accountMenu);
    }
    if (languageSubmenu) {
        languageSubmenu.classList.remove('show');
        console.log('Language submenu hidden on load. languageSubmenu:', languageSubmenu);
    }

    // Initialize sidebar state for mobile
    if (sidebar) {
        if (window.innerWidth < 1024) { // Apply hidden class only on smaller screens
            sidebar.classList.add('hidden-mobile');
            console.log('Sidebar initialized as hidden on mobile.');
        } else {
            sidebar.classList.remove('hidden-mobile'); // Ensure visible on desktop
            console.log('Sidebar initialized as visible on desktop.');
        }
    }


    // --- 翻譯模擬函數 ---
    async function fetchTranslation(lang, key) {
        const simulatedTranslations = {
            "en": {
                "title": "LumiStream Realm - Future Video Platform",
                "app_name": "LumiStream Realm",
                "search_placeholder": "Search videos...",
                "upload_button_text": "Upload Video",
                "sidebar_home_text": "Home",
                "sidebar_explore_text": "Explore",
                "sidebar_subscriptions_text": "Subscriptions",
                "sidebar_library_text": "Library",
                "sidebar_history_text": "History",
                "sidebar_your_videos_text": "Your Videos",
                "sidebar_watch_later_text": "Watch Later",
                "sidebar_liked_videos_text": "Liked Videos",
                "sidebar_more": "More",
                "sidebar_settings_text": "Settings",
                "sidebar_help_text": "Help",
                "sidebar_feedback_text": "Feedback",
                "categories_title": "Categories",
                "category_all_text": "All",
                "category_tech_text": "Tech",
                "category_space_text": "Space",
                "category_ai_text": "AI",
                "category_life_science_text": "Life Science",
                "category_history_text": "History",
                "recommended_title": "Recommended for You",
                "trending_title": "Trending Videos",
                "music_title": "Music",
                "live_badge": "LIVE",
                "views_suffix": " views",
                "footer_text": "© 2025 LumiStream Realm. All rights reserved.",
                "account_menu_channel_text": "My Channel",
                "account_menu_settings_text": "Settings",
                "account_menu_language_text": "Language",
                "account_menu_help_text": "Help",
                "account_menu_feedback_text": "Feedback",
                "account_menu_signout_text": "Sign Out",
                "message_filtered_by": "Filtered by: {filtered_category}",
                "message_language_set": "Language set to: {selected_language}",
                "message_clicked": "Clicked: {clicked_item}"
            },
            "ja": {
                "title": "LumiStream Realm - 未来の動画プラットフォーム",
                "app_name": "LumiStream Realm",
                "search_placeholder": "動画を検索...",
                "upload_button_text": "動画をアップロード",
                "sidebar_home_text": "ホーム",
                "sidebar_explore_text": "探索",
                "sidebar_subscriptions_text": "登録チャンネル",
                "sidebar_library_text": "ライブラリ",
                "sidebar_history_text": "履歴",
                "sidebar_your_videos_text": "あなたの動画",
                "sidebar_watch_later_text": "後で見る",
                "sidebar_liked_videos_text": "高く評価した動画",
                "sidebar_more": "その他",
                "sidebar_settings_text": "設定",
                "sidebar_help_text": "ヘルプ",
                "sidebar_feedback_text": "フィードバック",
                "categories_title": "カテゴリ",
                "category_all_text": "すべて",
                "category_tech_text": "テクノロジー",
                "category_space_text": "宇宙探査",
                "category_ai_text": "AI",
                "category_life_science_text": "生命科学",
                "category_history_text": "歴史",
                "recommended_title": "あなたへのおすすめ",
                "trending_title": "トレンド動画",
                "music_title": "音楽",
                "live_badge": "ライブ中",
                "views_suffix": " 回視聴",
                "footer_text": "© 2025 LumiStream Realm. 無断複写・転載を禁じます。",
                "account_menu_channel_text": "マイチャンネル",
                "account_menu_settings_text": "設定",
                "account_menu_language_text": "言語",
                "account_menu_help_text": "ヘルプ",
                "account_menu_feedback_text": "フィードバック",
                "account_menu_signout_text": "ログアウト",
                "message_filtered_by": "フィルタリング済み: {filtered_category}",
                "message_language_set": "言語設定: {selected_language}",
                "message_clicked": "クリック: {clicked_item}"
            },
            "zh-TW": {
                "title": "LumiStream Realm - 未來影音平台",
                "app_name": "LumiStream Realm",
                "search_placeholder": "搜尋影片...",
                "upload_button_text": "上傳影片",
                "sidebar_home_text": "首頁",
                "sidebar_explore_text": "探索",
                "sidebar_subscriptions_text": "訂閱",
                "sidebar_library_text": "媒體庫",
                "sidebar_history_text": "觀看紀錄",
                "sidebar_your_videos_text": "我的影片",
                "sidebar_watch_later_text": "稍後觀看",
                "sidebar_liked_videos_text": "喜歡的影片",
                "sidebar_more": "更多",
                "sidebar_settings_text": "設定",
                "sidebar_help_text": "協助",
                "sidebar_feedback_text": "意見回饋",
                "categories_title": "分類",
                "category_all_text": "全部",
                "category_tech_text": "科技",
                "category_space_text": "探索宇宙",
                "category_ai_text": "人工智慧",
                "category_life_science_text": "生命科學",
                "category_history_text": "歷史",
                "recommended_title": "為您推薦",
                "trending_title": "熱門影片",
                "music_title": "音樂",
                "live_badge": "直播中",
                "views_suffix": " 次觀看",
                "footer_text": "© 2025 LumiStream Realm. 版權所有。",
                "account_menu_channel_text": "我的頻道",
                "account_menu_settings_text": "設定",
                "account_menu_language_text": "語言",
                "account_menu_help_text": "協助",
                "account_menu_feedback_text": "意見回饋",
                "account_menu_signout_text": "登出",
                "message_filtered_by": "已篩選：{filtered_category}",
                "message_language_set": "語言已設定為：{selected_language}",
                "message_clicked": "點擊了：{clicked_item}"
            },
            "zh-CN": {
                "title": "LumiStream Realm - 未来视频平台",
                "app_name": "LumiStream Realm",
                "search_placeholder": "搜索视频...",
                "upload_button_text": "上传视频",
                "sidebar_home_text": "首页",
                "sidebar_explore_text": "探索",
                "sidebar_subscriptions_text": "订阅",
                "sidebar_library_text": "媒体库",
                "sidebar_history_text": "观看历史",
                "sidebar_your_videos_text": "我的视频",
                "sidebar_watch_later_text": "稍后观看",
                "sidebar_liked_videos_text": "喜欢的视频",
                "sidebar_more": "更多",
                "sidebar_settings_text": "设置",
                "sidebar_help_text": "帮助",
                "sidebar_feedback_text": "反馈",
                "categories_title": "分类",
                "category_all_text": "全部",
                "category_tech_text": "科技",
                "category_space_text": "探索宇宙",
                "category_ai_text": "人工智能",
                "category_life_science_text": "生命科学",
                "category_history_text": "历史",
                "recommended_title": "为您推荐",
                "trending_title": "热门视频",
                "music_title": "音乐",
                "live_badge": "直播中",
                "views_suffix": " 次观看",
                "footer_text": "© 2025 LumiStream Realm. 版权所有。",
                "account_menu_channel_text": "我的频道",
                "account_menu_settings_text": "设置",
                "account_menu_language_text": "语言",
                "account_menu_help_text": "帮助",
                "account_menu_feedback_text": "反馈",
                "account_menu_signout_text": "退出登录",
                "message_liked": "已喜欢此视频！",
                "message_disliked": "已不喜欢此视频！",
                "message_shared": "视频已分享！",
                "message_saved": "视频已保存！",
                "message_subscribed": "已订阅频道！",
                "message_comment_added": "评论已添加！",
                "message_filtered_by": "已筛选：{filtered_category}",
                "message_language_set": "语言已设置为：{selected_language}",
                "message_clicked": "点击了：{clicked_item}"
            }
        };

        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 100));
        return simulatedTranslations[lang] ? simulatedTranslations[lang][key] : null;
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
            sidebar.classList.toggle('hidden-mobile');
        });
    } else {
        console.error(`Sidebar toggle button (${sidebarToggle}) or sidebar element (${sidebar}) not found. Cannot attach sidebar toggle listener.`);
    }


    // Close sidebar when clicking main content area (mobile only)
    if (mainContent && sidebar) {
        mainContent.addEventListener('click', () => {
            // Only close if sidebar is currently open and on mobile size
            if (window.innerWidth < 1024 && !sidebar.classList.contains('hidden-mobile')) {
                sidebar.classList.add('hidden-mobile');
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
    // These elements are now directly in index.html, so they should be available.
    // The null checks are already in applyTranslations and renderVideoGrid.
    // No need to re-call getRandomVideos here if applyTranslations already does it.
    // await renderVideoGrid(homeVideoGrid, getRandomVideos(10));
    // await renderVideoGrid(trendingVideoGrid, getRandomVideos(5));
    // await renderVideoGrid(musicVideoGrid, getRandomVideos(5));

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
