document.addEventListener('DOMContentLoaded', () => {

    const path = window.location.pathname;
    const page = path.split("/").pop();
    const REDIRECT_URL = "https://www.google.com";

    // ============================================
    // Logic for LOGIN PAGE (index.html)
    // ============================================
    if (page === "index.html" || page === "") {
        const uidInput = document.getElementById('uidInput');
        const checkUidBtn = document.getElementById('checkUidBtn');
        const playerStatus = document.getElementById('playerStatus');
        const loginMsg = document.getElementById('loginMsg');

        if (checkUidBtn) {
            checkUidBtn.addEventListener('click', async () => {
                const uid = uidInput.value.trim();

                if (uid.length < 5) {
                    loginMsg.textContent = "Invalid UID. Please try again.";
                    loginMsg.style.color = "#ff4444";
                    shakeElement(uidInput);
                    return;
                }

                // UI Loading
                checkUidBtn.textContent = "Verifying Player...";
                checkUidBtn.disabled = true;
                loginMsg.textContent = "";

                try {
                    const response = await fetch(`https://freefire-api-six.vercel.app/get_player_personal_show?server=ind&uid=${uid}`);
                    if (!response.ok) throw new Error("Network error");
                    const data = await response.json();

                    if (data && data.basicinfo) {
                        // SUCCESS
                        const info = data.basicinfo;

                        // Save to Storage
                        localStorage.setItem('ff_player', JSON.stringify(info));

                        // UI Update (Briefly)
                        playerStatus.innerHTML = `<span style="color:var(--primary)">${info.nickname}</span>`;
                        playerStatus.classList.add('active');
                        loginMsg.textContent = "Login Successful! Redirecting...";
                        loginMsg.style.color = "#00ff88";

                        setTimeout(() => {
                            window.location.href = "redeem.html";
                        }, 1000);

                    } else {
                        throw new Error("Player not found");
                    }
                } catch (error) {
                    console.error("Login Error:", error);
                    loginMsg.textContent = "Player not found or Network Error.";
                    loginMsg.style.color = "#ff4444";
                    checkUidBtn.textContent = "Login";
                    checkUidBtn.disabled = false;
                    shakeElement(uidInput);
                }
            });
        }
    }

    // ============================================
    // Logic for REDEEM PAGE (redeem.html)
    // ============================================
    if (page === "redeem.html") {
        const playerStr = localStorage.getItem('ff_player');

        // Security Check: If no user data, kick back to login
        if (!playerStr) {
            window.location.href = "index.html";
            return;
        }

        const info = JSON.parse(playerStr);
        const nameEl = document.getElementById('redeemPlayerName');
        const statsEl = document.getElementById('redeemPlayerStats');

        if (nameEl) nameEl.textContent = info.nickname;
        if (statsEl) statsEl.textContent = `Level: ${info.level} | Likes: ${info.liked} | Region: ${info.region}`;

        // Initialize Timers
        const timerElements = document.querySelectorAll('.card-timer');
        function formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        timerElements.forEach(timer => {
            let timeLeft = parseInt(timer.getAttribute('data-time')) || 7200;
            const interval = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    timer.textContent = "EXPIRED";
                    timer.style.color = "red";
                } else {
                    timeLeft--;
                    timer.textContent = formatTime(timeLeft);
                }
            }, 1000);
        });

        // Claim Logic
        window.attemptClaim = function () {
            // Already validated by being on this page
            // Simulate claim process
            const btns = document.querySelectorAll('.card-claim-btn');
            // Just redirect for now or show a modal
            window.location.href = REDIRECT_URL;
        };
    }

    function shakeElement(element) {
        element.style.transform = "translateX(5px)";
        setTimeout(() => element.style.transform = "translateX(-5px)", 50);
        setTimeout(() => element.style.transform = "translateX(5px)", 100);
        setTimeout(() => element.style.transform = "translateX(0)", 150);
    }
});
