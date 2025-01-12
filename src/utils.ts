const REGEX_STRIP_TAGS: RegExp = /<[^>]*>/g;

export function _normalizeUrl(url: string): string {
  /**
   * Decode URL-encoded string and replace spaces with '+'
   * @param url - The URL string to be normalized
   * @returns The decoded URL with spaces replaced by '+'
   */
  if (!url) return '';
  
  // Decode URL-encoded string using built-in decodeURIComponent
  const decodedUrl = decodeURIComponent(url);
  
  // Replace spaces with '+'
  return decodedUrl.replace(/ /g, '+');
}


export function _normalize(jsdomDocument: Document, rawHtml: string): string {
    /**
     * Strip HTML tags from the rawHtml string and decode HTML entities
     * @param jsdomDocument - The JSDOM Document object used for HTML entity decoding
     * @param rawHtml - The HTML string to be normalized
     * @returns The cleaned and decoded string
     */
    if (!rawHtml) return '';
    
    // First remove HTML tags
    const strippedHtml = rawHtml.replace(REGEX_STRIP_TAGS, '');
    
    // Then decode HTML entities using the browser's built-in decoder
    const textarea = jsdomDocument.createElement('textarea');
    textarea.innerHTML = strippedHtml;
    return textarea.value;
}

// export async function extractVqd(content: string, keywords: string): Promise<string> {

// } 