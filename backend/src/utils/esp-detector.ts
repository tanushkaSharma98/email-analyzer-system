export interface ESPDetectionResult {
  esp: string;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
}

export class ESPDetector {
  private static readonly ESP_PATTERNS = {
    'Gmail': {
      domains: ['gmail.com', 'googlemail.com', 'google.com'],
      headers: ['X-Google-DKIM-Signature', 'X-Gm-Message-State'],
      mailers: ['Gmail'],
      servers: ['mail-', 'google.com', 'gmail-smtp-in.l.google.com'],
      confidence: 'high' as const
    },
    'Outlook': {
      domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
      headers: ['X-Microsoft-Exchange-Organization'],
      mailers: ['Microsoft Outlook', 'Outlook'],
      servers: ['outlook.office365.com', 'hotmail.com'],
      confidence: 'high' as const
    },
    'Yahoo': {
      domains: ['yahoo.com', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com'],
      headers: ['X-Yahoo-Newman-Property'],
      mailers: ['YahooMail'],
      servers: ['mta.am0.yahoodns.net', 'yahoo.com'],
      confidence: 'high' as const
    },
    'Amazon SES': {
      domains: [],
      headers: ['X-SES-Outgoing'],
      mailers: [],
      servers: ['amazonses.com', 'email-smtp'],
      confidence: 'high' as const
    },
    'SendGrid': {
      domains: [],
      headers: ['X-SG-EID', 'X-SendGrid-Content'],
      mailers: ['SendGrid'],
      servers: ['sendgrid.net'],
      confidence: 'high' as const
    },
    'Mailgun': {
      domains: [],
      headers: ['X-Mailgun-Sid'],
      mailers: ['Mailgun'],
      servers: ['mailgun.org'],
      confidence: 'high' as const
    },
    'Zoho': {
      domains: ['zoho.com', 'zohomail.com'],
      headers: ['X-Zoho-Virus-Status'],
      mailers: ['Zoho Mail'],
      servers: ['zoho.com'],
      confidence: 'high' as const
    },
    'ProtonMail': {
      domains: ['protonmail.com', 'proton.me'],
      headers: ['X-Pm-Origin'],
      mailers: ['ProtonMail'],
      servers: ['protonmail.com'],
      confidence: 'high' as const
    },
    'iCloud': {
      domains: ['icloud.com', 'me.com', 'mac.com'],
      headers: ['X-Apple-Mail'],
      mailers: ['Apple Mail'],
      servers: ['icloud.com'],
      confidence: 'high' as const
    }
  };

  static detectESP(headers: Record<string, string>, receivingChain: string[]): ESPDetectionResult {
    const indicators: string[] = [];
    let bestMatch: ESPDetectionResult = {
      esp: 'Unknown',
      confidence: 'low',
      indicators: []
    };

    // Normalize keys to lowercase for lookups
    const lowerHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      lowerHeaders[k.toLowerCase()] = v;
    }

    // Extract DKIM signing domain (d=)
    const dkimHeader = lowerHeaders['dkim-signature'] || lowerHeaders['x-google-dkim-signature'] || '';
    const dkimMatch = dkimHeader.match(/\bd=([^;\s]+)/i);
    const dkimDomain = dkimMatch ? dkimMatch[1].toLowerCase() : '';

    // Extract Return-Path domain
    const returnPath = lowerHeaders['return-path'] || '';
    const returnPathDomainMatch = returnPath.match(/@([^>\s]+)/);
    const returnPathDomain = returnPathDomainMatch ? returnPathDomainMatch[1].toLowerCase() : '';

    // Consider earliest hop (first in chain is earliest per parser)
    const earliestHop = receivingChain.length > 0 ? receivingChain[0].toLowerCase() : '';

    // Check each ESP pattern
    for (const [espName, pattern] of Object.entries(this.ESP_PATTERNS)) {
      const espIndicators: string[] = [];
      let matchScore = 0;

      // Check domain patterns
      const fromHeader = lowerHeaders['from'] || '';
      const combinedEmail = `${fromHeader} ${returnPath}`.toLowerCase();

      for (const domain of pattern.domains) {
        if (combinedEmail.includes(domain)) {
          espIndicators.push(`Domain: ${domain}`);
          matchScore += 3;
        }
      }

      // Check header patterns
      for (const header of pattern.headers) {
        if (lowerHeaders[header.toLowerCase()]) {
          espIndicators.push(`Header: ${header}`);
          matchScore += 2;
        }
      }

      // Check mailer patterns
      const userAgent = lowerHeaders['user-agent'] || '';
      const xMailer = lowerHeaders['x-mailer'] || '';
      const combinedMailer = `${userAgent} ${xMailer}`.toLowerCase();

      for (const mailer of pattern.mailers) {
        if (combinedMailer.includes(mailer.toLowerCase())) {
          espIndicators.push(`Mailer: ${mailer}`);
          matchScore += 2;
        }
      }

      // Check server patterns in receiving chain
      for (const server of pattern.servers) {
        for (const chainItem of receivingChain) {
          if (chainItem.toLowerCase().includes(server.toLowerCase())) {
            espIndicators.push(`Server: ${server}`);
            matchScore += 2;
          }
        }
      }

      // DKIM signer domain strong signal
      if (dkimDomain && pattern.domains.some(d => dkimDomain.endsWith(d))) {
        espIndicators.push(`DKIM d=${dkimDomain}`);
        matchScore += 4; // strong
      }

      // Return-Path domain medium signal
      if (returnPathDomain && pattern.domains.some(d => returnPathDomain.endsWith(d))) {
        espIndicators.push(`Return-Path domain: ${returnPathDomain}`);
        matchScore += 3;
      }

      // Earliest hop preference
      if (earliestHop && pattern.servers.some(s => earliestHop.includes(s.toLowerCase()))) {
        espIndicators.push(`Earliest hop: ${earliestHop}`);
        matchScore += 3;
      }

      // Update best match if this ESP has higher score
      if (matchScore > 0 && matchScore > (bestMatch.indicators.length * 2)) {
        bestMatch = {
          esp: espName,
          confidence: pattern.confidence,
          indicators: espIndicators
        };
      }
    }

    // If no specific ESP found, try to infer from domain
    if (bestMatch.esp === 'Unknown') {
      const fromDomain = this.extractDomain(lowerHeaders['from'] || '') || returnPathDomain || dkimDomain;
      if (fromDomain) {
        bestMatch = {
          esp: `Custom (${fromDomain})`,
          confidence: 'low',
          indicators: [`Domain: ${fromDomain}`]
        };
      }
    }

    return bestMatch;
  }

  private static extractDomain(email: string): string | null {
    const match = email.match(/@([^>\s]+)/);
    return match ? match[1] : null;
  }

  static getESPInfo(esp: string): { name: string; logo: string; color: string } {
    const espInfo: Record<string, { name: string; logo: string; color: string }> = {
      'Gmail': { name: 'Gmail', logo: '📧', color: '#EA4335' },
      'Outlook': { name: 'Outlook', logo: '📮', color: '#0078D4' },
      'Yahoo': { name: 'Yahoo Mail', logo: '📬', color: '#6001D2' },
      'Amazon SES': { name: 'Amazon SES', logo: '☁️', color: '#FF9900' },
      'SendGrid': { name: 'SendGrid', logo: '📤', color: '#1A82E2' },
      'Mailgun': { name: 'Mailgun', logo: '🔫', color: '#007EE5' },
      'Zoho': { name: 'Zoho Mail', logo: '📧', color: '#C8202B' },
      'ProtonMail': { name: 'ProtonMail', logo: '🔒', color: '#8B89CC' },
      'iCloud': { name: 'iCloud Mail', logo: '☁️', color: '#007AFF' }
    };

    return espInfo[esp] || { name: esp, logo: '📧', color: '#6B7280' };
  }
}
