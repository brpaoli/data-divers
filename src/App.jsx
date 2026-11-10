import inlineStyles from "./styles/inlineStyles.js";
import { useCallback, useState } from "react";

import Connections from "./pages/Connections/Connections";
import ConnectionForm from "./pages/ConnectionForm/ConnectionForm";
import Catalog from "./pages/Catalog/Catalog";
import LivePreview from "./pages/LivePreview/LivePreview";

import useConnections from "./hooks/useConnections";
import useRemoteNavigation from "./hooks/useRemoteNavigation";

function App() {
  const {
    connections,
    error,
    addConnection,
    updateConnection,
    deleteConnection,
  } = useConnections();

  const [page, setPage] = useState("connections");
  const [editingConnection, setEditingConnection] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  function handleAdd() {
    setEditingConnection(null);
    setPage("form");
  }

  function handleEdit(connection) {
    setEditingConnection(connection);
    setPage("form");
  }

  function handleOpen(connection) {
    setSelectedConnection(connection);
    setPage("catalog");
  }

  function handleSelectChannel(channel) {
    setSelectedChannel(channel);
    setPage("livePreview");
  }

  function handleSave(connection) {
    if (editingConnection) {
      return updateConnection(connection);
    }

    return addConnection(connection);
  }

  const handleBack = useCallback(() => {
    if (page === "livePlayer") {
      setPage("livePreview");
      return;
    }

    if (page === "livePreview") {
      setPage("catalog");
      return;
    }

    if (page === "form" || page === "catalog") {
      setEditingConnection(null);
      setSelectedConnection(null);
      setSelectedChannel(null);
      setPage("connections");
    }
  }, [page]);

  useRemoteNavigation(handleBack);

  if (page === "form") {
    return (
      <ConnectionForm
        initialData={editingConnection}
        onBack={handleBack}
        onSave={handleSave}
      />
    );
  }

  if (
    selectedConnection &&
    ["catalog", "livePreview", "livePlayer"].includes(page)
  ) {
    return (
      <>
        {/* Mantemos o catálogo montado para preservar sua posição e pesquisa. */}
        <div style={inlineStyles(page === "catalog" ? "block" : "hidden")}>
          <Catalog
            connection={selectedConnection}
            onBack={handleBack}
            onSelectChannel={handleSelectChannel}
          />
        </div>

        {(page === "livePreview" || page === "livePlayer") &&
          selectedChannel && (
            <LivePreview
              connection={selectedConnection}
              channel={selectedChannel}
              isFullscreen={page === "livePlayer"}
              onBack={() => setPage("catalog")}
              onEnterFullscreen={() => setPage("livePlayer")}
              onExitFullscreen={() => setPage("livePreview")}
            />
          )}
      </>
    );
  }

  return (
    <Connections
      connections={connections}
      error={error}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={deleteConnection}
      onOpen={handleOpen}
    />
  );
}

export default App;
