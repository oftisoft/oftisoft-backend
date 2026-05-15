import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from '../entities/device-token.entity';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private adminModule: any = null;
  private initialized = false;

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepo: Repository<DeviceToken>,
  ) {
    this.initialize();
  }

  private initialize() {
    try {
      this.adminModule = require('firebase-admin');
    } catch {
      this.logger.warn(
        'firebase-admin package not installed. Push notifications disabled.',
      );
      return;
    }
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT_PATH not set. Push notifications disabled.',
      );
      return;
    }
    try {
      const serviceAccount = require(serviceAccountPath);
      this.adminModule.initializeApp({
        credential: this.adminModule.credential.cert(serviceAccount),
      });
      this.initialized = true;
      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.warn(
        `Failed to initialize Firebase Admin: ${(error as Error).message}`,
      );
    }
  }

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!this.initialized) return;
    const deviceTokens = await this.deviceTokenRepo.find({
      where: { user: { id: userId } },
    });
    if (!deviceTokens.length) return;
    const tokens = deviceTokens.map((dt) => dt.token);
    const message: any = {
      notification: { title, body },
      tokens,
    };
    if (data) {
      message.data = data;
    }
    try {
      const response = await this.adminModule
        .messaging()
        .sendEachForMulticast(message);
      if (response.failureCount > 0) {
        response.responses.forEach(
          (resp: { success: boolean; error?: { code: string } }, idx: number) => {
            if (!resp.success) {
              this.deviceTokenRepo.delete({ token: tokens[idx] }).catch(() => {});
            }
          },
        );
        this.logger.warn(
          `FCM: ${response.successCount} sent, ${response.failureCount} failed (stale tokens cleaned)`,
        );
      }
    } catch (error) {
      this.logger.error(
        `FCM sendToUser failed: ${(error as Error).message}`,
      );
    }
  }

  async sendToTopic(topic: string, title: string, body: string) {
    if (!this.initialized) return;
    try {
      await this.adminModule.messaging().send({
        topic,
        notification: { title, body },
      });
    } catch (error) {
      this.logger.error(
        `FCM sendToTopic failed: ${(error as Error).message}`,
      );
    }
  }

  async subscribeToTopic(tokens: string[], topic: string) {
    if (!this.initialized) return;
    try {
      await this.adminModule.messaging().subscribeToTopic(tokens, topic);
    } catch (error) {
      this.logger.error(
        `FCM subscribeToTopic failed: ${(error as Error).message}`,
      );
    }
  }

  async registerDevice(userId: string, token: string, platform?: string) {
    const existing = await this.deviceTokenRepo.findOne({
      where: { token, user: { id: userId } },
    });
    if (existing) return existing;
    const deviceToken = this.deviceTokenRepo.create({
      token,
      platform: platform || undefined,
      user: { id: userId } as any,
    });
    return this.deviceTokenRepo.save(deviceToken);
  }

  async unregisterDevice(userId: string, token: string) {
    const existing = await this.deviceTokenRepo.findOne({
      where: { token, user: { id: userId } },
    });
    if (existing) {
      await this.deviceTokenRepo.remove(existing);
    }
    return { success: true };
  }
}
