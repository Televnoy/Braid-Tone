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
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = "rootscalc-pro";

const TRIAL_TIME = 10 * 1000; 
const STORAGE_KEY = 'bt_trial_start';
const LICENSE_KEY_STORE = 'bt_license_active';

async function initGuard() {
    if (localStorage.getItem(LICENSE_KEY_STORE) === 'true') return;

    let startTime = localStorage.getItem(STORAGE_KEY);
    if (!startTime) {
        startTime = Date.now();
        localStorage.setItem(STORAGE_KEY, startTime);
    }

    const checkTrial = () => {
        if (Date.now() - parseInt(startTime) > TRIAL_TIME) {
            showLockScreen();
            return true;
        }
        return false;
    };

    const interval = setInterval(checkTrial, 5000);
    checkTrial();
}

async function showLockScreen() {
    if (document.getElementById('license-overlay')) return;

    // Получаем UID для отображения внизу как ID устройства
    let currentUid = "Загрузка...";
    try {
        const userCred = await signInAnonymously(auth);
        currentUid = userCred.user.uid;
    } catch (e) {
        currentUid = "Ошибка сети";
    }

    const overlay = document.createElement('div');
    overlay.id = 'license-overlay';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: white; z-index: 999999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 20px; box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="width: 100%; max-width: 350px; text-align: center;">
            <!-- Логотип приложения -->
            <div style="margin-bottom: 40px;">
                <h1 style="letter-spacing: 5px; font-weight: 500; font-size: 1.2rem; text-transform: uppercase; margin-bottom: 30px;">
                    BRAID TONE
                </h1>
                <p style="color: #999; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 5px;">
                    Пробный период завершен
                </p>
                <h2 style="font-weight: 400; font-size: 1.5rem; margin-top: 0;">Активация устройства</h2>
            </div>

            <!-- Поле ввода -->
            <input type="text" id="license-input" placeholder="XXXX - XXXX - XXXX" 
                style="width: 100%; padding: 15px; border: 1px solid #1a1a1a; border-radius: 0; 
                font-size: 1rem; letter-spacing: 2px; text-align: center; margin-bottom: 20px; box-sizing: border-box; outline: none;">

            <!-- Кнопка -->
            <button id="license-submit" style="width: 100%; background: #121621; color: white; border: none; 
                padding: 18px; font-size: 0.9rem; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; font-weight: bold;">
                Активировать
            </button>

            <!-- Ссылка в стиле текста -->
            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px;">
                <p style="color: #999; font-size: 0.8rem;">
                    Ключ можно приобрести 
                    <a href="https://t.me/afro_perm" target="_blank" style="color: #999; text-decoration: none; border-bottom: 1px solid #ccc;">@afro_perm</a>
                </p>
            </div>

            <!-- ID устройства -->
            <div style="margin-top: 40px;">
                <p style="color: #ccc; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">ID устройства:</p>
                <p id="display-uid" style="color: #bbb; font-size: 0.7rem; word-break: break-all; font-family: monospace;">${currentUid}</p>
            </div>

            <div id="license-msg" style="margin-top: 20px; font-size: 0.85rem; height: 20px; color: #d93025;"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('license-submit').onclick = async () => {
        const key = document.getElementById('license-input').value.trim();
        const msg = document.getElementById('license-msg');
        if (!key) return;

        msg.style.color = "#1a1a1a";
        msg.innerText = "Проверка ключа...";

        try {
            const userCred = await signInAnonymously(auth);
            const uid = userCred.user.uid;

            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'license_keys', key);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                if (data.ownerId && data.ownerId !== uid) {
                    msg.style.color = "#d93025";
                    msg.innerText = "Ключ привязан к другому устройству";
                } else {
                    if (!data.ownerId) {
                        await updateDoc(docRef, { ownerId: uid });
                    }
                    localStorage.setItem(LICENSE_KEY_STORE, 'true');
                    overlay.remove();
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
