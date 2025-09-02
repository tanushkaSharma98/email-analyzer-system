import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import { EmailService } from '../email/email.service';

@Injectable()
export class ImapService implements OnModuleInit {
  private readonly logger = new Logger(ImapService.name);
  private imap: Imap;
  private isConnected = false;
  private checkInterval: NodeJS.Timeout;

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    // Check if IMAP monitoring is disabled
    const imapEnabled = this.configService.get('IMAP_ENABLED', 'true');
    if (imapEnabled === 'false') {
      this.logger.log('IMAP monitoring is disabled. Set IMAP_ENABLED=true to enable.');
      return;
    }

    try {
      await this.connect();
      this.startEmailMonitoring();
    } catch (error) {
      this.logger.warn('IMAP connection failed during initialization. Backend will continue without IMAP monitoring.');
      this.logger.warn('To enable IMAP monitoring, please configure valid IMAP credentials in your .env file.');
      this.logger.warn('Or set IMAP_ENABLED=false to disable IMAP monitoring completely.');
      // Start monitoring anyway, it will attempt to reconnect periodically
      this.startEmailMonitoring();
    }
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = this.configService.get('IMAP_USER');
      const password = this.configService.get('IMAP_PASS');
      const host = this.configService.get('IMAP_HOST');

      if (!user || !password || !host || user === 'your-email@gmail.com' || password === 'your-app-password') {
        reject(new Error('IMAP credentials not configured. Please set IMAP_USER, IMAP_PASS, and IMAP_HOST in your .env file.'));
        return;
      }

      this.imap = new Imap({
        user,
        password,
        host,
        port: this.configService.get('IMAP_PORT', 993),
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      });

      this.imap.once('ready', () => {
        this.logger.log('IMAP connection established');
        this.isConnected = true;
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        this.logger.error('IMAP connection error:', err);
        this.isConnected = false;
        reject(err);
      });

      this.imap.once('end', () => {
        this.logger.log('IMAP connection ended');
        this.isConnected = false;
      });

      this.imap.connect();
    });
  }

  private startEmailMonitoring(): void {
    // Configurable polling interval
    const intervalMs = Number(this.configService.get('IMAP_POLL_MS') || 300000);
    this.checkInterval = setInterval(async () => {
      if (this.isConnected) {
        await this.checkForNewEmails();
      } else {
        // Only attempt reconnection every 5 minutes to reduce log spam
        this.logger.warn('IMAP not connected, attempting to reconnect...');
        try {
          await this.connect();
        } catch (error) {
          this.logger.warn(`Failed to reconnect to IMAP. Will retry in ${Math.floor(intervalMs/1000)} seconds.`);
        }
      }
    }, intervalMs);

    this.logger.log(`Email monitoring started (interval: ${intervalMs} ms)`);
  }

  private async checkForNewEmails(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          this.logger.error('Error opening inbox:', err);
          reject(err);
          return;
        }

        // Search for unread emails; subject filter applied after header read
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            this.logger.error('Error searching emails:', err);
            reject(err);
            return;
          }

          if (results.length === 0) {
            resolve();
            return;
          }

          this.logger.log(`Found ${results.length} new unread emails`);

          // Fetch the emails
          const fetch = this.imap.fetch(results, { bodies: 'HEADER' });
          
          fetch.on('message', (msg, seqno) => {
            let buffer = '';
            
            msg.on('body', (stream) => {
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              
              stream.once('end', async () => {
                try {
                  const expectedSubject = this.configService.get('TEST_SUBJECT') || 'Test';
                  const subjectMatch = buffer.match(/\nsubject:\s*(.*)/i);
                  const subject = subjectMatch ? subjectMatch[1].trim() : '';
                  if (subject === expectedSubject) {
                    await this.processEmail(buffer);
                  } else {
                    this.logger.debug(`Skipping email with subject: ${subject}`);
                  }
                } catch (error) {
                  this.logger.error('Error processing email:', error);
                }
              });
            });

            msg.once('attributes', (attrs) => {
              // Mark email as read
              this.imap.addFlags(attrs.uid, ['\\Seen'], (err) => {
                if (err) {
                  this.logger.error('Error marking email as read:', err);
                }
              });
            });
          });

          fetch.once('error', (err) => {
            this.logger.error('Error fetching emails:', err);
            reject(err);
          });

          fetch.once('end', () => {
            resolve();
          });
        });
      });
    });
  }

  private async processEmail(rawHeaders: string): Promise<void> {
    try {
      this.logger.log('Processing new email...');
      
      // Parse the email headers
      const parsedEmail = await this.emailService.parseAndSaveEmail(rawHeaders);
      
      this.logger.log(`Email processed successfully: ${parsedEmail.subject}`);
    } catch (error) {
      this.logger.error('Error processing email:', error);
    }
  }

  // Public trigger to run an immediate scan (best-effort)
  async triggerScan(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      await this.checkForNewEmails();
    } catch (e) {
      this.logger.warn('Trigger scan failed; will rely on next scheduled poll.');
    }
  }

  async disconnect(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    if (this.imap && this.isConnected) {
      this.imap.end();
      this.isConnected = false;
    }
  }

  getConnectionStatus(): { connected: boolean; host: string; user: string; enabled: boolean } {
    return {
      connected: this.isConnected,
      host: this.configService.get('IMAP_HOST'),
      user: this.configService.get('IMAP_USER'),
      enabled: this.configService.get('IMAP_ENABLED', 'true') !== 'false',
    };
  }
}
