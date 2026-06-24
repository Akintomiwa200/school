type StoredSignal = {
  id: string;
  callId: string;
  type: "offer" | "answer" | "ice" | "hangup" | "decline";
  payload?: unknown;
  fromUserId: string;
  createdAt: number;
};

type CallSession = {
  id: string;
  conversationId: string;
  callType: "voice" | "video";
  createdAt: number;
  participants: string[];
};

const calls = new Map<string, CallSession>();
const signals = new Map<string, StoredSignal[]>();

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCall(conversationId: string, callType: "voice" | "video", userId: string) {
  const callId = nextId("call");
  calls.set(callId, {
    id: callId,
    conversationId,
    callType,
    createdAt: Date.now(),
    participants: [userId],
  });
  signals.set(callId, []);
  return { callId, isInitiator: true };
}

export function addSignal(
  callId: string,
  signal: Omit<StoredSignal, "id" | "callId" | "createdAt">,
) {
  const call = calls.get(callId);
  if (!call) return null;

  if (!call.participants.includes(signal.fromUserId)) {
    call.participants.push(signal.fromUserId);
  }

  const entry: StoredSignal = {
    id: nextId("sig"),
    callId,
    createdAt: Date.now(),
    ...signal,
  };

  const list = signals.get(callId) ?? [];
  list.push(entry);
  signals.set(callId, list.slice(-200));
  return entry;
}

export function getSignalsSince(callId: string, since: number) {
  const list = signals.get(callId) ?? [];
  return list.filter((signal) => signal.createdAt > since);
}

export function getCall(callId: string) {
  return calls.get(callId) ?? null;
}

export function endCall(callId: string) {
  calls.delete(callId);
  signals.delete(callId);
}
