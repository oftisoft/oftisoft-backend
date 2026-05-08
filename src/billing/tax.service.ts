import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRate } from '../entities/tax-rate.entity';

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  taxName: string;
}

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(TaxRate)
    private taxRateRepository: Repository<TaxRate>,
  ) {}

  /**
   * Calculate tax for an order
   */
  async calculateTax(
    subtotal: number,
    country: string,
    state?: string,
    zipCode?: string,
  ): Promise<TaxCalculation> {
    // Find applicable tax rate
    let taxRate = await this.findTaxRate(country, state, zipCode);

    // If no specific rate found, use default
    if (!taxRate) {
      taxRate = await this.getDefaultTaxRate();
    }

    const taxAmount = this.roundToCents(subtotal * (taxRate.rate / 100));
    const total = this.roundToCents(subtotal + taxAmount);

    return {
      subtotal: this.roundToCents(subtotal),
      taxAmount,
      total,
      taxRate: taxRate.rate,
      taxName: taxRate.name,
    };
  }

  /**
   * Calculate tax for multiple items
   */
  async calculateTaxForItems(
    items: { price: number; quantity: number; taxable: boolean }[],
    country: string,
    state?: string,
    zipCode?: string,
  ): Promise<TaxCalculation> {
    const subtotal = items.reduce((sum, item) => {
      if (item.taxable) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);

    return this.calculateTax(subtotal, country, state, zipCode);
  }

  /**
   * Find applicable tax rate
   */
  private async findTaxRate(
    country: string,
    state?: string,
    zipCode?: string,
  ): Promise<TaxRate | null> {
    // Priority: ZIP > State > Country > Default

    // Try ZIP code specific
    if (zipCode) {
      const zipRate = await this.taxRateRepository.findOne({
        where: { zipCode, isActive: true },
      });
      if (zipRate) return zipRate;
    }

    // Try state specific
    if (state) {
      const stateRate = await this.taxRateRepository.findOne({
        where: { state, country, isActive: true },
      });
      if (stateRate) return stateRate;
    }

    // Try country specific
    const countryRate = await this.taxRateRepository.findOne({
      where: {
        country,
        state: null as any,
        zipCode: null as any,
        isActive: true,
      },
    });
    if (countryRate) return countryRate;

    return null;
  }

  /**
   * Get default tax rate (no tax)
   */
  private async getDefaultTaxRate(): Promise<TaxRate> {
    return {
      id: 'default',
      name: 'No Tax',
      rate: 0,
      country: '*',
      state: null,
      zipCode: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TaxRate;
  }

  /**
   * Round to 2 decimal places
   */
  private roundToCents(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Get all active tax rates
   */
  async getTaxRates(): Promise<TaxRate[]> {
    return this.taxRateRepository.find({
      where: { isActive: true },
      order: { country: 'ASC', state: 'ASC' },
    });
  }

  /**
   * Create a new tax rate
   */
  async createTaxRate(data: Partial<TaxRate>): Promise<TaxRate> {
    const taxRate = this.taxRateRepository.create(data);
    return this.taxRateRepository.save(taxRate);
  }

  /**
   * Update a tax rate
   */
  async updateTaxRate(
    id: string,
    data: Partial<TaxRate>,
  ): Promise<TaxRate | null> {
    await this.taxRateRepository.update(id, data);
    return this.taxRateRepository.findOne({ where: { id } });
  }

  /**
   * Delete a tax rate
   */
  async deleteTaxRate(id: string): Promise<void> {
    await this.taxRateRepository.delete(id);
  }
}
