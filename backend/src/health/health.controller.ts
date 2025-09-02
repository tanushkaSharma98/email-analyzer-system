import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ImapService } from '../imap/imap.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly imapService: ImapService,
  ) {}

  @Get()
  async getHealth() {
    const dbReadyState = this.connection.readyState; // 1 = connected
    const dbConnected = dbReadyState === 1;
    const imap = this.imapService.getConnectionStatus();

    const overallOk = dbConnected && (imap.enabled === false || imap.connected === true);

    return {
      status: overallOk ? 'ok' : 'degraded',
      db: {
        connected: dbConnected,
        readyState: dbReadyState,
      },
      imap,
      timestamp: new Date().toISOString(),
    };
  }
}


