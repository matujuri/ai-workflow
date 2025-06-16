// public/service-worker.js

// Service Worker のインストール
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting(); // 新しいService Workerがすぐにアクティブ化されるようにする
});

// Service Worker のアクティブ化
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(clients.claim()); // Service Worker が制御するクライアントをすぐに取得
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

// クライアントからのメッセージを受信
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body } = event.data.payload;
        self.registration.showNotification(title, { body });
    }
}); 