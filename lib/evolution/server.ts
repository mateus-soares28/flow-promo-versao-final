type EvolutionResponse = Record<string, unknown>;

export type WhatsappConnection = {
  state: string;
  qrCode: string | null;
  phone: string | null;
};

export type EvolutionGroup = { id: string; name: string; members: number };

function getConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL?.trim().replace(/\/+$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  if (!baseUrl || !apiKey) throw new Error("Evolution API não configurada.");
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    throw new Error("Evolution API exige HTTPS em produção.");
  }
  return { baseUrl, apiKey };
}

async function evolutionRequest(path: string, init: RequestInit = {}): Promise<EvolutionResponse> {
  const { baseUrl, apiKey } = getConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      "content-type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json().catch(() => ({})) as EvolutionResponse;
  if (!response.ok) {
    console.error("Evolution API request failed", { path, status: response.status });
    throw new Error("Evolution API não conseguiu concluir a operação.");
  }
  return body;
}

function normalizeQrCode(body: EvolutionResponse) {
  const qr = body.qrcode && typeof body.qrcode === "object" ? body.qrcode as EvolutionResponse : body;
  const value = qr.base64 ?? body.base64;
  if (typeof value !== "string" || !value.trim()) return null;
  return value.startsWith("data:image/") ? value : value.startsWith("http") ? value : `data:image/png;base64,${value}`;
}

export async function createEvolutionInstance(instanceName: string) {
  return evolutionRequest("/instance/create", {
    method: "POST",
    body: JSON.stringify({ instanceName, integration: "WHATSAPP-BAILEYS", qrcode: true }),
  });
}

export async function connectEvolutionInstance(instanceName: string): Promise<WhatsappConnection> {
  const body = await evolutionRequest(`/instance/connect/${encodeURIComponent(instanceName)}`);
  return { state: "connecting", qrCode: normalizeQrCode(body), phone: null };
}

export async function getEvolutionConnection(instanceName: string): Promise<WhatsappConnection> {
  const body = await evolutionRequest(`/instance/connectionState/${encodeURIComponent(instanceName)}`);
  const instance = body.instance && typeof body.instance === "object" ? body.instance as EvolutionResponse : body;
  const state = String(instance.state ?? body.state ?? "unknown").toLowerCase();
  return {
    state,
    qrCode: normalizeQrCode(body),
    phone: typeof instance.owner === "string" ? instance.owner.split("@")[0] : null,
  };
}

export async function logoutEvolutionInstance(instanceName: string) {
  return evolutionRequest(`/instance/logout/${encodeURIComponent(instanceName)}`, { method: "DELETE" });
}

export async function sendEvolutionText(instanceName: string, number: string, text: string) {
  return evolutionRequest(`/message/sendText/${encodeURIComponent(instanceName)}`, {
    method: "POST",
    body: JSON.stringify({ number, text }),
  });
}

export async function fetchEvolutionGroups(instanceName: string): Promise<EvolutionGroup[]> {
  const body = await evolutionRequest(`/group/fetchAllGroups/${encodeURIComponent(instanceName)}?getParticipants=false`);
  const rows = Array.isArray(body) ? body : Array.isArray(body.groups) ? body.groups as unknown[] : [];
  return rows.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const group = item as Record<string, unknown>;
    const id = typeof group.id === "string" ? group.id : typeof group.jid === "string" ? group.jid : "";
    if (!/^\d{5,30}@g\.us$/.test(id)) return [];
    return [{
      id,
      name: typeof group.subject === "string" && group.subject.trim() ? group.subject.trim() : id,
      members: typeof group.size === "number" && Number.isFinite(group.size) ? group.size : 0,
    }];
  });
}
