// --- Конфигурация Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBk99RmIn2McXhLlMV4huc2iTUGONc7Zig",
  authDomain: "rootscalc-1c302.firebaseapp.com",
  projectId: "rootscalc-1c302",
  storageBucket: "rootscalc-1c302.firebasestorage.app",
  messagingSenderId: "466620468252",
  appId: "1:466620468252:web:e65ad3b731f4315f06a3d9"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = "rootscalc-pro"; 
const TRIAL_TIME = 10 * 60 * 1000; 
const STORAGE_KEY = 'bt_trial_start';
const LICENSE_KEY_STORE = 'bt_license_active';

let checkInterval = null;

async function initGuard() {
    if (localStorage.getItem(LICENSE_KEY_STORE) === 'true') return;

    let startTime = localStorage.getItem(STORAGE_KEY);
    if (!startTime) {
        startTime = Date.now();
        localStorage.setItem(STORAGE_KEY, startTime);
    }

    const checkTrial = () => {
        if (localStorage.getItem(LICENSE_KEY_STORE) === 'true') {
            if (checkInterval) clearInterval(checkInterval);
            return true;
        }

        if (Date.now() - parseInt(startTime) > TRIAL_TIME) {
            showLockScreen();
            return true;
        }
        return false;
    };

    checkInterval = setInterval(checkTrial, 5000);
    checkTrial();
}

async function showLockScreen() {
    if (document.getElementById('license-overlay')) return;

    let currentUid = "Загрузка...";
    try {
        const userCred = await signInAnonymously(auth);
        currentUid = userCred.user.uid;
    } catch (e) {
        currentUid = "Ошибка сети";
    }

    const overlay = document.createElement('div');
    overlay.id = 'license-overlay';
    // Светлый дизайн в стиле приложения
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: white; 
        z-index: 999999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 20px; box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="width: 100%; max-width: 400px; text-align: center;">
            
            <!-- Логотип из приложения -->
            <div style="margin-bottom: 50px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; color: #1a1a1a; display: flex; align-items: center; justify-content: center;">
                    BRAID TONE
                </h1>
                <p style="margin: 5px 0 0; font-size: 11px; letter-spacing: 3px; color: #999; text-transform: uppercase;">
                    LABORATORY 2026
                </p>
            </div>

            <!-- Заголовки как на скриншоте -->
            <div style="margin-bottom: 40px;">
                <p style="color: #999; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; margin-bottom: 10px;">
                    ПРОБНЫЙ ПЕРИОД ЗАВЕРШЕН
                </p>
                <h2 style="font-weight: 400; font-size: 26px; margin: 0; color: #333;">Активация устройства</h2>
            </div>

            <!-- Поле ввода -->
            <div style="margin-bottom: 20px;">
                <input type="text" id="license-input" placeholder="XXXX - XXXX - XXXX" 
                    style="width: 100%; padding: 18px; border: 1px solid #1a1a1a; border-radius: 0; 
                    font-size: 16px; letter-spacing: 2px; text-align: center; box-sizing: border-box; outline: none; color: #1a1a1a;">
            </div>

            <!-- Кнопка -->
            <button id="license-submit" style="width: 100%; background: #121621; color: white; border: none; 
                padding: 20px; font-size: 13px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; font-weight: 700; margin-bottom: 30px; transition: opacity 0.2s;">
                АКТИВИРОВАТЬ
            </button>

            <!-- Линия-разделитель -->
            <div style="width: 100%; height: 1px; background: #eee; margin-bottom: 30px;"></div>

            <!-- Ссылка -->
            <div style="margin-bottom: 40px;">
                <p style="color: #999; font-size: 13px; margin: 0;">
                    Ключ можно приобрести 
                    <a href="https://t.me/afro_perm" target="_blank" style="color: #1a1a1a; text-decoration: none; border-bottom: 1px solid #ccc; font-weight: 500;">@afro_perm</a>
                </p>
            </div>

            <!-- ID устройства -->
            <div>
                <p style="color: #bbb; font-size: 10px; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">ID устройства:</p>
                <p id="display-uid" style="color: #ccc; font-size: 11px; word-break: break-all; font-family: monospace; max-width: 280px; margin: 0 auto;">${currentUid}</p>
            </div>

            <div id="license-msg" style="margin-top: 25px; font-size: 13px; min-height: 20px; font-weight: 500;"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btn = document.getElementById('license-submit');
    btn.onmouseover = () => btn.style.opacity = '0.9';
    btn.onmouseout = () => btn.style.opacity = '1';

    document.getElementById('license-submit').onclick = async () => {
        const keyInput = document.getElementById('license-input');
        const key = keyInput.value.trim();
        const msg = document.getElementById('license-msg');
        if (!key) return;

        msg.style.color = "#999";
        msg.innerText = "Проверка...";

        try {
            const userCred = await signInAnonymously(auth);
            const uid = userCred.user.uid;

            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'keys', key);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                if (data.ownerId && data.ownerId !== uid) {
                    msg.style.color = "#d93025";
                    msg.innerText = "Ключ привязан к другому устройству";
                } else {
                    if (data.active === false) {
                        msg.style.color = "#d93025";
                        msg.innerText = "Ключ деактивирован";
                        return;
                    }

                    localStorage.setItem(LICENSE_KEY_STORE, 'true');
                    if (checkInterval) clearInterval(checkInterval);

                    if (!data.ownerId) {
                        await updateDoc(docRef, { ownerId: uid, active: true });
                    }
                    
                    msg.style.color = "#28a745";
                    msg.innerText = "Активация прошла успешно";
                    setTimeout(() => overlay.remove(), 1000);
                }
            } else {
                msg.style.color = "#d93025";
                msg.innerText = "Неверный ключ активации";
            }
        } catch (e) {
            msg.style.color = "#d93025";
            msg.innerText = "Ошибка соединения";
            console.error(e);
        }
    };
}

window.addEventListener('load', initGuard);