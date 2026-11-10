import { useState } from "react";
import { getConnections, saveConnections } from "../services/storage";

function useConnections() {
  const [connections, setConnections] = useState(() => getConnections());

  const [error, setError] = useState("");

  function persist(nextConnections) {
    try {
      saveConnections(nextConnections);
      setConnections(nextConnections);
      setError("");

      return true;
    } catch (error) {
      console.error("Erro ao salvar conexões:", error);
      setError("Não foi possível salvar os dados.");
      return false;
    }
  }

  function addConnection(connection) {
    const newConnection = {
      ...connection,
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    };

    return persist([...connections, newConnection]);
  }

  function updateConnection(updatedConnection) {
    const nextConnections = connections.map((connection) =>
      connection.id === updatedConnection.id ? updatedConnection : connection,
    );

    return persist(nextConnections);
  }

  function deleteConnection(id) {
    const nextConnections = connections.filter(
      (connection) => connection.id !== id,
    );

    return persist(nextConnections);
  }

  return {
    connections,
    error,
    addConnection,
    updateConnection,
    deleteConnection,
  };
}

export default useConnections;
