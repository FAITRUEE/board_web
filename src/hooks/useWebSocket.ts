// hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

interface WebSocketHookProps {
  url: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useWebSocket = ({ 
  url, 
  onConnect, 
  onDisconnect, 
  onError 
}: WebSocketHookProps) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        onConnect?.();
      },
      onDisconnect: () => {
        setIsConnected(false);
        onDisconnect?.();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        onError?.(frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [url, onConnect, onDisconnect, onError]);

  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void) => {
      if (!clientRef.current || !isConnected) {
        console.warn('WebSocket not connected');
        return () => {};
      }

      const subscription = clientRef.current.subscribe(destination, callback);
      return () => subscription.unsubscribe();
    },
    [isConnected]
  );

  const publish = useCallback(
    (destination: string, body: any) => {
      if (!clientRef.current || !isConnected) {
        console.warn('WebSocket not connected');
        return;
      }

      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    },
    [isConnected]
  );

  return { isConnected, subscribe, publish };
};