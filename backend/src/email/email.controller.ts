import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { HeaderParser } from '../utils/header-parser';
import { ESPDetector } from '../utils/esp-detector';
import { ConfigService } from '@nestjs/config';
import { ImapService } from '../imap/imap.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService, private readonly config: ConfigService, private readonly imap: ImapService) {}

  @Get('latest')
  async getLatestEmail() {
    const email = await this.emailService.getLatestEmail();
    
    if (!email) {
      return {
        message: 'No emails found',
        data: null
      };
    }

    return {
      message: 'Latest email retrieved successfully',
      data: {
        id: email._id,
        subject: email.subject,
        from: email.from,
        to: email.to,
        esp: email.esp,
        espInfo: ESPDetector.getESPInfo(email.esp),
        receivingChain: HeaderParser.formatReceivingChain(email.receivingChain),
        timestamp: email.timestamp,
        messageId: email.messageId,
      }
    };
  }

  @Get('all')
  async getAllEmails(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const emails = await this.emailService.getAllEmails(limitNum);
    
    const formattedEmails = emails.map(email => ({
      id: email._id,
      subject: email.subject,
      from: email.from,
      to: email.to,
      esp: email.esp,
      espInfo: ESPDetector.getESPInfo(email.esp),
      receivingChain: HeaderParser.formatReceivingChain(email.receivingChain),
      timestamp: email.timestamp,
      messageId: email.messageId,
    }));

    return {
      message: 'Emails retrieved successfully',
      data: formattedEmails,
      count: formattedEmails.length
    };
  }

  @Get('stats')
  async getEmailStats() {
    const stats = await this.emailService.getEmailStats();
    
    return {
      message: 'Email statistics retrieved successfully',
      data: stats
    };
  }

  @Get('config')
  getConfig() {
    return {
      message: 'Config retrieved',
      data: {
        mailbox: this.config.get('IMAP_USER') || '',
        testSubject: this.config.get('TEST_SUBJECT') || 'Test',
        imapHost: this.config.get('IMAP_HOST') || '',
      }
    };
  }

  // Lightweight manual rescan trigger (non-blocking)
  @Get('rescan')
  async rescan() {
    try {
      await this.imap.triggerScan();
      return { message: 'Rescan triggered' };
    } catch (e) {
      return { message: 'Failed to schedule rescan' };
    }
  }

  @Get('esp/:esp')
  async getEmailsByESP(@Param('esp') esp: string) {
    const emails = await this.emailService.getEmailsByESP(esp);
    
    const formattedEmails = emails.map(email => ({
      id: email._id,
      subject: email.subject,
      from: email.from,
      to: email.to,
      esp: email.esp,
      espInfo: ESPDetector.getESPInfo(email.esp),
      receivingChain: HeaderParser.formatReceivingChain(email.receivingChain),
      timestamp: email.timestamp,
      messageId: email.messageId,
    }));

    return {
      message: `Emails from ${esp} retrieved successfully`,
      data: formattedEmails,
      count: formattedEmails.length
    };
  }

  @Get(':id')
  async getEmailById(@Param('id') id: string) {
    const email = await this.emailService.getEmailById(id);
    
    if (!email) {
      return {
        message: 'Email not found',
        data: null
      };
    }

    return {
      message: 'Email retrieved successfully',
      data: {
        id: email._id,
        subject: email.subject,
        from: email.from,
        to: email.to,
        esp: email.esp,
        espInfo: ESPDetector.getESPInfo(email.esp),
        receivingChain: HeaderParser.formatReceivingChain(email.receivingChain),
        timestamp: email.timestamp,
        messageId: email.messageId,
        rawHeaders: email.rawHeaders,
        additionalHeaders: email.additionalHeaders,
      }
    };
  }

  @Delete(':id')
  async deleteEmail(@Param('id') id: string) {
    const deleted = await this.emailService.deleteEmail(id);
    
    if (!deleted) {
      return {
        message: 'Email not found or could not be deleted',
        success: false
      };
    }

    return {
      message: 'Email deleted successfully',
      success: true
    };
  }
}
