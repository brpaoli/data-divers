const SECTION_ACTIONS = {
  live: {
    categories: "get_live_categories",
    content: "get_live_streams",
  },
  movies: {
    categories: "get_vod_categories",
    content: "get_vod_streams",
  },
  series: {
    categories: "get_series_categories",
    content: "get_series",
  },
};

async function requestXtream(connection, params = {}, signal) {
  const server = connection.server.trim().replace(/\/+$/, "");

  const endpoint = new URL(`${server}/player_api.php`);

  endpoint.searchParams.set("username", connection.username);
  endpoint.searchParams.set("password", connection.password);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      endpoint.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status} ao consultar o servidor.`);
  }

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("O servidor retornou uma resposta inválida.");
  }

  return data;
}

function validateSection(section) {
  if (!SECTION_ACTIONS[section]) {
    throw new Error("Seção de conteúdo inválida.");
  }
}

function validateArray(data, description) {
  if (!Array.isArray(data)) {
    throw new Error(
      `Não foi possível carregar ${description}. Resposta inesperada do servidor.`,
    );
  }

  return data;
}

// Autenticação
export async function authenticateXtream(connection) {
  const data = await requestXtream(connection);

  if (!data || !data.user_info) {
    throw new Error("Resposta incompatível com a API Xtream Codes.");
  }

  const userInfo = data.user_info;

  if (Number(userInfo.auth) !== 1) {
    throw new Error("Usuário ou senha inválidos.");
  }

  const accountStatus = String(userInfo.status || "").toLowerCase();

  if (accountStatus && accountStatus !== "active") {
    throw new Error(
      `Sua conta não está ativa. Status informado: ${userInfo.status}.`,
    );
  }

  const expirationTimestamp = Number(userInfo.exp_date);

  return {
    success: true,
    account: {
      username: userInfo.username || connection.username,
      status: userInfo.status || "Ativa",
      expirationDate:
        expirationTimestamp > 0
          ? new Date(expirationTimestamp * 1000).toISOString()
          : null,
      isTrial: Number(userInfo.is_trial) === 1,
      activeConnections: Number(userInfo.active_cons || 0),
      maxConnections: Number(userInfo.max_connections || 0),
      allowedFormats: userInfo.allowed_output_formats || [],
    },
    server: data.server_info || null,
  };
}

// Categorias
export async function getXtreamCategories(connection, section, signal) {
  validateSection(section);

  const action = SECTION_ACTIONS[section].categories;

  const data = await requestXtream(connection, { action }, signal);

  return validateArray(data, "as categorias");
}

// Conteúdos com suporte a paginação
export async function getXtreamContent(
  connection,
  section,
  categoryId = "all",
  signal,
  pagination = {},
) {
  validateSection(section);

  const action = SECTION_ACTIONS[section].content;

  const params = { action };

  if (categoryId !== "all") {
    params.category_id = categoryId;
  }

  // Parâmetros opcionais de paginação.
  if (pagination.start !== undefined) {
    params.start = pagination.start;
  }

  if (pagination.limit !== undefined) {
    params.limit = pagination.limit;
  }

  const data = await requestXtream(connection, params, signal);

  return validateArray(data, "os conteúdos");
}

export function getLiveStreamUrl(connection, channel) {
  if (channel.direct_source) {
    return channel.direct_source;
  }

  const server = connection.server.trim().replace(/\/+$/, "");
  const username = encodeURIComponent(connection.username);
  const password = encodeURIComponent(connection.password);

  const streamId = channel.stream_id;

  if (!streamId) {
    throw new Error("Não foi possível identificar o canal.");
  }

  // HLS funciona nos navegadores modernos (com hls.js no Chromium) e em TVs.
  const extension = channel.container_extension || "m3u8";

  return `${server}/live/${username}/${password}/${streamId}.${extension}`;
}

export async function getXtreamShortEPG(connection, streamId, signal) {
  const data = await requestXtream(
    connection,
    {
      action: "get_short_epg",
      stream_id: streamId,
      limit: 10,
    },
    signal,
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.epg_listings)) {
    return data.epg_listings;
  }

  return [];
}
