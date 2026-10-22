import sanitizeHtml from "sanitize-html";

/**
 * Allow-list for notice bodies and leadership messages (spec §6): h2–h4, paragraphs, line breaks, lists, bold/italic,
 * links (http, https, mailto — always rel="noopener noreferrer") and blockquotes. Everything else is removed;
 * disallowed wrappers such as h1 keep their text.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "a", "blockquote"],
    allowedAttributes: { a: ["href", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed"],
    selfClosing: ["br"],
    transformTags: {
      a: (tagName, attribs) => {
        // checked here because transformTags runs before sanitize-html's own scheme filter
        const href = attribs.href?.trim() ?? "";
        const safe: Record<string, string> = /^(https?:|mailto:)/i.test(href) ? { href, rel: "noopener noreferrer" } : {};
        return { tagName, attribs: safe };
      },
    },
  }).trim();
}
