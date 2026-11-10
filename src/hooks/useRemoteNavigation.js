import { useEffect } from "react";

function useRemoteNavigation(onBack) {
  useEffect(() => {
    function handleKeyDown(event) {
      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName;

      const isTyping =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        activeElement?.isContentEditable;

      const isBack =
        event.key === "Escape" ||
        event.key === "Back" ||
        event.key === "BrowserBack" ||
        event.keyCode === 461;

      if (isBack) {
        if (!isTyping) {
          event.preventDefault();
          onBack();
        }

        return;
      }

      const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };

      const direction = directions[event.key];

      if (!direction) return;

      const focusableElements = Array.from(
        document.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => {
        return (
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true"
        );
      });

      if (!focusableElements.length) return;

      const currentRect = activeElement.getBoundingClientRect();

      const currentX = currentRect.left + currentRect.width / 2;
      const currentY = currentRect.top + currentRect.height / 2;

      let bestElement = null;
      let bestScore = Infinity;

      focusableElements.forEach((element) => {
        if (element === activeElement) return;

        const rect = element.getBoundingClientRect();

        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        const dx = targetX - currentX;
        const dy = targetY - currentY;

        const primaryDistance = dx * direction.x + dy * direction.y;

        if (primaryDistance <= 0) return;

        const secondaryDistance = Math.abs(dx * direction.y - dy * direction.x);

        const score = primaryDistance + secondaryDistance * 2;

        if (score < bestScore) {
          bestScore = score;
          bestElement = element;
        }
      });

      if (bestElement) {
        event.preventDefault();

        bestElement.focus();

        if (typeof bestElement.scrollIntoView === "function") {
          bestElement.scrollIntoView({
            block: "nearest",
            inline: "nearest",
          });
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onBack]);
}

export default useRemoteNavigation;
