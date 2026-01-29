document.addEventListener('DOMContentLoaded', () => {

    const REDIRECT_URL = "redeem.html";

    // ---------------------------------------------------------
    // 1. UID Checker Logic (State Switching)
    // ---------------------------------------------------------
    const uidInput = document.getElementById('uidInput');
    const checkUidBtn = document.getElementById('checkUidBtn');
    const statusMsg = document.getElementById('statusMsg');

    // States
    const inputState = document.getElementById('inputState');
    const resultState = document.getElementById('resultState');
    const backToSearch = document.getElementById('backToSearch');

    // Result Fields
    const pName = document.getElementById('pName');
    const pLevel = document.getElementById('pLevel');
    const pRegion = document.getElementById('pRegion');
    const pLikes = document.getElementById('pLikes');

    // Check if elements exist (only on check-id.html)
    if (checkUidBtn) {
        // Pre-fill UID from LocalStorage if available
        const savedUid = localStorage.getItem('ff_uid');
        if (savedUid) {
            uidInput.value = savedUid;
        }

        checkUidBtn.addEventListener('click', async () => {
            const uid = uidInput.value.trim();
            if (uid.length < 5) {
                statusMsg.textContent = "Please enter a valid UID.";
                statusMsg.style.color = "#ff4444";
                shakeElement(uidInput);
                return;
            }

            // Save UID to LocalStorage
            localStorage.setItem('ff_uid', uid);

            // Loading
            checkUidBtn.textContent = "Checking...";
            checkUidBtn.disabled = true;
            statusMsg.textContent = "";

            try {
                // API Call
                const response = await fetch(`https://freefire-api-six.vercel.app/get_player_personal_show?server=ind&uid=${uid}`);
                if (!response.ok) throw new Error("Network error");

                const data = await response.json();

                if (data && data.basicinfo) {
                    const info = data.basicinfo;
                    const clan = data.clanbasicinfo;
                    const captain = data.captainbasicinfo;
                    const social = data.socialinfo;
                    const pet = data.petinfo;

                    // 1. Basic Info
                    document.getElementById('pName').textContent = info.nickname || 'N/A';
                    document.getElementById('pLevel').textContent = info.level || '--';
                    document.getElementById('pRegion').textContent = info.region || '--';
                    document.getElementById('pLikes').textContent = info.liked || '0';
                    document.getElementById('pExp').textContent = info.exp || '0';
                    document.getElementById('pRank').textContent = info.rank || '--';

                    // 2. Account Details
                    document.getElementById('pCreated').textContent = info.createat ? new Date(parseInt(info.createat) * 1000).toLocaleDateString() : 'N/A';
                    document.getElementById('pLastLogin').textContent = info.lastloginat ? new Date(parseInt(info.lastloginat) * 1000).toLocaleDateString() : 'N/A';
                    document.getElementById('pBio').textContent = social && social.signature ? social.signature : 'No signature';

                    // 3. Social / Pet
                    document.getElementById('pPet').textContent = pet && pet.name ? pet.name : 'None';
                    document.getElementById('pPetLevel').textContent = pet && pet.level ? pet.level : '-';

                    // 4. Clan Info
                    if (clan && clan.clanname) {
                        document.getElementById('clanName').textContent = clan.clanname;
                        document.getElementById('clanLevel').textContent = clan.clanlevel;
                        document.getElementById('clanMembers').textContent = `${clan.membernum}/${clan.capacity}`;
                        document.getElementById('clanCaptain').textContent = captain ? captain.nickname : 'Unknown';
                    } else {
                        document.getElementById('clanName').textContent = 'No Clan';
                        document.getElementById('clanLevel').textContent = '-';
                        document.getElementById('clanMembers').textContent = '-';
                        document.getElementById('clanCaptain').textContent = '-';
                    }

                    // Switch State
                    inputState.style.display = 'none';
                    resultState.style.display = 'flex';
                    resultState.classList.add('fade-in');

                } else {
                    throw new Error("Player not found");
                }
            } catch (error) {
                console.error(error);
                statusMsg.textContent = "Player not found or Error.";
                statusMsg.style.color = "#ff4444";
                shakeElement(uidInput);
            } finally {
                checkUidBtn.textContent = "Check";
                checkUidBtn.disabled = false;
            }
        });
    }

    if (backToSearch) {
        backToSearch.addEventListener('click', () => {
            resultState.style.display = 'none';
            inputState.style.display = 'flex';
            // uidInput.value = ""; // Keep input for better UX or uncomment to clear
            statusMsg.textContent = "";
        });
    }

    function shakeElement(element) {
        element.style.transform = "translateX(5px)";
        setTimeout(() => element.style.transform = "translateX(-5px)", 50);
        setTimeout(() => element.style.transform = "translateX(5px)", 100);
        setTimeout(() => element.style.transform = "translateX(0)", 150);
    }

    // ---------------------------------------------------------
    // 2. Timer Logic
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 3. Claim Reward Logic
    // ---------------------------------------------------------
    window.claimReward = function () {
        // Direct redirect
        window.location.href = REDIRECT_URL;
    }


});
