import { getAdmissionConfig } from "./admission-config-store";

export type AdmissionStreamEvent =
  | { type: "admissions:sync"; payload: { connectedAt: string; updatedAt: string } }
  | { type: "admissions:invalidate"; payload: { reason: string; at: string; updatedAt: string } };

type StreamClient = {
  send: (event: AdmissionStreamEvent) => void;
};

const streamClients = new Map<string, StreamClient>();

export function registerAdmissionStreamClient(id: string, client: StreamClient) {
  streamClients.set(id, client);
}

export function unregisterAdmissionStreamClient(id: string) {
  streamClients.delete(id);
}

export function broadcastAdmissionConfigChange(reason: string) {
  const updatedAt = getAdmissionConfig().updatedAt;
  const event: AdmissionStreamEvent = {
    type: "admissions:invalidate",
    payload: { reason, at: new Date().toISOString(), updatedAt },
  };
  streamClients.forEach((client) => client.send(event));
}
