import { useCallback, useEffect, useRef, useState } from "react";

export type WSStatus = "connecting" | "open" | "closing" | "closed" | "error";
export type IncomingMessage = Record<string, any>;
export type OutgoingMessage = Record<string, any>;

export interface UseChatWebSocketOptions {
  url: string;
  onMessage?: (msg: IncomingMessage) => void;
  onOpen?: () => void;
  onClose?: (ev?: CloseEvent) => void;
  onError?: (ev?: Event) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  heartbeatIntervalMs?: number;
  reconnectBaseMs?: number;
}

export function useChatWebSocket(options: UseChatWebSocketOptions) {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    maxReconnectAttempts = 10,
    heartbeatIntervalMs = 20000,
    reconnectBaseMs = 1000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatTimerRef = useRef<number | null>(null);
  const sendQueueRef = useRef<OutgoingMessage[]>([]);
  const manuallyClosedRef = useRef(false);

  const [status, setStatus] = useState<WSStatus>("closed");

  const clearHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  const startHeartbeat = (ws: WebSocket) => {
    clearHeartbeat();
    heartbeatTimerRef.current = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        } catch (e) {
          // ignore
        }
      }
    }, heartbeatIntervalMs) as unknown as number;
  };

  const flushQueue = (ws: WebSocket) => {
    while (sendQueueRef.current.length && ws.readyState === WebSocket.OPEN) {
      const msg = sendQueueRef.current.shift();
      if (msg) {
        try {
          ws.send(JSON.stringify(msg));
        } catch (e) {
          console.error("Failed to send queued message", e);
        }
      }
    }
  };

  const connect = useCallback(() => {
    manuallyClosedRef.current = false;
    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setStatus("open");
      startHeartbeat(ws);
      flushQueue(ws);
      onOpen?.();
    };

    ws.onmessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        onMessage?.(data);
      } catch (e) {
        onMessage?.({ raw: ev.data });
      }
    };

    ws.onclose = (ev: CloseEvent) => {
      clearHeartbeat();
      wsRef.current = null;
      setStatus("closed");
      onClose?.(ev);

      if (!manuallyClosedRef.current && autoReconnect) {
        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        if (attempt <= maxReconnectAttempts) {
          const delay = Math.min(30000, reconnectBaseMs * 2 ** (attempt - 1));
          setStatus("connecting");
          setTimeout(() => {
            connect();
          }, delay);
        } else {
          setStatus("closed");
        }
      }
    };

    ws.onerror = (ev: Event) => {
      setStatus("error");
      onError?.(ev);
    };
  }, [url, onMessage, onOpen, onClose, onError, autoReconnect, maxReconnectAttempts, reconnectBaseMs, heartbeatIntervalMs]);

  useEffect(() => {
    connect();
    return () => {
      manuallyClosedRef.current = true;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        setStatus("closing");
        wsRef.current.close();
      }
      clearHeartbeat();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const sendJson = useCallback((msg: OutgoingMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      sendQueueRef.current.push(msg);
    }
  }, []);

  const joinChat = useCallback((chatWith: number) => {
    sendJson({ action: "join_chat", chat_with: chatWith });
  }, [sendJson]);

  const leaveChat = useCallback(() => {
    sendJson({ action: "leave_chat" });
  }, [sendJson]);

  const sendMessage = useCallback((to: number, text: string) => {
    sendJson({ action: "send_message", to, text });
  }, [sendJson]);

  const markSeen = useCallback((chat_id: number) => {
    sendJson({ action: "mark_seen", chat_id });
  }, [sendJson]);

  const close = useCallback(() => {
    manuallyClosedRef.current = true;
    if (wsRef.current) {
      try {
        setStatus("closing");
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return {
    sendJson,
    joinChat,
    leaveChat,
    sendMessage,
    markSeen,
    close,
    status,
    reconnectAttempts: reconnectAttemptsRef.current,
    rawWebSocket: wsRef.current,
  };
}
