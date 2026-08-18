import { useEffect, useState } from "react";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { tokenStorage } from "@/utils/tokenStorage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://localhost:7033/api").replace(/\/api\/?$/, "");

export default function useSignalR(enabled = true) {
  const [activeUserIds, setActiveUserIds] = useState([]);
  const [connectionState, setConnectionState] = useState("Disconnected");

  useEffect(() => {
    if (!enabled) return;

    const token = tokenStorage.getAccessToken();

    if (!token) {
      setActiveUserIds([]);
      setConnectionState("Disconnected");
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/tasks`, {
        accessTokenFactory: () => tokenStorage.getAccessToken() || "",
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Critical)
      .build();

    const handleActiveUsersChanged = (userIds) => {
      setActiveUserIds(
        Array.isArray(userIds) ? userIds.map((id) => String(id)) : [],
      );
    };

    connection.on("ActiveUsersChanged", handleActiveUsersChanged);

    connection.onreconnecting(() => {
      setConnectionState("Reconnecting");
    });

    connection.onreconnected(() => {
      setConnectionState("Connected");
    });

    connection.onclose(() => {
      setConnectionState("Disconnected");
    });

    let cancelled = false;

    const startConnection = async () => {
      try {
        await connection.start();

        if (!cancelled) {
          setConnectionState("Connected");
        }
      } catch (error) {
        // StrictMode mount-unmount-mount dongusunde connection baslarken stop edilirse,
        // SignalR "The connection was stopped during negotiation." hatasi firlatir.
        // Bu durum React'in dogal cleanup surecinden kaynaklandigi icin goz ardi etmeliyiz.
        const isNegotiationCancel = error.message && error.message.includes("stopped during negotiation");
        
        if (!cancelled && !isNegotiationCancel) {
          console.error("SignalR connection failed:", error);
          setConnectionState("Disconnected");
        }
      }
    };

    startConnection();

    return () => {
      cancelled = true;
      connection.off("ActiveUsersChanged", handleActiveUsersChanged);
      connection.stop();
    };
  }, [enabled]);

  return {
    activeUserIds,
    connectionState,
  };
}

