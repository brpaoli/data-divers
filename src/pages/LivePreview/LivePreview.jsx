import inlineStyles from "../../styles/inlineStyles.js";
import { useEffect, useState, useSyncExternalStore } from "react";

import { getLiveStreamUrl, getXtreamShortEPG } from "../../services/xtream";

import VideoPlayer from "../../components/Player/VideoPlayer";
import Logo from "../../components/Logo/Logo";
import Icon from "../../components/Icon/Icon";

function decodeEPGText(value) {
  if (typeof value !== "string") return value || "";

  const text = value.trim();
  const compact = text.replace(/\s+/g, "");
  const base64 = compact.replace(/-/g, "+").replace(/_/g, "/");

  if (!base64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) return value;

  const unpadded = base64.replace(/=+$/, "");
  if (unpadded.length % 4 === 1) return value;

  const padded = unpadded.padEnd(Math.ceil(unpadded.length / 4) * 4, "=");

  try {
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    let decoded;

    try {
      decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      // A few Xtream providers Base64-encode legacy Windows-1252 text.
      decoded = new TextDecoder("windows-1252").decode(bytes);
    }

    decoded = decoded.trim();
    const hasControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/.test(decoded);
    const readableCharacters = (decoded.match(/[\p{L}\p{N}\p{P}\p{Z}]/gu) || []).length;
    const isReadable =
      decoded.length >= 2 &&
      !hasControlCharacters &&
      readableCharacters / decoded.length >= 0.9 &&
      /[\p{L}\p{N}]/u.test(decoded);

    return isReadable ? decoded : value;
  } catch {
    return value;
  }
}

