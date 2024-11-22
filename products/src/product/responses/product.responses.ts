import { ApiResponse } from "../../response";

export interface IProductInShop {
    productInStockId: number;
    shopId: number;
    shopName: string;
    productId: number;
    productArticule: string;
    productName: string;
    quantityInStock: number;
    quantityInOrders: number;
}

export interface IProduct {

    productId: number;
    PLU: string;
    productName: string;
    shopId: number

}

export interface INewProduct {

    productId: number;
    productPLU: string;
    productName: string;

}

interface IProductInStock {

    productInStockId: number;
    productId: number;
    productName: string;
    quantity: number

}

export interface IShopStock {
    shopId: number;
    shopName: string;
    stock: IProductInStock[]
}

export interface INewProduct {
    id: number;
    plu: string;
    name: string
}

export interface InewOrder {
    orderId: number;
}

export class ProductsListResponse extends ApiResponse<IProduct[]> {
    constructor(products: IProduct[]) {
        super(200, 'Успешно получена информация о всех товарах', products)
    }
}

export class ProductsInStockListResponse extends ApiResponse<IShopStock[]> {
    constructor(products: IShopStock[]) {
        super(200, 'Успешно получена информация об остатках', products)
    }
}

export class ProductCreateResponse extends ApiResponse<INewProduct[]> {
    constructor(products: INewProduct[]) {
        super(200, 'Успешно создан новый продукт', products)
    }
}

export class OrderCreateResponse extends ApiResponse<InewOrder> {
    constructor(products: InewOrder) {
        super(200, 'Успешно создан новый заказ', products)
    }
}


export class ProductsModuleError extends ApiResponse {
    constructor(statusCode: number, message: string, payload: any) {
        super(statusCode, message, payload)
    }
}