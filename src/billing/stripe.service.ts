import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SystemService } from '../system/system.service';

@Injectable()
export class StripeService {
    private defaultStripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor(
        private configService: ConfigService,
        private systemService: SystemService
    ) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey) {
            this.logger.warn('STRIPE_SECRET_KEY not found in configuration');
        }

        this.defaultStripe = new Stripe(secretKey || 'dummy_key', {
            apiVersion: '2026-01-28.clover' as any,
        });
    }

    async getStripeClient(): Promise<Stripe> {
        const config = await this.systemService.getConfig();
        const dbKey = config.stripeSecretKey;

        if (dbKey && dbKey.startsWith('sk_')) {
            return new Stripe(dbKey, {
                apiVersion: '2026-01-28.clover' as any,
            });
        }

        return this.defaultStripe;
    }

    async createPaymentIntent(amount: number, currency: string = 'usd') {
        try {
            const stripe = await this.getStripeClient();

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects cents
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id,
            };
        } catch (error) {
            this.logger.error(`Stripe Error: ${error.message}`);
            throw new InternalServerErrorException('Payment processing failed');
        }
    }
}
