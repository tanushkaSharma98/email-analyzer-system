import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  rawHeaders: string;

  @Prop({ type: [String], required: true })
  receivingChain: string[];

  @Prop({ required: true })
  esp: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  messageId: string;

  @Prop({ type: Object })
  additionalHeaders: Record<string, any>;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
