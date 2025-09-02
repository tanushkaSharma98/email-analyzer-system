export interface ParsedEmailHeaders {
  subject: string;
  from: string;
  to: string;
  messageId: string;
  date: Date;
  receivingChain: string[];
  additionalHeaders: Record<string, string>;
}

export class HeaderParser {
  static parseHeaders(rawHeaders: string): ParsedEmailHeaders {
    // Unfold headers per RFC 5322: a header line that begins with space or tab
    // is a continuation of the previous header
    const rawLines = rawHeaders.replace(/\r\n/g, '\n').split('\n');
    const unfolded: string[] = [];
    for (const line of rawLines) {
      if (!line) continue;
      if (/^[\t\s]/.test(line) && unfolded.length > 0) {
        unfolded[unfolded.length - 1] += ' ' + line.trim();
      } else {
        unfolded.push(line.trimEnd());
      }
    }

    const headers: Record<string, string> = {};
    const receivedHeaders: string[] = [];

    for (const line of unfolded) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.substring(0, idx).trim().toLowerCase();
      const value = line.substring(idx + 1).trim();

      if (key === 'received') {
        receivedHeaders.push(value);
      }

      if (headers[key]) {
        headers[key] += ' ' + value;
      } else {
        headers[key] = value;
      }
    }

    // Build chain: earliest hop is the last Received header
    const receivingChain: string[] = [];
    for (const rec of [...receivedHeaders].reverse()) {
      const server = this.extractServerFromReceived(rec);
      if (server) receivingChain.push(server);
    }

    return {
      subject: headers['subject'] || 'No Subject',
      from: headers['from'] || 'Unknown Sender',
      to: headers['to'] || 'Unknown Recipient',
      messageId: headers['message-id'] || '',
      date: this.parseDate(headers['date']),
      receivingChain,
      additionalHeaders: headers,
    };
  }

  private static extractServerFromReceived(receivedHeader: string): string | null {
    // Common patterns for extracting server names from Received headers
    const patterns = [
      /from\s+([^\s]+)/i,
      /by\s+([^\s]+)/i,
      /with\s+([^\s]+)/i,
      /\(([^)]+)\)/i
    ];

    for (const pattern of patterns) {
      const match = receivedHeader.match(pattern);
      if (match && match[1]) {
        const server = match[1].replace(/[<>]/g, '').trim();
        if (server && !server.includes(' ') && server.includes('.')) {
          return server;
        }
      }
    }

    return null;
  }

  private static parseDate(dateString: string): Date {
    if (!dateString) return new Date();
    
    try {
      return new Date(dateString);
    } catch (error) {
      return new Date();
    }
  }

  static formatReceivingChain(chain: string[]): Array<{ step: number; server: string; description: string }> {
    return chain.map((server, index) => ({
      step: index + 1,
      server,
      description: this.getServerDescription(server)
    }));
  }

  private static getServerDescription(server: string): string {
    const serverLower = server.toLowerCase();
    
    if (serverLower.includes('gmail') || serverLower.includes('google')) {
      return 'Gmail SMTP Server';
    } else if (serverLower.includes('outlook') || serverLower.includes('hotmail')) {
      return 'Microsoft Outlook Server';
    } else if (serverLower.includes('yahoo')) {
      return 'Yahoo Mail Server';
    } else if (serverLower.includes('amazonses')) {
      return 'Amazon SES Server';
    } else if (serverLower.includes('sendgrid')) {
      return 'SendGrid Server';
    } else if (serverLower.includes('mailgun')) {
      return 'Mailgun Server';
    } else if (serverLower.includes('zoho')) {
      return 'Zoho Mail Server';
    } else if (serverLower.includes('protonmail')) {
      return 'ProtonMail Server';
    } else if (serverLower.includes('icloud')) {
      return 'iCloud Mail Server';
    } else {
      return 'Mail Server';
    }
  }
}
