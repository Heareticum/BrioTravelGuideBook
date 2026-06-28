/**
 * iOS 加入主畫面提示
 * 用途：iOS Safari 不支援 beforeinstallprompt，沒辦法跳出原生安裝提示，
 * 所以改用一個提示卡片，引導使用者手動操作「分享 → 加入主畫面」。
 *
 * 使用方式：在每個頁面的 </body> 前引入：
 * <link rel="stylesheet" href="css/ios-install.css">（放在head）
 * <script src="js/ios-install.js"></script>
 */
(function () {
    const DISMISS_KEY = 'okinawa-ios-install-dismissed';

    // 判斷是不是 iOS 裝置（iPhone / iPad / iPod）
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // 判斷是不是用 Safari 開啟（排除 iOS 上的 Chrome、Line 內建瀏覽器等，
    // 因為這些瀏覽器的「加入主畫面」操作路徑不同，提示文字會對不上）
    function isSafari() {
        const ua = navigator.userAgent;
        return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Line/.test(ua);
    }

    // 判斷是不是已經是「加入主畫面後啟動」的狀態（已安裝就不用再提示）
    function isStandalone() {
        return window.navigator.standalone === true ||
               window.matchMedia('(display-mode: standalone)').matches;
    }

    // 判斷使用者之前有沒有按過關閉
    function isDismissed() {
        return localStorage.getItem(DISMISS_KEY) === 'true';
    }

    function shouldShowBanner() {
        return isIOS() && isSafari() && !isStandalone() && !isDismissed();
    }

    function createBanner() {
        const banner = document.createElement('div');
        banner.className = 'ios-install-banner';
        banner.id = 'iosInstallBanner';
        banner.innerHTML = `
            <button class="ios-install-close" id="iosInstallClose" aria-label="關閉提示">✕</button>
            <div class="ios-install-icon">📲</div>
            <div class="ios-install-text">
                將手冊加入主畫面，離線也能隨時查看<br>
                <span class="ios-install-sub">點擊下方分享圖示 → 加入主畫面</span>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('iosInstallClose').addEventListener('click', () => {
            localStorage.setItem(DISMISS_KEY, 'true');
            banner.remove();
        });
    }

    if (shouldShowBanner()) {
        // 延遲一點再顯示，避免使用者剛進頁面就被提示打擾
        window.addEventListener('load', () => {
            setTimeout(createBanner, 1500);
        });
    }
})();
