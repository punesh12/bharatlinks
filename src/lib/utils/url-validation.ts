/**
 * Validates a URL string and returns an error message if invalid, or null if valid.
 *
 * @param url - The URL string to validate
 * @returns Error message string if invalid, null if valid
 */
export const validateUrl = (url: string): string | null => {
  if (!url || typeof url !== "string") {
    return "URL is required";
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    return "URL cannot be empty";
  }

  // Try to parse as-is first
  try {
    const urlObj = new URL(trimmedUrl);
    // Ensure it's http or https
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return "URL must use http:// or https:// protocol";
    }
    return null; // Valid URL
  } catch {
    // If parsing fails, try adding https://
    try {
      const urlWithProtocol = `https://${trimmedUrl}`;
      const urlObj = new URL(urlWithProtocol);
      // Validate it's a valid domain format
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return "Invalid URL format";
      }
      // Check for basic domain pattern (at least one dot or localhost)
      if (
        !urlObj.hostname.includes(".") &&
        urlObj.hostname !== "localhost" &&
        !urlObj.hostname.match(/^\[.*\]$/) // IPv6
      ) {
        return "Invalid domain format";
      }
      return null; // Valid URL (will be normalized)
    } catch {
      return "Invalid URL format. Please enter a valid URL (e.g., https://example.com or example.com)";
    }
  }
};
