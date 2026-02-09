
import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsString()
    productId: string;

    @IsString()
    productName: string;

    @IsNumber()
    price: number;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    downloadUrl?: string;
}

export class ShippingAddressDto {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    country: string;

    @IsString()
    zip: string;
}

export class CreateOrderDto {
    @IsString()
    paymentMethod: string;

    @IsNumber()
    total: number;

    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress: ShippingAddressDto;
}
