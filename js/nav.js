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

        // 📁 分類群組：點擊標題展開/收合
        sideNav.querySelectorAll('.nav-group-header').forEach((header) => {
            header.addEventListener('click', () => {
                const group = header.closest('.nav-group');
                group.classList.toggle('open');
            });
        });

        // 點擊導覽連結後（手機版）自動收起整個選單
        sideNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) closeNav();
            });
        });

        // 高亮目前所在頁面，並自動展開該頁面所屬的群組
        // 直接比對 href，不再額外維護 data-page，避免兩邊沒同步而失效
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        sideNav.querySelectorAll('a').forEach((link) => {
            const linkFile = link.getAttribute('href').split('/').pop();
            if (linkFile === currentFile) {
                link.classList.add('current');
                const parentGroup = link.closest('.nav-group');
                if (parentGroup) parentGroup.classList.add('open');
            }
        });
    }
})();
