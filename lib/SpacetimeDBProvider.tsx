import { useEffect, useState, useCallback } from "react";
import { ensureConnected, subscribe, getConnectionState, getUsers, getMessages, getGroupChats, getGroupMembers } from "./db";
import type { User, Message, GroupChat, GroupMember } from "./db";

export type { User, Message, GroupChat, GroupMember };

export type ConnectionInfo = {
  isActive: boolean;
  identity: { toHexString(): string } | null;
  tablesReady: boolean;
  error: string | null;
};

let _started = false;

export function useSpacetimeDB() {
  const [conn, setConn] = useState<ConnectionInfo>(getConnectionState);
  const [users, setUsers] = useState<readonly User[]>(getUsers);
  const [messages, setMessages] = useState<readonly Message[]>(getMessages);
  const [groupChats, setGroupChats] = useState<readonly GroupChat[]>(getGroupChats);
  const [groupMembers, setGroupMembers] = useState<readonly GroupMember[]>(getGroupMembers);

  const refresh = useCallback(() => {
    const nextConn = getConnectionState();
    setConn((prev) =>
      prev.isActive === nextConn.isActive &&
      prev.tablesReady === nextConn.tablesReady &&
      prev.identity === nextConn.identity &&
      prev.error === nextConn.error
        ? prev
        : nextConn
    );
    setUsers((prev) => {
      const next = getUsers();
      return prev === next ? prev : next;
    });
    setMessages((prev) => {
      const next = getMessages();
      return prev === next ? prev : next;
    });
    setGroupChats((prev) => {
      const next = getGroupChats();
      return prev === next ? prev : next;
    });
    setGroupMembers((prev) => {
      const next = getGroupMembers();
      return prev === next ? prev : next;
    });
  }, []);

  useEffect(() => {
    if (!_started) {
      _started = true;
      ensureConnected().catch((err) => {
        console.error("[SpacetimeDBProvider] connect failed:", err);
        _started = false;
      });
    }
    const unsub = subscribe(refresh);
    refresh();
    return unsub;
  }, [refresh]);

  return { conn, users, messages, groupChats, groupMembers };
}
