import inlineStyles from "../../styles/inlineStyles.js";
import { useState } from "react";
import ConnectionCard from "../../components/ConnectionCard/ConnectionCard";
import Logo from "../../components/Logo/Logo";
import Icon from "../../components/Icon/Icon";

function Connections({ connections, error, onAdd, onEdit, onDelete, onOpen }) {
  const [connectionToDelete, setConnectionToDelete] = useState(null);

  function confirmDelete() {
    if (connectionToDelete) {
      onDelete(connectionToDelete.id);
      setConnectionToDelete(null);
    }
  }

  return (
    <main style={inlineStyles("min-h-screen bg-[#10131c] text-white")}>
      <header style={inlineStyles("flex items-center justify-between border-b border-white/10 px-16 py-8")}>
        <Logo />

        <span style={inlineStyles("text-sm text-gray-200 font-bold")}>Minhas conexões</span>
      </header>

      <section style={inlineStyles("px-16 py-14")}>
        <div style={inlineStyles("mb-10 flex items-center justify-between")}>
          <div>
            <h2 style={inlineStyles("text-4xl font-bold")}>Minhas conexões</h2>

            <p style={inlineStyles("mt-3 text-lg text-gray-400")}>
              Gerencie suas listas IPTV em um só lugar.
            </p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            style={inlineStyles("rounded-xl bg-green-600 px-8 py-5 text-xl font-semibold hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300")}
          >
            <><Icon name="plus" style={inlineStyles("mr-2 inline-block align-middle")} size={22} />Adicionar conexão</>
          </button>
        </div>

        {error && (
          <p style={inlineStyles("mb-6 rounded-lg bg-red-500/10 p-4 text-red-300")}>
            {error}
          </p>
        )}

        {connections.length === 0 ? (
          <div style={inlineStyles("flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03]")}>
            <div style={inlineStyles("mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 text-5xl text-indigo-400")}>
              <Icon name="plus" size={36} />
            </div>

            <h3 style={inlineStyles("text-2xl font-semibold")}>
              Nenhuma conexão cadastrada
            </h3>

            <p style={inlineStyles("mt-3 text-lg text-gray-400")}>
              Adicione sua primeira conexão para começar.
            </p>

            <button
              type="button"
              onClick={onAdd}
              style={inlineStyles("mt-8 rounded-xl bg-indigo-600 px-10 py-5 text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-300")}
            >
              Adicionar conexão
            </button>
          </div>
        ) : (
          <div style={inlineStyles("grid grid-cols-3 gap-4 mb-4 mr-4")}>
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={setConnectionToDelete}
              />
            ))}
          </div>
        )}
      </section>

      <footer style={inlineStyles("px-16 py-6 text-center text-sm text-gray-200")}>
        Sua central de entretenimento - <strong>Data Divers</strong>
      </footer>

      {connectionToDelete && (
        <div style={inlineStyles("fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-8")}>
          <div style={inlineStyles("w-full max-w-xl rounded-2xl border border-white/10 bg-[#1b2030] p-10")}>
            <h3 style={inlineStyles("text-3xl font-bold")}>Excluir conexão?</h3>

            <p style={inlineStyles("mb-8 mt-4 text-lg text-gray-300")}>
              Deseja realmente excluir{" "}
              <strong>{connectionToDelete.name}</strong>? Essa ação não poderá
              ser desfeita.
            </p>

            <div style={inlineStyles("flex justify-end mb-4 mr-4")}>
              <button
                type="button"
                onClick={() => setConnectionToDelete(null)}
                style={inlineStyles("rounded-lg border border-white/20 px-7 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-300")}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                style={inlineStyles("rounded-lg bg-red-600 px-7 py-4 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-red-300")}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Connections;
