/**
 * HTML Sanitizer & Utility for BlockEditor Rich Text
 * Allows only safe inline elements: strong, b, em, i, u, a
 * Restricts <a> attributes to safe href, target, rel
 * Blocks javascript:, data:, and vbscript: URLs
 */

export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";
  if (!html.includes("<")) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const allowedTags = new Set(["STRONG", "B", "EM", "I", "U", "A"]);

  function cleanNode(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        continue;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toUpperCase();

        if (allowedTags.has(tagName)) {
          if (tagName === "A") {
            const href = child.getAttribute("href") || "";
            const trimmedHref = href.trim().toLowerCase();

            // Block malicious javascript:, data:, vbscript: protocols
            if (
              trimmedHref.startsWith("javascript:") ||
              trimmedHref.startsWith("data:") ||
              trimmedHref.startsWith("vbscript:")
            ) {
              const textNode = doc.createTextNode(child.textContent || "");
              node.replaceChild(textNode, child);
              continue;
            }

            // Strip all attributes except href, target, rel
            const attrs = Array.from(child.attributes);
            for (const attr of attrs) {
              const name = attr.name.toLowerCase();
              if (name !== "href" && name !== "target" && name !== "rel") {
                child.removeAttribute(attr.name);
              }
            }

            child.setAttribute("target", "_blank");
            child.setAttribute("rel", "noopener noreferrer");
            child.classList.add("text-indigo-600", "underline");
          } else {
            // Remove attributes on formatting tags
            const attrs = Array.from(child.attributes);
            for (const attr of attrs) {
              child.removeAttribute(attr.name);
            }
          }

          cleanNode(child);
        } else {
          // Unwrap tag, preserve text and allowed children
          cleanNode(child);
          while (child.firstChild) {
            node.insertBefore(child.firstChild, child);
          }
          node.removeChild(child);
        }
      } else {
        node.removeChild(child);
      }
    }
  }

  cleanNode(doc.body);
  return doc.body.innerHTML;
}

export function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  if (!html.includes("<")) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}
