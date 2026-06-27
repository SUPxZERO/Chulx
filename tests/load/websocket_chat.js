import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
    vus: 500,
    duration: '1m',
};

export default function () {
    const url = 'ws://localhost:8080/app/app-key'; // Reverb WS URL
    
    const res = ws.connect(url, null, function (socket) {
        socket.on('open', function () {
            // Subscribe to private channel
            socket.send(JSON.stringify({
                event: 'pusher:subscribe',
                data: {
                    auth: 'mock-auth-token',
                    channel: 'private-booking.1'
                }
            }));
        });

        socket.on('message', function (msg) {
            const parsed = JSON.parse(msg);
            check(parsed, {
                'is heartbeat or event': (p) => p.event !== undefined,
            });
        });

        socket.on('close', function () {
            // console.log('disconnected');
        });

        // Close after 10 seconds
        socket.setTimeout(function () {
            socket.close();
        }, 10000);
    });

    check(res, { 'status is 101': (r) => r && r.status === 101 });
}
