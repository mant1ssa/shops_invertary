import { IsInt, IsString } from "class-validator";

export class productsGetResponse {

    @IsInt()
    id!: number;

    @IsString()
    PLU!: string;

    @IsString()
    name!: string;

    @IsInt()
    productsInStockQuantity!: number;

    @IsInt()
    productsInOrderQuantity!: number;

}



//  P.S. Возможно здесь стоит дополнительно обернуть поля декораторами вроде Min/Max (для полей, отвечающих за коливо чего-то), Length (у артикулов товаров представим, что длина всегда равна 11).
//  Однако, в данном проекте эту часть оставим на валидации в DTO, считая, что сквозь них неправильные данные не пройдут.