// 全域變數
let players = []; // 正確初始化為空陣列
let currentActiveIndex = 0; // 當前活動影片的索引
let carouselInterval; // 輪播計時器的 ID
const rotationDuration = 10000; // 輪播間隔時間 (10秒)

// YouTube IFrame Player API 準備就緒時調用的函數
function onYouTubeIframeAPIReady() {
    const videoContainers = document.querySelectorAll('.video-player');
    const videoIds = Array.from(videoContainers).map(container => container.dataset.videoId);

    videoIds.forEach((videoId, index) => {
        const playerId = `player-${index + 1}`; // 確保 ID 與 HTML 中的 div ID 匹配
        
        // 建立 YT.Player 實例
        const player = new YT.Player(playerId, {
            videoId: videoId,
            playerVars: {
                autoplay: 0, // 預設不自動播放，由 JavaScript 控制
                controls: 1, // 顯示播放器控制項
                mute: 1, // 預設靜音以符合瀏覽器自動播放政策
                enablejsapi: 1, // 啟用 JavaScript API 控制
                loop: 1, // 影片結束後循環
                playlist: videoId // 設置為單個影片的播放列表以啟用 loop
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        players.push(player);
    });

    // 初始顯示第一個影片
    if (players.length > 0) {
        showVideo(currentActiveIndex);
        startCarousel();
    }
}

// 播放器準備就緒時調用的函數
function onPlayerReady(event) {
    // 只有當前活動的影片才播放
    if (event.target === players[currentActiveIndex]) {
        event.target.playVideo();
    } else {
        // 非活動影片保持緩衝狀態或暫停
        event.target.pauseVideo(); 
    }
}

// 播放器狀態改變時調用的函數
function onPlayerStateChange(event) {
    // 狀態值：-1 (未開始), 0 (結束), 1 (播放中), 2 (暫停), 3 (緩衝中), 5 (影片已緩衝)
    if (event.data === YT.PlayerState.ENDED) {
        // 如果影片結束，由於設置了 loop: 1，它會自動循環
        // 如果不希望循環，可以在此處調用 nextVideo()
    }
}

// 播放器發生錯誤時調用的函數
function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    // 根據錯誤類型提供使用者回饋
    let errorMessage = '影片載入失敗。';
    if (event.data === 2) {
        errorMessage = '影片ID無效或影片不存在。';
    } else if (event.data === 100) {
        errorMessage = '影片因隱私設定無法播放。';
    } else if (event.data === 101 |
| event.data === 150) {
        errorMessage = '影片擁有者不允許在嵌入式播放器中播放。';
    }
    document.getElementById(`player-${currentActiveIndex + 1}`).innerHTML = `<div class="error-message">${errorMessage} 請嘗試下一個影片。</div>`;
    // 自動切換到下一個影片
    setTimeout(nextVideo, 2000); // 2秒後切換
}

// 顯示特定索引的影片
function showVideo(index) {
    players.forEach((player, i) => {
        const container = document.getElementById(`player-${i + 1}`);
        if (i === index) {
            container.classList.add('active');
            player.playVideo(); // 播放活動影片
        } else {
            container.classList.remove('active');
            player.pauseVideo(); // 暫停非活動影片
            player.seekTo(0, false); // 將非活動影片重置到開頭
        }
    });
}

// 切換到下一個影片
function nextVideo() {
    currentActiveIndex = (currentActiveIndex + 1) % players.length;
    showVideo(currentActiveIndex);
}

// 啟動輪播計時器
function startCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval); // 清除現有計時器以避免重複
    }
    carouselInterval = setInterval(nextVideo, rotationDuration);
}

// 停止輪播計時器 (如果需要手動控制)
function stopCarousel() {
    clearInterval(carouselInterval);
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// 可選：新增手動控制按鈕 (如果需要)
// 例如，在 HTML 中添加 <button onclick="nextVideo()">下一個</button>
// 或 <button onclick="players[currentActiveIndex].setVolume(100)">解除靜音</button>
