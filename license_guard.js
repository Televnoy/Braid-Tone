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
    // Обновленный стиль: Темный фон с легким размытием заднего плана
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(13, 13, 18, 0.95); 
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 999999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: #ffffff; font-family: 'Inter', -apple-system, sans-serif;
        padding: 20px; box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="width: 100%; max-width: 380px; text-align: center; background: #1a1a24; padding: 40px 30px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);">
            
            <div style="margin-bottom: 35px;">
                <!-- Иконка или стилизованный заголовок -->
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6d5dfc, #b085f5); margin: 0 auto 20px; border-radius: 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(109, 93, 252, 0.4);">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3y-3.5 3.5"></path></svg>
                </div>
                
                <h1 style="letter-spacing: 4px; font-weight: 700; font-size: 1.4rem; text-transform: uppercase; margin: 0 0 10px; background: linear-gradient(to right, #fff, #a5a5a5); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    BRAID TONE
                </h1>
                <p style="color: #6d5dfc; text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; margin-bottom: 20px;">
                    Лицензия не найдена
                </p>
            </div>

            <div style="position: relative; margin-bottom: 20px;">
                <input type="text" id="license-input" placeholder="Ключ активации" 
                    style="width: 100%; padding: 16px; background: #0f0f15; border: 1px solid #2a2a3a; border-radius: 12px; 
                    font-size: 1rem; color: white; text-align: center; box-sizing: border-box; outline: none; transition: border 0.3s ease;">
            </div>

            <button id="license-submit" style="width: 100%; background: #6d5dfc; color: white; border: none; 
                padding: 16px; font-size: 1rem; border-radius: 12px; cursor: pointer; font-weight: 600; transition: transform 0.2s, background 0.3s; box-shadow: 0 4px 15px rgba(109, 93, 252, 0.3);">
                АКТИВИРОВАТЬ
            </button>

            <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #2a2a3a;">
                <p style="color: #888; font-size: 0.85rem; margin-bottom: 5px;">
                    Нет ключа? Напишите нам:
                </p>
                <a href="https://t.me/afro_perm" target="_blank" style="color: #6d5dfc; text-decoration: none; font-weight: 600; font-size: 0.9rem;">@afro_perm</a>
            </div>

            <div style="margin-top: 30px;">
                <p style="color: #444; font-size: 0.6rem; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Device Signature:</p>
                <p id="display-uid" style="color: #555; font-size: 0.65rem; word-break: break-all; font-family: 'Monaco', monospace; opacity: 0.7;">${currentUid}</p>
            </div>

            <div id="license-msg" style="margin-top: 15px; font-size: 0.8rem; height: 18px; font-weight: 500;"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Эффект нажатия на кнопку
    const btn = document.getElementById('license-submit');
    btn.onmousedown = () => btn.style.transform = 'scale(0.98)';
    btn.onmouseup = () => btn.style.transform = 'scale(1)';

    document.getElementById('license-submit').onclick = async () => {
        const keyInput = document.getElementById('license-input');
        const key = keyInput.value.trim();
        const msg = document.getElementById('license-msg');
        if (!key) return;

        msg.style.color = "#888";
        msg.innerText = "Авторизация...";

        try {
            const userCred = await signInAnonymously(auth);
            const uid = userCred.user.uid;

            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'keys', key);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                if (data.ownerId && data.ownerId !== uid) {
                    msg.style.color = "#ff4d4d";
                    msg.innerText = "Привязано к другому устройству";
                } else {
                    if (data.active === false) {
                        msg.style.color = "#ff4d4d";
                        msg.innerText = "Ключ деактивирован";
                        return;
                    }

                    localStorage.setItem(LICENSE_KEY_STORE, 'true');
                    if (checkInterval) clearInterval(checkInterval);

                    if (!data.ownerId) {
                        await updateDoc(docRef, { ownerId: uid, active: true });
                    }
                    
                    msg.style.color = "#00ff88";
                    msg.innerText = "Успешно! Запуск...";
                    setTimeout(() => overlay.remove(), 1000);
                }
            } else {
                msg.style.color = "#ff4d4d";
                msg.innerText = "Неверный код активации";
            }
        } catch (e) {
            msg.style.color = "#ff4d4d";
            msg.innerText = "Ошибка сети";
            console.error(e);
        }
    };
}

window.addEventListener('load', initGuard);
