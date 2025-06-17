// public/service-worker.js

const DB_NAME = 'pomodoroDB';
const STORE_NAME = 'timerStore';

let db;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function loadTimerStateFromIndexedDB() {
    if (!db) {
        await openDatabase();
    }
    return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('timerState');

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            resolve(null);
        };
    });
}

async function saveTimerStateToIndexedDB() {
    if (!db) {
        await openDatabase();
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(timerState, 'timerState');

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject();
        };
    });
}

// Service Worker のインストール
self.addEventListener('install', (event) => {
    self.skipWaiting(); // 新しいService Workerがすぐにアクティブ化されるようにする
});

// Service Worker のアクティブ化
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim().then(async () => {
        await openDatabase();
        const loadedState = await loadTimerStateFromIndexedDB();
        if (loadedState) {
            timerState = loadedState;
            // ロード後、時間が0以下であれば現在のモードの設定時間を再設定
            if (timerState.time <= 0) {
                timerState.time = timerState.isWorking ? timerState.workTimeSetting : timerState.breakTimeSetting;
                timerState.initialPomodoroTime = timerState.time;
            }
            if (timerState.isRunning) {
                startCountdown(); // 実行中だった場合はタイマーを再開
            }
        } else {
            // 初回起動時やデータがない場合、デフォルト値を設定して保存
            timerState = {
                time: DEFAULT_WORK_TIME,
                isRunning: false,
                isWorking: true,
                workTimeSetting: DEFAULT_WORK_TIME,
                breakTimeSetting: DEFAULT_BREAK_TIME,
                initialPomodoroTime: DEFAULT_WORK_TIME,
                isTimerActive: false,
            };
        }
        postTimerStateToClients(); // UIに初期状態を送信
    }));
});

// プッシュ通知の受信イベント
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '新しい通知';
    const options = {
        body: data.body || 'メッセージが届きました。',
        icon: data.icon || '/icon-192x192.png', // 必要に応じてアイコンパスを調整
        badge: data.badge || '/badge-72x72.png', // 必要に応じてバッジパスを調整
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// 通知クリックイベント
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // 通知を閉じる
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        }),
    );
});

// fetchイベントの基本的な例（オフラインサポートなどが必要な場合は拡張）
self.addEventListener('fetch', (event) => {
    // 必要に応じてキャッシュ戦略などを実装
    // console.log('Service Worker: Fetching', event.request.url);
});

// ===============================================
// ポモドーロタイマーのService Workerロジック
// ===============================================

let timerIntervalId = null;
const DEFAULT_WORK_TIME = 25 * 60; // 25分を秒に変換
const DEFAULT_BREAK_TIME = 5 * 60; // 5分を秒に変換

let timerState = {
    time: DEFAULT_WORK_TIME,
    isRunning: false,
    isWorking: true,
    workTimeSetting: DEFAULT_WORK_TIME,
    breakTimeSetting: DEFAULT_BREAK_TIME,
    initialPomodoroTime: DEFAULT_WORK_TIME, // 現在のポモドーロの総時間
    isTimerActive: false, // タイマーが一度でも開始されたか、またはアクティブな状態か
};

// クライアントにタイマー状態を送信する関数
function postTimerStateToClients() {
    self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'TIMER_STATE_UPDATE',
                payload: timerState,
            });
        });
    });
    saveTimerStateToIndexedDB().catch(e => console.error("Failed to save state:", e));
}

// タイマーのカウントダウンロジック
function startCountdown() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }
    timerIntervalId = setInterval(() => {
        if (timerState.time > 0) {
            timerState.time--;
            postTimerStateToClients();
        } else {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
            timerState.isRunning = false;

            // 通知をトリガー
            const notificationText = timerState.isWorking ? '作業時間終了！休憩しましょう！' : '休憩時間終了！作業を再開しましょう！';
            self.registration.showNotification('ポモドーロタイマー', { body: notificationText });

            // 音声通知

            // モードを切り替える
            postTimerStateToClients(); // タイマー停止後の状態を送信
        }
    }, 1000);
}

// クライアントからのメッセージを受信
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SHOW_NOTIFICATION': // 既存の通知ロジック
            const { title, body } = payload;
            self.registration.showNotification(title, { body });
            break;

        case 'START_TIMER':
            if (!timerState.isRunning) {
                timerState.isRunning = true;
                timerState.initialPomodoroTime = timerState.isWorking ? timerState.workTimeSetting : timerState.breakTimeSetting; // 開始時の総時間を記録
                timerState.isTimerActive = true; // タイマーが開始されたのでアクティブに設定
                startCountdown();
                postTimerStateToClients(); // 開始状態を送信
            }
            break;

        case 'PAUSE_TIMER':
            if (timerState.isRunning) {
                timerState.isRunning = false;
                if (timerIntervalId) {
                    clearInterval(timerIntervalId);
                    timerIntervalId = null;
                }
                postTimerStateToClients(); // 一時停止状態を送信
            }
            break;

        case 'RESUME_TIMER':
            if (!timerState.isRunning && timerState.time > 0) {
                timerState.isRunning = true;
                timerState.isTimerActive = true; // タイマーが再開されたのでアクティブに設定
                startCountdown();
                postTimerStateToClients(); // 再開状態を送信
            }
            break;

        case 'STOP_TIMER': // 停止ロジック
            timerState.isRunning = false;
            timerState.isWorking = true;
            timerState.time = timerState.workTimeSetting;
            timerState.initialPomodoroTime = timerState.workTimeSetting; // 停止時の総時間も更新
            timerState.isTimerActive = false; // タイマーが停止されたので非アクティブに設定
            if (timerIntervalId) {
                clearInterval(timerIntervalId);
                timerIntervalId = null;
            }
            postTimerStateToClients(); // 停止状態を送信
            break;

        case 'TOGGLE_MODE':
            timerState.isRunning = false;
            timerState.isWorking = !timerState.isWorking;
            timerState.time = timerState.isWorking ? timerState.workTimeSetting : timerState.breakTimeSetting;
            if (timerIntervalId) {
                clearInterval(timerIntervalId);
                timerIntervalId = null;
            }
            postTimerStateToClients(); // モード切り替え状態を送信
            break;

        case 'UPDATE_TIMER_SETTINGS':
            timerState.workTimeSetting = payload.workTime * 60; // 分から秒へ変換
            timerState.breakTimeSetting = payload.breakTime * 60; // 分から秒へ変換
            // タイマーが実行中であるかどうかにかかわらず、現在のモードの時間を設定値に合わせる
            timerState.time = timerState.isWorking ? timerState.workTimeSetting : timerState.breakTimeSetting;
            timerState.initialPomodoroTime = timerState.time;
            postTimerStateToClients(); // 設定更新状態を送信
            break;

        case 'REQUEST_TIMER_STATE': // クライアントからの状態要求
            postTimerStateToClients();
            break;

        default:
            console.log('Service Worker: Unknown message type', type);
            break;
    }
}); 