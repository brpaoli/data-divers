const STORAGE_KEY = "data-divers-iptv-connections";

export function getConnections() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const connections = JSON.parse(data);

    return Array.isArray(connections) ? connections : [];
  } catch (error) {
    console.error("Erro ao carregar conexões:", error);
    return [];
  }
}

export function saveConnections(connections) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}
