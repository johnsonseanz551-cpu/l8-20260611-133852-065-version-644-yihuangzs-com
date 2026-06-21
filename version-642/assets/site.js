(function () {
    const body = document.body;
    const mobileToggle = document.querySelector("[data-mobile-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            body.classList.toggle("no-scroll", mobilePanel.classList.contains("is-open"));
        });

        mobilePanel.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                mobilePanel.classList.remove("is-open");
                body.classList.remove("no-scroll");
            });
        });
    }

    const hero = document.querySelector("[data-hero-slider]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
        let active = 0;
        let timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function run() {
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(dotIndex);
                run();
            });
        });

        show(0);
        run();
    }

    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
        const cards = Array.from(area.querySelectorAll(".movie-card"));
        const input = area.querySelector("[data-search-input]");
        const tabs = Array.from(area.querySelectorAll("[data-filter-tab]"));
        let activeCategory = "all";

        function filterCards() {
            const term = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                const text = card.textContent.toLowerCase();
                const category = card.getAttribute("data-category") || "";
                const matchedTerm = !term || text.includes(term);
                const matchedCategory = activeCategory === "all" || category === activeCategory;
                card.classList.toggle("is-hidden-by-filter", !(matchedTerm && matchedCategory));
            });
        }

        if (input) {
            input.addEventListener("input", filterCards);
        }

        tabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                activeCategory = tab.getAttribute("data-filter-tab") || "all";
                tabs.forEach(function (otherTab) {
                    otherTab.classList.toggle("is-active", otherTab === tab);
                });
                filterCards();
            });
        });
    });

    const video = document.querySelector("[data-video-player]");
    const configNode = document.getElementById("player-config");

    if (video && configNode) {
        const overlay = document.querySelector("[data-player-cover]");
        const button = document.querySelector("[data-play-action]");
        let mounted = false;
        let hlsInstance = null;
        let playerConfig = null;

        try {
            playerConfig = JSON.parse(configNode.textContent || "{}");
        } catch (error) {
            playerConfig = null;
        }

        function mount() {
            if (mounted || !playerConfig || !playerConfig.source) {
                return;
            }

            mounted = true;
            const source = playerConfig.source;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            mount();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            const action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("click", function () {
            if (!mounted) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
})();
