/**
 * Utility functions for generating random test data
 */

/**
 * Generates a random email address
 * @param domain - Optional domain name (default: example.com)
 * @returns Random email address
 */
export function generateRandomEmail(domain: string = "example.com"): string {
  const username = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString().slice(-6);
  return `${username}${timestamp}@${domain}`;
}

/**
 * Generates a random password with specified length and complexity
 * @param length - Length of password (default: 12)
 * @param includeSpecialChars - Include special characters (default: true)
 * @returns Random password
 */
export function generateRandomPassword(
  length: number = 12,
  includeSpecialChars: boolean = true
): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  
  let charset = lowercase + uppercase + numbers;
  if (includeSpecialChars) {
    charset += specialChars;
  }
  
  let password = "";
  
  // Ensure at least one character from each required set
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  if (includeSpecialChars) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }
  
  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password to randomize character positions
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Generates a simple password for testing
 * @returns Simple test password
 */
export function generateSimplePassword(): string {
  return "TestPass123!";
}

/**
 * Generates an invalid email for negative testing
 * @returns Invalid email format
 */
export function generateInvalidEmail(): string {
  const invalidFormats = [
    "invalid-email",
    "@domain.com",
    "user@",
    "user.domain",
    "user@@domain.com",
    "user@domain",
    "",
  ];
  
  return invalidFormats[Math.floor(Math.random() * invalidFormats.length)] || "";
}

/**
 * Generates a weak password for negative testing
 * @returns Weak password
 */
export function generateWeakPassword(): string {
  const weakPasswords = [
    "123",
    "password",
    "abc",
    "12345",
    "pass",
    "",
  ];
  
  return weakPasswords[Math.floor(Math.random() * weakPasswords.length)] || "";
}

/**
 * Generates a random valid URL for testing
 * @returns Valid URL
 */
export function generateValidUrl(): string {
  const domains = [
    "example.com",
    "test.org",
    "sample.net",
    "demo.io",
    "mock.dev",
    "google.com",
    "github.com",
    "stackoverflow.com"
  ];
  
  const protocols = ["http://", "https://"];
  const subdomains = ["", "www.", "api.", "app.", "dev."];
  
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  return `${protocol}${subdomain}${domain}`;
}

/**
 * Generates an invalid URL for negative testing
 * @returns Invalid URL
 */
export function generateInvalidUrl(): string {
  const invalidUrls = [
    "not-a-url",
    "http://",
    "https://",
    "ftp://example.com",
    "javascript:alert('xss')",
    "mailto:test@example.com",
    "file:///etc/passwd",
    "example.com", // Missing protocol
    "http://.com",
    "https://",
    "http:///example.com",
    "",
    "   ",
    "null",
    "undefined"
  ];
  
  return invalidUrls[Math.floor(Math.random() * invalidUrls.length)] || "";
}

/**
 * Generates a very long URL for testing edge cases
 * @returns Long URL
 */
export function generateLongUrl(): string {
  const baseUrl = "https://example.com/";
  const longPath = "path/".repeat(100); // Very long path
  const queryParams = "?param=" + "value".repeat(50);
  
  return baseUrl + longPath + queryParams;
}

/**
 * Generates common website URLs for realistic testing
 * @returns Array of common website URLs
 */
export function getCommonWebsiteUrls(): string[] {
  return [
    "https://www.google.com",
    "https://github.com",
    "https://stackoverflow.com",
    "https://www.youtube.com",
    "https://www.facebook.com",
    "https://www.twitter.com",
    "https://www.linkedin.com",
    "https://www.amazon.com",
    "https://www.netflix.com",
    "https://www.spotify.com"
  ];
}
