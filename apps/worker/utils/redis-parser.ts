interface Website {
  messageId: string;  // Redis message ID for acknowledgment
  websiteId: string;  // Your custom website ID
  url: string;
}

/**
 * Parses Redis stream messages to extract website data
 * @param messages - Array of Redis stream messages in format [messageId, fields[]]
 * @returns Array of website objects with messageId, websiteId, and url
 * @throws Error if required fields are missing
 */
export function parseWebsiteMessages(
  messages: Array<[string, string[]]>
): Website[] {
  return messages.map(([messageId, fields]) => {
    const idIndex = fields.indexOf("id");
    const urlIndex = fields.indexOf("url");

    if (idIndex === -1 || urlIndex === -1) {
      throw new Error(
        "Missing required fields 'id' or 'url' in Redis stream message"
      );
    }

    const websiteId = fields[idIndex + 1];
    const url = fields[urlIndex + 1];

    if (!websiteId || !url) {
      throw new Error("Empty values for 'id' or 'url' in Redis stream message");
    }

    return {
      messageId,     // Redis-generated message ID (for xAck)
      websiteId,     // Your custom website ID
      url,
    };
  });
}
