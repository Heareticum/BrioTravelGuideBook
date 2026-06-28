/**
 * 側邊導覽列共用邏輯
 * 使用方式：在每個頁面的 <body> 最前面放一個 <div id="nav-placeholder"></div>，
 * 並在 </body> 前引入這個檔案：<script src="js/nav.js"></script>
 */
(function () {
    // 載入導覽列 HTML 片段並插入頁面
    fetch('components/nav.html')
        .then((res) => res.text())
        .then((html) => {
            const placeholder = document.getElementById('nav-placeholder');
            if (!placeholder) {
                console.warn('找不到 #nav-placeholder，側邊導覽列無法插入。');
                return;
            }
            placeholder.innerHTML = html;
            initNav();
        })
        .catch((err) => {
            console.error('側邊導覽列載入失敗：', err);
        });

    function initNav() {
        const navToggle = document.getElementById('navToggle');
        const navClose = document.getElementById('navClose');
        const navOverlay = document.getElementById('navOverlay');
        const sideNav = document.getElementById('sideNav');

        function openNav() {
            sideNav.classList.add('open');
            navOverlay.classList.add('open');
            navToggle.classList.add('active');
        }
        function closeNav() {
            sideNav.classList.remove('open');
            navOverlay.classList.remove('open');
            navToggle.classList.remove('active');
        }

        navToggle.addEventListener('click', () => {
            sideNav.classList.contains('open') ? closeNav() : openNav();
        });
        navClose.addEventListener('click', closeNav);
        navOverlay.addEventListener('click', closeNav);

        // 點擊導覽連結後（手機版）自動收起選單
        sideNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) closeNav();
            });
        });

        // 高亮目前所在頁面
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        sideNav.querySelectorAll('a').forEach((link) => {
            if (link.dataset.page === currentFile) {
                link.classList.add('current');
            }
        });

        // 電腦版時讓主內容自動留出側邊欄空間
        if (window.innerWidth >= 992) {
            document.body.classList.add('has-side-nav-desktop');
        }
    }
})();
