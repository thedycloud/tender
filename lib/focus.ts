let capturedElement: HTMLElement | null = null;
let capturedId: string | null = null;

function isVisible(element: HTMLElement): boolean {
  if (typeof element.getClientRects === "function") {
    return element.getClientRects().length > 0;
  }
  return element.offsetParent !== null;
}

export function captureTenderFocus(id: string): void {
  capturedId = id;
  capturedElement = document.activeElement instanceof HTMLElement &&
    document.activeElement.dataset.tenderId === id &&
    isVisible(document.activeElement)
      ? document.activeElement
      : null;

  if (capturedElement) {
    return;
  }

  const matches = Array.from(
    document.querySelectorAll<HTMLElement>("[data-tender-id]"),
  ).filter(
    (element) =>
      element.dataset.tenderId === id && isVisible(element),
  );

  capturedElement = matches[0] ?? null;
}

export function restoreTenderFocus(id?: string): void {
  const targetId = id ?? capturedId;

  window.requestAnimationFrame(() => {
    if (
      targetId &&
      capturedElement?.isConnected &&
      capturedElement.dataset.tenderId === targetId &&
      isVisible(capturedElement)
    ) {
      capturedElement.focus();
      return;
    }

    if (targetId) {
      const matches = Array.from(
        document.querySelectorAll<HTMLElement>("[data-tender-id]"),
      ).filter(
        (element) =>
          element.dataset.tenderId === targetId && isVisible(element),
      );
      if (matches[0]) {
        matches[0].focus();
        return;
      }
    }

    const heading =
      document.getElementById("dashboard-page-title") ??
      document.querySelector<HTMLElement>("main h1");
    heading?.focus();

    capturedElement = null;
    capturedId = null;
  });
}
