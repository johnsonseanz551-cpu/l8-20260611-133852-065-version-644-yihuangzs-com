(function () {
    "use strict";

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                show(nextIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);

        if (slides.length > 1) {
            start();
        }
    }

    function setupFilters() {
        selectAll("[data-filter-panel]").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target") || "#movie-list";
            var list = document.querySelector(targetSelector);

            if (!list) {
                return;
            }

            var input = panel.querySelector("[data-filter-input]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var typeSelect = panel.querySelector("[data-type-filter]");
            var result = panel.querySelector("[data-filter-result]");
            var cards = selectAll(".movie-card", list);

            fillSelect(yearSelect, uniqueValues(cards, "year").sort(function (a, b) {
                return Number(b) - Number(a);
            }));
            fillSelect(typeSelect, uniqueValues(cards, "type").sort());

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search") || "");
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okYear = !year || card.getAttribute("data-year") === year;
                    var okType = !type || card.getAttribute("data-type") === type;
                    var shouldShow = okKeyword && okYear && okType;

                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = "当前显示 " + visible + " / " + cards.length + " 部影片";
                }
            }

            [input, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function uniqueValues(cards, key) {
        var set = new Set();

        cards.forEach(function (card) {
            var value = card.getAttribute("data-" + key);
            if (value) {
                set.add(value);
            }
        });

        return Array.from(set);
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }

        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupPlayers() {
        selectAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-button]");
            var message = player.querySelector("[data-player-message]");
            var source = player.getAttribute("data-src");
            var loaded = false;
            var hls = null;

            if (!video || !button || !source) {
                return;
            }

            function showMessage(text) {
                if (!message) {
                    return;
                }

                message.textContent = text;
                message.classList.add("is-visible");
            }

            function hideOverlay() {
                button.classList.add("is-hidden");
            }

            function loadSource() {
                if (loaded) {
                    return Promise.resolve();
                }

                loaded = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);

                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage("视频加载失败，请稍后重试");
                        }
                    });

                    return new Promise(function (resolve) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                    });
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return Promise.resolve();
                }

                showMessage("当前浏览器不支持 HLS 播放，请更换浏览器或启用 HLS 支持。");
                return Promise.reject(new Error("HLS is not supported"));
            }

            button.addEventListener("click", function () {
                loadSource()
                    .then(function () {
                        hideOverlay();
                        return video.play();
                    })
                    .catch(function () {
                        showMessage("无法自动播放，请点击播放器控制条重试。");
                    });
            });

            video.addEventListener("play", hideOverlay);

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
