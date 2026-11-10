import inlineStyles from "../../styles/inlineStyles.js";
function ConnectionCard({ connection, onOpen, onEdit, onDelete }) {
  const account = connection.accountInfo;

  function formatExpiration(date) {
    if (!date) {
      return "Não informada";
    }

    return new Date(date).toLocaleDateString("pt-BR");
  }

  return (
    <article style={inlineStyles("rounded-2xl border border-white/10 bg-white/[0.04] p-7")}>
      <div style={inlineStyles("mb-6 flex items-center mb-4 mr-4")}>
        <div style={inlineStyles("flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl text-indigo-400 mr-3")}>
          TV
        </div>

        <div style={inlineStyles("min-w-0 flex-1")}>
          <h3 style={inlineStyles("truncate text-2xl font-bold")}>{connection.name}</h3>

          <p style={inlineStyles("mt-1 truncate text-base text-gray-400")}>
            {connection.server}
          </p>
        </div>
      </div>

      <p style={inlineStyles("mb-3 text-base text-gray-400")}>
        Usuário: {connection.username}
      </p>

      {account ? (
        <div style={inlineStyles("mb-6 rounded-lg bg-white/5 p-4")}>
          <p style={inlineStyles("mb-2 text-sm font-semibold text-green-300")}>
            Última verificação: conexão válida
          </p>

          <p style={inlineStyles("text-sm text-gray-300")}>
            Validade: {formatExpiration(account.expirationDate)}
          </p>

          <p style={inlineStyles("mt-1 text-sm text-gray-300")}>
            Conexões simultâneas: {account.maxConnections || "Não informado"}
          </p>
        </div>
      ) : (
        <p style={inlineStyles("mb-6 text-sm text-yellow-300")}>
          Conexão ainda não verificada
        </p>
      )}

      <div style={inlineStyles("flex flex-col")}>
        <button
          type="button"
          onClick={() => onOpen(connection)}
          style={inlineStyles("w-full rounded-lg bg-indigo-800 px-2 py-3 text-lg font-semibold purple:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-400")}
        >
          Abrir
        </button>

        <div style={inlineStyles("flex align-middle justify-items-center mt-2")}>
          <button
            type="button"
            onClick={() => onEdit(connection)}
            style={inlineStyles("flex-1 rounded-lg border border-white/20 px-5 py-3 text-lg font-semibold hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-400")}
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => onDelete(connection)}
            style={{...(inlineStyles("flex-1 rounded-lg border border-red-400/30 px-5 py-3 text-lg font-semibold text-red-300 hover:bg-red-500/10 focus:outline-none focus:ring-4 focus:ring-red-400")), ...{"marginLeft":"16px"}}}
          >
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}

export default ConnectionCard;
