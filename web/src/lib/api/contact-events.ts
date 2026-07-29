import { getContactMessagesUpdatedAt } from "./contact-messages-store";

export type ContactStreamEvent =
  | { type: "contact:sync"; payload: { connectedAt: string; updatedAt: string } }
  | { type: "contact:invalidate"; payload: { reason: string; at: string; updatedAt: string } };

type StreamClient = {
  send: (event: ContactStreamEvent) => void;
};

const streamClients = new Map<string, StreamClient>();

export function registerContactStreamClient(id: string, client: StreamClient) {
  streamClients.set(id, client);
}

export function unregisterContactStreamClient(id: string) {
  streamClients.delete(id);
}

export function broadcastContactChange(reason: string) {
  const updatedAt = getContactMessagesUpdatedAt();
  const event: ContactStreamEvent = {
    type: "contact:invalidate",
    payload: { reason, at: new Date().toISOString(), updatedAt },
  };
  streamClients.forEach((client) => client.send(event));
}
