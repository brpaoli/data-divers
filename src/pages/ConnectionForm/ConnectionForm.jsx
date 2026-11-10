import inlineStyles from "../../styles/inlineStyles.js";
import { useState } from "react";
import { authenticateXtream } from "../../services/xtream";
import Logo from "../../components/Logo/Logo";
import Icon from "../../components/Icon/Icon";

function ConnectionForm({ initialData, onBack, onSave }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    server: initialData?.server || "",
    username: initialData?.username || "",
    password: initialData?.password || "",
  });

  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const isEditing = Boolean(initialData);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError("");
    setTestResult(null);
  }

  function handleInputFocus(event) {
    const input = event.currentTarget;

    window.setTimeout(() => {
      input.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 250);
  }

  function validateForm() {
    if (
      !form.name.trim() ||
      !form.server.trim() ||
      !form.username.trim() ||
      !form.password
    ) {
      setError("Preencha todos os campos.");
      return false;
    }

    try {
      const url = new URL(form.server.trim());

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Protocolo inválido");
      }
    } catch {
      setError("Informe uma URL válida, começando com http:// ou https://.");
      return false;
    }

    return true;
  }

  async function handleTestConnection() {
    setError("");
    setTestResult(null);

    if (!validateForm()) {
      return;
    }

    setTesting(true);

    try {
      const result = await authenticateXtream({
        ...form,
        server: form.server.trim().replace(/\/+$/, ""),
      });

      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
      });
    } finally {
      setTesting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const connection = {
      ...form,
      name: form.name.trim(),
      server: form.server.trim().replace(/\/+$/, ""),
      username: form.username.trim(),
      accountInfo: testResult?.success ? testResult.account : null,
    };

    if (isEditing) {
      connection.id = initialData.id;
    }

    const saved = onSave(connection);

    if (saved) {
      onBack();
    } else {
      setError("Não foi possível salvar a conexão.");
    }
  }

  function formatExpiration(date) {
    if (!date) {
      return "Não informada ou sem expiração";
    }

    return new Date(date).toLocaleDateString("pt-BR");
  }

  return (
    <main style={inlineStyles("h-screen overflow-y-auto scroll-pb-64 bg-[#10131c] text-white")}>
      <header style={inlineStyles("border-b border-white/10 px-16 py-8")}>
        <Logo />
      </header>

      <section style={inlineStyles("mx-auto max-w-3xl px-8 py-8 pb-48")}>
        <button
          type="button"
          onClick={onBack}
          style={inlineStyles("mb-8 text-lg text-gray-400 focus:outline-none focus:text-white")}
        >
          <><Icon name="back" style={inlineStyles("mr-2 inline-block align-middle")} size={20} />Voltar</>
        </button>

        <h2 style={inlineStyles("text-4xl font-bold")}>
          {isEditing ? "Editar conexão" : "Nova conexão"}
        </h2>

        <p style={inlineStyles("mb-8 mt-3 text-lg text-gray-400")}>
          Informe os dados de acesso do seu servidor IPTV.
        </p>

        {error && (
          <p style={inlineStyles("mb-6 rounded-lg bg-red-500/10 p-4 text-red-300")}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column"}}>
          <div>
            <label htmlFor="name" style={inlineStyles("mb-2 block text-lg")}>
              Nome da conexão
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              onFocus={handleInputFocus}
              required
              maxLength={60}
              placeholder="Ex.: Minha IPTV"
              style={inlineStyles("w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500")}
            />
          </div>

          <div style={{"marginTop":"24px"}}>
            <label htmlFor="server" style={inlineStyles("mb-2 block text-lg")}>
              URL do servidor
            </label>

            <input
              id="server"
              name="server"
              type="text"
              value={form.server}
              onChange={handleChange}
              onFocus={handleInputFocus}
              required
              placeholder="http://servidor.com:8080"
              style={inlineStyles("w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500")}
            />
          </div>

          <div style={{"marginTop":"24px"}}>
            <label htmlFor="username" style={inlineStyles("mb-2 block text-lg")}>
              Usuário
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              onFocus={handleInputFocus}
              required
              placeholder="Seu usuário"
              style={inlineStyles("w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500")}
            />
          </div>

          <div style={{"marginTop":"24px"}}>
            <label htmlFor="password" style={inlineStyles("mb-2 block text-lg")}>
              Senha
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onFocus={handleInputFocus}
              required
              placeholder="Sua senha"
              style={inlineStyles("w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500")}
            />
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            style={{...(inlineStyles("w-full rounded-xl border border-indigo-800 px-8 py-4 text-lg font-semibold text-indigo-300 hover:bg-indigo-500/10 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50")), ...{"marginTop":"24px"}}}
          >
            {testing ? "Testando conexão..." : "Testar conexão"}
          </button>

          {testResult && (
            <div
              style={{...(inlineStyles(`rounded-xl border p-6 ${
                testResult.success
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`)), ...{"marginTop":"24px"}}}
            >
              {testResult.success ? (
                <>
                  <h3 style={inlineStyles("mb-4 text-xl font-bold text-green-300")}>
                    Conexão estabelecida!
                  </h3>

                  <div style={inlineStyles("text-base text-gray-200")}>
                    <p>
                      <strong>Usuário:</strong> {testResult.account.username}
                    </p>

                    <p style={{"marginTop":"8px"}}>
                      <strong>Status:</strong> {testResult.account.status}
                    </p>

                    <p style={{"marginTop":"8px"}}>
                      <strong>Validade:</strong>
                      {testResult.account.expirationDate}
                    </p>

                    <p style={{"marginTop":"8px"}}>
                      <strong>Tipo de conta:</strong>
                      {testResult.account.isTrial ? "Teste" : "Regular"}
                    </p>

                    <p style={{"marginTop":"8px"}}>
                      <strong>Conexões simultâneas:</strong>
                      {testResult.account.maxConnections || "Não informado"}
                    </p>

                    <p style={{"marginTop":"8px"}}>
                      <strong>Conexões em uso: </strong>
                      {testResult.account.activeConnections}
                    </p>

                    <p style={{"marginTop":"8px"}}>
                      <strong>Formatos permitidos:</strong>
                      {testResult.account.allowedFormats.join(", ") ||
                        "Não informado"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={inlineStyles("mb-2 text-xl font-bold text-red-300")}>
                    Falha na conexão
                  </h3>

                  <p style={inlineStyles("text-base text-gray-200")}>
                    {testResult.message}
                  </p>
                </>
              )}
            </div>
          )}

          <div style={{...(inlineStyles("flex justify-end mb-4 mr-4 pt-6")), ...{"marginTop":"24px"}}}>
            <button
              type="button"
              onClick={onBack}
              style={inlineStyles("rounded-xl border border-white/20 px-8 py-5 text-xl focus:outline-none focus:ring-4 focus:ring-indigo-300")}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={testing}
              style={inlineStyles("rounded-xl bg-indigo-800 px-10 py-5 text-xl font-semibold hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50")}
            >
              {isEditing ? "Salvar alterações" : "Salvar conexão"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default ConnectionForm;
