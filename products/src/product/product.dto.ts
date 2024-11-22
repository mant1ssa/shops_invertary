import { Transform } from "class-transformer";
import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Matches, MaxLength, Min, MinLength } from "class-validator";


export class ProductGetDTO {

    @IsString()
    @IsOptional()
    @Length(11, 11)     // По легенде длина артикулов строго равна 11
    PLU?: string

    @IsString()         // Не совсем устраивает, что проверять валидность по факту числового поля (PK) приходится строку и регуляркой
    @IsOptional()
    @Matches(/^\d+$/, { message: 'shopId must be a valid number' })
    shopId?: number;

    @IsString()
    @IsOptional()
    @MinLength(1)
    name?: string;

}

export class ProductsGetDTO extends ProductGetDTO {

    @IsArray()
    @IsOptional()
    @IsInt({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value.split(',').map((v) => parseInt(v.trim(), 10));
            }
        }
        return value;
    })
    quantityInStock?: number[];

    @IsArray()
    @IsOptional()
    @IsInt({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value.split(',').map((v) => parseInt(v.trim(), 10));
            }
        }
        return value;
    })
    quantityInOrders?: number[];

}

export class ProductPostDTO {

    @IsString()
    @Length(11)
    PLU!: string;

    @IsString()
    @MaxLength(250)
    name!: string;

    @IsInt()
    @Min(1)
    shopId!: number;
}

export class ProductsToStockPostDTO {

    @IsInt()
    @Min(1)
    shopId!: number;

    @IsInt()
    @Min(1)
    productId!: number;

    @IsInt()
    @Min(1)
    quantity!: number

}

export class OrderPostDTO {

    @IsInt()
    @Min(1)
    userId!: number;

    @IsInt()
    @Min(1)
    productId!: number;

    @IsInt()
    @Min(1)
    quantity!: number

}