/**
 * Build a URL with UTM parameters
 * @param baseUrl - The base URL to append UTM parameters to
 * @param utmParams - Object containing UTM parameters
 * @returns URL with UTM parameters appended
 */
export const buildUrlWithUtm = (
  baseUrl: string,
  utmParams: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    referral?: string;
  }
): string => {
  if (!baseUrl || !baseUrl.trim()) return baseUrl;

  const params: string[] = [];
  if (utmParams.source) {
    params.push(`utm_source=${encodeURIComponent(utmParams.source).replace(/%20/g, "+")}`);
  }
  if (utmParams.medium) {
    params.push(`utm_medium=${encodeURIComponent(utmParams.medium).replace(/%20/g, "+")}`);
  }
  if (utmParams.campaign) {
    params.push(`utm_campaign=${encodeURIComponent(utmParams.campaign).replace(/%20/g, "+")}`);
  }
  if (utmParams.term) {
    params.push(`utm_term=${encodeURIComponent(utmParams.term).replace(/%20/g, "+")}`);
  }
  if (utmParams.content) {
    params.push(`utm_content=${encodeURIComponent(utmParams.content).replace(/%20/g, "+")}`);
  }
  if (utmParams.referral) {
    params.push(`ref=${encodeURIComponent(utmParams.referral).replace(/%20/g, "+")}`);
  }

  if (params.length === 0) return baseUrl;

  // Remove existing query string if present
  const urlWithoutParams = baseUrl.split("?")[0];
  return `${urlWithoutParams}?${params.join("&")}`;
};

/**
 * Normalize a URL by ensuring it has a protocol
 * @param url - The URL to normalize
 * @returns Normalized URL with protocol
 */
export const normalizeUrl = (url: string): string => {
  if (!url || typeof url !== "string") {
    throw new Error("URL is required");
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    throw new Error("URL cannot be empty");
  }

  // Try to parse as-is first
  try {
    const urlObj = new URL(trimmedUrl);
    // Ensure it's http or https
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      throw new Error("URL must use http:// or https:// protocol");
    }
    return urlObj.toString();
  } catch {
    // If parsing fails, try adding https://
    try {
      const urlWithProtocol = `https://${trimmedUrl}`;
      const urlObj = new URL(urlWithProtocol);
      // Validate it's a valid domain format
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        throw new Error("Invalid URL format");
      }
      // Check for basic domain pattern (at least one dot or localhost)
      if (
        !urlObj.hostname.includes(".") &&
        urlObj.hostname !== "localhost" &&
        !urlObj.hostname.match(/^\[.*\]$/) // IPv6
      ) {
        throw new Error("Invalid domain format");
      }
      return urlObj.toString();
    } catch {
      throw new Error("Invalid URL format. Please enter a valid URL (e.g., https://example.com or example.com)");
    }
  }
};
