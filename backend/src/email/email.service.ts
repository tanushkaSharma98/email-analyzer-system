import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../database/schemas/email.schema';
import { HeaderParser, ParsedEmailHeaders } from '../utils/header-parser';
import { ESPDetector } from '../utils/esp-detector';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {}

  async parseAndSaveEmail(rawHeaders: string): Promise<EmailDocument> {
    try {
      // Parse headers
      const parsedHeaders = HeaderParser.parseHeaders(rawHeaders);
      
      // Detect ESP
      const espResult = ESPDetector.detectESP(
        parsedHeaders.additionalHeaders,
        parsedHeaders.receivingChain
      );

      // Create email document
      const emailData = {
        subject: parsedHeaders.subject,
        from: parsedHeaders.from,
        to: parsedHeaders.to,
        rawHeaders,
        receivingChain: parsedHeaders.receivingChain,
        esp: espResult.esp,
        timestamp: parsedHeaders.date,
        messageId: parsedHeaders.messageId,
        additionalHeaders: parsedHeaders.additionalHeaders,
      };

      // Save to database
      const email = new this.emailModel(emailData);
      const savedEmail = await email.save();

      this.logger.log(`Email saved: ${savedEmail.subject} from ${savedEmail.esp}`);
      
      return savedEmail;
    } catch (error) {
      this.logger.error('Error parsing and saving email:', error);
      throw error;
    }
  }

  async getLatestEmail(): Promise<EmailDocument | null> {
    try {
      return await this.emailModel
        .findOne()
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      this.logger.error('Error fetching latest email:', error);
      throw error;
    }
  }

  async getAllEmails(limit: number = 50): Promise<EmailDocument[]> {
    try {
      return await this.emailModel
        .find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error('Error fetching all emails:', error);
      throw error;
    }
  }

  async getEmailById(id: string): Promise<EmailDocument | null> {
    try {
      return await this.emailModel.findById(id).exec();
    } catch (error) {
      this.logger.error('Error fetching email by ID:', error);
      throw error;
    }
  }

  async getEmailsByESP(esp: string): Promise<EmailDocument[]> {
    try {
      return await this.emailModel
        .find({ esp })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      this.logger.error('Error fetching emails by ESP:', error);
      throw error;
    }
  }

  async getEmailStats(): Promise<{
    totalEmails: number;
    espBreakdown: Record<string, number>;
    recentEmails: number;
  }> {
    try {
      const totalEmails = await this.emailModel.countDocuments();
      
      const espBreakdown = await this.emailModel.aggregate([
        { $group: { _id: '$esp', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const recentEmails = await this.emailModel.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      const espBreakdownObj = espBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return {
        totalEmails,
        espBreakdown: espBreakdownObj,
        recentEmails,
      };
    } catch (error) {
      this.logger.error('Error fetching email stats:', error);
      throw error;
    }
  }

  async deleteEmail(id: string): Promise<boolean> {
    try {
      const result = await this.emailModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      this.logger.error('Error deleting email:', error);
      throw error;
    }
  }
}