function formatTime(value) {
  if (!value) return "--:--";

  let date;

  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    date = new Date(numericValue * 1000);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProgramStart(program) {
  return program.start_timestamp || program.start;
}

function getProgramEnd(program) {
  return (
    program.stop_timestamp ||
    program.end_timestamp ||
    program.stop ||
    program.end
  );
}

// useSyncExternalStore helpers for reading the system clock without calling
// Date.now() directly during render (which violates the purity rule).
function subscribeTime(callback) {
  const interval = setInterval(callback, 60_000);
  return () => clearInterval(interval);
}

function getNowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function LivePreview({
  connection,
  channel,
  isFullscreen,
  onBack,
  onEnterFullscreen,
  onExitFullscreen,
}) {
  const { server, username, password } = connection;
  const streamId = channel.stream_id;

  // Derive stream URL and error from props during render. getLiveStreamUrl is
  // a pure function, so this avoids storing derived data in state and calling
  // setState synchronously inside an effect.
  let streamUrl = "";
  let streamError = "";

  try {
    streamUrl = getLiveStreamUrl(connection, channel);
  } catch (error) {
    streamError = error.message;
  }

  const [programs, setPrograms] = useState([]);
  const [loadingEPG, setLoadingEPG] = useState(() => Boolean(streamId));

  // Reset EPG state when the connection or channel changes. This render-phase
  // pattern (comparing a previous value stored in state) is the React-recommended
  // way to adjust state in response to prop changes without cascading renders.
  const epgKey = `${server}|${username}|${password}|${streamId}`;
  const [prevEpgKey, setPrevEpgKey] = useState(epgKey);
  if (epgKey !== prevEpgKey) {
    setPrevEpgKey(epgKey);
    setPrograms([]);
    setLoadingEPG(Boolean(streamId));
  }

  useEffect(() => {
    if (!streamId) return undefined;

    const controller = new AbortController();

    async function loadEPG() {
      try {
        const result = await getXtreamShortEPG(
          { server, username, password },
          streamId,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setPrograms(result);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Não foi possível carregar a programação:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingEPG(false);
        }
      }
    }

    loadEPG().catch(() => {
      // All errors are handled inside loadEPG.
    });

    return () => controller.abort();
  }, [server, username, password, streamId]);

  const now = useSyncExternalStore(subscribeTime, getNowInSeconds, () => 0);

  const currentProgram = programs.find((program) => {
    const start = Number(getProgramStart(program));
    const end = Number(getProgramEnd(program));

    return start > 0 && end > 0 && now >= start && now <= end;
  });

  const upcomingPrograms = programs.filter((program) => {
    const start = Number(getProgramStart(program));
    return start > now;
  });

  return (
    <main style={inlineStyles("min-h-screen bg-[#10131c] text-white")}>
      {!isFullscreen && (
        <header style={inlineStyles("flex items-center justify-between border-b border-white/10 px-12 py-6")}>
          <Logo />
          <button
            type="button"
            onClick={onBack}
            style={inlineStyles("border border-white px-6 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-400")}
          >
            <><Icon name="back" style={inlineStyles("mr-2 inline-block align-middle")} size={20} />Voltar ao catálogo</>
          </button>
        </header>
      )}

      {streamError ? (
        <div style={inlineStyles("mx-auto mt-16 max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-red-300")}>
          <h2 style={inlineStyles("mb-3 text-2xl font-bold")}>
            Não foi possível abrir o canal
          </h2>
          <p>{streamError}</p>
        </div>
      ) : (
        <div
          style={inlineStyles(isFullscreen ? "h-screen" : "mx-auto max-w-[1500px] px-12 py-10")}
        >
          {!isFullscreen && (
            <div style={inlineStyles("mb-8")}>
              <p style={inlineStyles("mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-400")}>
                TV ao vivo
              </p>

              <h2 style={inlineStyles("text-4xl font-bold")}>{channel.name}</h2>
            </div>
          )}

          {streamUrl && (
            <div style={inlineStyles(isFullscreen ? "h-full" : "max-w-5xl")}>
              <VideoPlayer
                src={streamUrl}
                title={channel.name}
                isFullscreen={isFullscreen}
                onEnterFullscreen={onEnterFullscreen}
                onExitFullscreen={onExitFullscreen}
              />
            </div>
          )}

          {!isFullscreen && (
            <section style={inlineStyles("mt-10")}>
              <div style={inlineStyles("mb-6")}>
                <h3 style={inlineStyles("text-2xl font-bold text-indigo-400")}>Programação</h3>

                <p style={inlineStyles("mt-2 text-gray-200 text-sm")}>
                  Confira o programa atual e os próximos horários.
                </p>
              </div>

              {loadingEPG ? (
                <div style={inlineStyles("flex items-center py-8 text-gray-400")}>
                  <div style={{...(inlineStyles("h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500")), marginRight:"12px"}} />
                  Carregando programação...
                </div>
              ) : programs.length === 0 ? (
                <div style={inlineStyles("rounded-xl border border-white/10 bg-white/[0.04] p-8")}>
                  <p style={inlineStyles("text-lg text-gray-300")}>
                    A programação deste canal não está disponível.
                  </p>
                  <p style={inlineStyles("mt-2 text-sm text-gray-500")}>
                    O servidor IPTV pode não fornecer informações de EPG.
                  </p>
                </div>
              ) : (
                <div style={inlineStyles("grid grid-cols-3 gap-5")}>
                  {currentProgram && (
                    <article style={inlineStyles("rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-6")}>
                      <p style={inlineStyles("mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400")}>
                        Agora
                      </p>

                      <h4 style={inlineStyles("text-xs font-bold")}>
                        {decodeEPGText(currentProgram.title) ||
                          "Programa atual"}
                      </h4>

                      <p style={inlineStyles("mt-3 text-xs text-gray-400")}>
                        {formatTime(getProgramStart(currentProgram))}
                        {" - "}
                        {formatTime(getProgramEnd(currentProgram))}
                      </p>

                      </article>
                  )}

                  {upcomingPrograms.slice(0, 5).map((program, index) => (
                    <article
                      key={`${getProgramStart(program)}-${index}`}
                      style={inlineStyles("rounded-xl border border-white/10 bg-white/[0.04] p-6")}
                    >
                      <p style={inlineStyles("mb-3 text-xs font-bold uppercase tracking-wider text-gray-500")}>
                        Próximo programa
                      </p>

                      <h4 style={inlineStyles("text-sm font-semibold")}>
                        {decodeEPGText(program.title) || "Programa"}
                      </h4>

                      <p style={inlineStyles("mt-3 text-xs text-gray-100")}>
                        {formatTime(getProgramStart(program))}
                        {" - "}
                        {formatTime(getProgramEnd(program))}
                      </p>

                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}

export default LivePreview;
