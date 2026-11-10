import inlineStyles from "../../styles/inlineStyles.js";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../Icon/Icon";

function VideoPlayer({
  src,
  title,
  isFullscreen,
  onEnterFullscreen,
  onExitFullscreen,
}) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const [videoError, setVideoError] = useState("");
  const [controlsVisible, setControlsVisible] = useState(false);

  // Reset controls to hidden whenever fullscreen state changes.
  // Done during render (not in an effect) to avoid cascading renders.
  const [prevFullscreen, setPrevFullscreen] = useState(isFullscreen);
  if (prevFullscreen !== isFullscreen) {
    setPrevFullscreen(isFullscreen);
    setControlsVisible(false);
  }

  // Clear any previous playback error when the source changes.
  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setVideoError("");
  }

  const showControls = useCallback(() => {
    if (!isFullscreen) return;

    setControlsVisible(true);

    function hideWhenIdle() {
      window.clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = window.setTimeout(() => {
        if (controlsRef.current?.contains(document.activeElement)) {
          hideWhenIdle();
          return;
        }

        setControlsVisible(false);
      }, 3000);
    }

    hideWhenIdle();
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      window.clearTimeout(controlsTimerRef.current);
      return undefined;
    }

    function handleActivity() {
      showControls();
    }

    window.addEventListener("pointermove", handleActivity);
    window.addEventListener("pointerdown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      window.removeEventListener("pointermove", handleActivity);
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.clearTimeout(controlsTimerRef.current);
    };
  }, [isFullscreen, showControls]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // Muted autoplay is allowed by browsers; audio is enabled after the user opens fullscreen.

    video.play().catch((error) => {
      console.warn("Não foi possível iniciar a reprodução:", error);
    });
  }, [isFullscreen, src]);

  function handleEnterFullscreen() {
    const video = videoRef.current;

    if (video) {
      video.play().catch((error) => {
        console.warn("Não foi possível iniciar o áudio:", error);
      });
    }

    onEnterFullscreen();
  }

  function handleVideoError() {
    setVideoError(
      "Não foi possível reproduzir este canal. Verifique o formato do stream ou a disponibilidade do servidor.",
    );
  }

  return (
    <div
      style={inlineStyles(isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-black"
          : "relative w-full overflow-hidden rounded-xl border border-white/10 bg-black")}
    >
      {isFullscreen && (
        <div
          ref={controlsRef}
          aria-hidden={!controlsVisible}
          style={inlineStyles(`absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent px-8 py-6 transition-opacity duration-200 ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`)}
        >
          <h2 style={inlineStyles("text-2xl font-bold text-white")}>{title}</h2>

          <button
            type="button"
            onClick={onExitFullscreen}
            tabIndex={controlsVisible ? 0 : -1}
            onFocus={showControls}
            onBlur={showControls}
            style={inlineStyles("rounded-lg bg-white/10 px-5 py-3 text-white focus:outline-none focus:ring-4 focus:ring-indigo-400")}
          >
            Voltar
          </button>
        </div>
      )}

      {videoError ? (
        <div
          style={{...inlineStyles("flex flex-col items-center justify-center p-8 text-center"), ...{ minHeight: "300px" }}}
          
        >
          <span style={inlineStyles("text-5xl text-red-400")}>!</span>

          <p style={inlineStyles("max-w-xl text-lg text-gray-300")}>{videoError}</p>

          <button
            type="button"
            onClick={() => {
              setVideoError("");
              videoRef.current?.load();
              videoRef.current?.play().catch(() => {});
            }}
            style={inlineStyles("rounded-lg bg-indigo-800 px-6 py-3 font-semibold text-white focus:outline-none focus:ring-4 focus:ring-indigo-400")}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {isFullscreen ? (
            <video
              ref={videoRef}
              src={src}
              autoPlay
              controls
              playsInline
              onError={handleVideoError}
              style={inlineStyles("h-full w-full flex-1 bg-black object-contain")}
            />
          ) : (
            <div style={{...inlineStyles("relative w-full h-full"), ...{ paddingTop: "56.25%", position: "relative" }}} >
              <video
                ref={videoRef}
                src={src}
                autoPlay
                controls={false}
                playsInline
                onError={handleVideoError}
                style={inlineStyles("absolute left-0 top-0 h-full w-full bg-black object-contain")}
              />

              <button
                type="button"
                onClick={handleEnterFullscreen}
                style={{...inlineStyles("h-full w-full items-end justify-end bg-black/10 focus:outline-none focus:ring-4 focus:ring-indigo-400"), ...{ position: "relative", background: "rgb(0 0 0 / 0.1)",}}}
                
                aria-label="Assistir em tela cheia"
              >
                <span style={{...inlineStyles("flex h-16 w-16 items-center justify-center rounded-full bg-gray-900/60 text-white shadow-xl"), ...{ bottom: "1rem", right: "1rem", position: "absolute" }}}
                >
                  <Icon name="maximize" size={24} x/>
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default VideoPlayer;
