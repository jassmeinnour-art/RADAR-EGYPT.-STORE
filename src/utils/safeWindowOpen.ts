/**
 * Safely opens external links (e.g. WhatsApp, wholesale locations, export links)
 * inside iframe-sandboxed environments without throwing DOMException or being blocked.
 */
export function safeOpenUrl(url: string): void {
  try {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      // Fallback via synthetic click on hidden anchor tag
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // Safe fallback
    }
  }
}
