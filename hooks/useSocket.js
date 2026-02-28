import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '@/lib/api';

export function useSocket() {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            console.warn('[WebSocket] No token found, skipping connection.');
            return;
        }

        // Derive socket URL from API_BASE (usually ends with /api, we need just the host)
        const socketUrl = API_BASE.replace(/\/api$/, '');

        // Establish connection
        const socketInstance = io(socketUrl, {
            auth: { token }, // the nestjs gateway extracts this from handshake.auth.token
            transports: ['websocket', 'polling'], // prefer websocket
        });

        socketRef.current = socketInstance;

        socketInstance.on('connect', () => {
            console.log('[WebSocket] Connected:', socketInstance.id);
            setIsConnected(true);
            setSocket(socketInstance);

            // Auto-join hotel room if we know the hotelId
            const hotelId = localStorage.getItem('hotelId');
            if (hotelId) {
                socketInstance.emit('joinHotelRoom', hotelId);
            }
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('[WebSocket] Disconnected:', reason);
            setIsConnected(false);
            setSocket(null);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('[WebSocket] Connection Error:', error);
        });

        return () => {
            console.log('[WebSocket] Cleaning up...');
            if (socketInstance) socketInstance.disconnect();
        };
    }, []);

    return { socket: socketRef.current, isConnected };
}
