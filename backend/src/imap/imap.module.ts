import { Module, forwardRef } from '@nestjs/common';
import { ImapService } from './imap.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [forwardRef(() => EmailModule)],
  providers: [ImapService],
  exports: [ImapService],
})
export class ImapModule {}
