import { plainToClass } from "class-transformer";
import { OrderPostDTO, ProductGetDTO, ProductPostDTO, ProductsGetDTO, ProductsToStockPostDTO } from "./product.dto";
import { validate } from "class-validator";
import sequelize from "../database/index";
import { Error, QueryTypes } from "sequelize";
import { ApiResponse } from "../response";
import { IProductInShop, IProduct, IShopStock, ProductsModuleError, ProductsListResponse, ProductsInStockListResponse, ProductCreateResponse, INewProduct, OrderCreateResponse } from "./responses/product.responses";
import RabbitMQ from "../tunnel/rabbitmq";

export class ProductService {

     /**
      * Метод для получения остатков товаров на полке, по фильтрам
      * @param {ProductsGetDTO} filters - строка запроса с фильтрами
      * @returns {ProductsInStockListResponse}  - ответ запроса
      */
     async getProductsLeavings(filters: ProductsGetDTO): Promise<ProductsInStockListResponse> {

          let result: IShopStock[] = [];

          const queryDto = plainToClass(ProductsGetDTO, filters);

          const errors = await validate(queryDto);
          if (errors.length > 0) {
               throw new ProductsModuleError(400, 'Неверно переданы фильтры', {
                    validationErrors: errors.map((error) => ({
                         field: error.property,
                         issues: error.constraints,
                    })),
               });
          }

          try {
               const sqlQuery = `
                    SELECT 
                         ss.id AS "productInStockId",
                         ss.shop_id AS "shopId",
                         s.name AS "shopName",
                         ss.product_id AS "productId",
                         p.plu AS "productArticule",
                         p.name AS "productName",
                         ss.quantity AS "quantityInStock",
                         COALESCE(SUM(od.quantity), 0) AS "quantityInOrders"
                    FROM shop_stock ss
                    JOIN shop s ON ss.shop_id = s.id
                    JOIN product p ON ss.product_id = p.id
                    LEFT JOIN order_detail od ON od.order_id IN (
                         SELECT o.id
                         FROM "order" o
                         WHERE o.product_id = ss.product_id
                    )
                    WHERE 1=1
                         AND (:shopId IS NULL OR ss.shop_id = :shopId)
                         AND (:PLU IS NULL OR p.PLU = :PLU)
                         AND (:quantityInStockMin IS NULL OR ss.quantity >= :quantityInStockMin)
                         AND (:quantityInStockMax IS NULL OR ss.quantity <= :quantityInStockMax)
                    GROUP BY ss.id, ss.shop_id, s.name, ss.product_id, p.name, p.plu, ss.quantity
                    HAVING 
                         (:quantityInOrdersMin IS NULL OR COALESCE(SUM(od.quantity), 0) >= :quantityInOrdersMin)
                         AND (:quantityInOrdersMax IS NULL OR COALESCE(SUM(od.quantity), 0) <= :quantityInOrdersMax);
               `;

               const {
                    PLU = null,
                    shopId = null,
                    quantityInStock = [],
                    quantityInOrders = []
               } = queryDto;
            
               const formedQueryDto = {
                    PLU,
                    shopId,
                    quantityInStockMin: quantityInStock[0] ?? null,
                    quantityInStockMax: quantityInStock[1] ?? null,
                    quantityInOrdersMin: quantityInOrders[0] ?? null,
                    quantityInOrdersMax: quantityInOrders[1] ?? null,
               };


               let productsInStock: IProductInShop[] = await sequelize.query(sqlQuery, {
                    replacements: formedQueryDto,
                    type: QueryTypes.SELECT,
                  });
                
               result =  Object.values(productsInStock.reduce((acc: any, item: IProductInShop) => {

                    if(!acc[item.shopId]) {
                         acc[item.shopId] = {
                              shopId: item.shopId,
                              shopName: item.shopName,
                              stock: []
                         }
                    };

                    acc[item.shopId].stock.push({
                         productInStockId: item.productInStockId,
                         productId: item.productId,
                         productArticule: item.productArticule,
                         productName: item.productName,
                         quantityInStock: item.quantityInStock,
                         quantityInOrders: item.quantityInOrders
                    })

                    return acc;
               }, {}))
               
          } catch(e) {
               console.log(e);

               if (e instanceof Error) {
                   throw new ProductsModuleError(500, 'Произошла ошибка во время получения данных об остатках', {})
               }
          }

          return new ProductsInStockListResponse(result);
     }

     /**
      * Метод для получения всех товаров в системе, по фильтрам
      * @param {OrderPostDTO} filters - строка запроса с фильтрами
      * @returns {ProductsListResponse}  - ответ запроса
      */
     async getProducts(filters: ProductGetDTO): Promise<ProductsListResponse> {

          let result

          const queryDto = plainToClass(ProductGetDTO, filters);

          const errors = await validate(queryDto);
          if (errors.length > 0) {
               throw new ProductsModuleError(400, 'Неверно переданы фильтры', {
                    validationErrors: errors.map((error) => ({
                         field: error.property,
                         issues: error.constraints,
                    })),
               });
          }
          try {

               const sqlQuery = `
                    SELECT id AS "productId", plu AS "PLU", name AS "productName", shop_id AS "shopId" FROM product
                    WHERE is_active = 1 AND (:name IS NULL OR name = :name) AND (:PLU IS NULL OR PLU = :PLU) AND (:shopId IS NULL OR shop_id = :shopId)
               `;

               result = await sequelize.query(sqlQuery, {
                    replacements: {
                         name: queryDto.name ?? null,
                         PLU: queryDto.PLU ?? null,
                         shopId: queryDto.shopId ?? null
                    },
                    type: QueryTypes.SELECT,
                    });
                    
          } catch(e) {
               console.log(e);

               if (e instanceof ApiResponse) {
                    throw new ProductsModuleError(400, e.message, e.payload)
               }

               throw new ProductsModuleError(500, 'Произошла ошибка во время получения данных об остатках', {})
          }

          return new ProductsListResponse(result as IProduct[]);
     }

     /**
      * Метод для создания нового товара
      * @param {OrderPostDTO} body - тело запроса
      * @returns {ProductCreateResponse}  - ответ запроса
      */
     async createProduct(body: ProductPostDTO): Promise<ProductCreateResponse> {

          const queryDto = plainToClass(ProductPostDTO, body);

          const errors = await validate(queryDto);
          if (errors.length > 0) {
               throw new ProductsModuleError(400, 'Неверное тело запроса', {
                    validationErrors: errors.map((error) => ({
                         field: error.property,
                         issues: error.constraints,
                    })),
               });
          }

          const sqlQuery = 
               `INSERT INTO product (plu, name, shop_id) VALUES (:PLU, :name, :shopId) RETURNING id AS "productId", plu AS "productPLU", name AS "productName"`;

          let result: any;
          try {
               [result] = await sequelize.query(sqlQuery, {
                    replacements: {
                         PLU: queryDto.PLU,
                         name: queryDto.name,
                         shopId: queryDto.shopId
                    },
                    type: QueryTypes.RAW,
               });
          } catch(e: any) {
               if (e?.original?.code === '23505') {
                    if (e.original.detail.includes('plu'))
                        throw new ApiResponse(400, 'Товар с таким артикулом уже существует', {});
                }

               throw new ProductsModuleError(500, 'Неизвестная ошибка сервера', e)
          }

          try {
               console.log("Отправка события в RabbitMQ");
               await RabbitMQ.publish({
                   action: "CREATE_PRODUCT",
                   timestamp: new Date(),
                   data: {
                       ...result[0],
                       shopId: queryDto.shopId
                   },
               });
           } catch (e) {
               console.error("Ошибка при отправке сообщения в RabbitMQ:", e);
           }

          return new ProductCreateResponse(result[0]);
     }

     /**
      * Метод для добавления товаров на полках магазина
      * @param {OrderPostDTO} body - тело запроса
      * @returns {ApiResponse}  - ответ запроса
      */
     async fillStock(body: ProductsToStockPostDTO): Promise<ApiResponse> {
          const queryDto = plainToClass(ProductsToStockPostDTO, body);
          const errors = await validate(queryDto);
          if (errors.length > 0) {
              throw new ProductsModuleError(400, 'Неверное тело запроса', {
                  validationErrors: errors.map((error) => ({
                      field: error.property,
                      issues: error.constraints,
                  })),
              });
          }
      
          let result;
          const t = await sequelize.transaction();
      
          try {
              let [productsCntInStock]: { quantity: number }[] = await sequelize.query(
                  `SELECT quantity FROM shop_stock WHERE shop_id = :shopId AND product_id = :productId AND is_active = 1`,
                  {
                      replacements: {
                          shopId: queryDto.shopId,
                          productId: queryDto.productId,
                      },
                      type: QueryTypes.SELECT,
                  }
              );
      
              if (productsCntInStock?.quantity) {
                  await sequelize.query(
                      `UPDATE shop_stock SET quantity = :newQuantity WHERE product_id = :productId`,
                      {
                          replacements: {
                              newQuantity: productsCntInStock.quantity + queryDto.quantity,
                              productId: queryDto.productId,
                          },
                          type: QueryTypes.UPDATE,
                          transaction: t,
                      }
                  );
              } else {
                  const sqlQuery = 
                  `INSERT INTO shop_stock (shop_id, product_id, quantity) VALUES (:shopId, :productId, :quantity)`;
      
                  try {
                      [result] = await sequelize.query(sqlQuery, {
                          replacements: {
                              shopId: queryDto.shopId,
                              productId: queryDto.productId,
                              quantity: queryDto.quantity,
                          },
                          type: QueryTypes.INSERT,
                          transaction: t,
                      });
                  } catch (e) {
                      console.log(e);
                  }
              }
      
              await t.commit();
          } catch (e) {
              await t.rollback();
              console.log(e);

              throw new ProductsModuleError(500, 'Неизвестная ошибка сервера', e)
          }
      
          return new ApiResponse(201, 'Продукт успешно добавлен на полки', result);
      }
      

     /**
      * Метод для оформления заказа
      * @param {OrderPostDTO} body - тело запроса
      * @returns {OrderCreateResponse}  - ответ запроса
      */
     async createOrder(body: OrderPostDTO): Promise<OrderCreateResponse> {

          const queryDto = plainToClass(OrderPostDTO, body);

          const errors = await validate(queryDto);
          if (errors.length > 0) {
               throw new ProductsModuleError(400, 'Неверное тело запроса', {
                    validationErrors: errors.map((error) => ({
                         field: error.property,
                         issues: error.constraints,
                    })),
               });
          }

          const t = await sequelize.transaction();

          let newOrderId;

          try {

               const productsCntInStock: { quantity: number }[] = await sequelize.query(`
                    SELECT quantity FROM shop_stock WHERE product_id = :productId AND is_active = :isActive
               `,
               {
                    replacements: {
                         productId: queryDto.productId,
                         isActive: 1
                    },
                    type: QueryTypes.SELECT
               })

               if(productsCntInStock[0]?.quantity < queryDto.quantity) {
                    throw new ProductsModuleError(400, 'К сожалению не получится оформить заказ, т.к. на полке меньше товара, чем вы хотите оформить', {})
               }

               const [[newOrder]]: any[] = await sequelize.query(`
                    INSERT INTO "order" (user_id, product_id) VALUES (:userId, :productId) RETURNING id
               `,
               {
                    replacements: {
                         userId: queryDto.userId,
                         productId: queryDto.productId
                    },
                    type: QueryTypes.INSERT,
                    transaction: t
               })

               newOrderId = newOrder?.id

               await sequelize.query(`
                    INSERT INTO order_detail (order_id, quantity) VALUES (:orderId, :quantity)
               `,
               {
                    replacements: {
                         orderId: newOrder.id,
                         quantity: queryDto.quantity
                    },
                    type: QueryTypes.INSERT,
                    transaction: t
               })

               await sequelize.query(`
                    UPDATE shop_stock SET quantity = :newQuantity WHERE product_id = :productId
               `,
               {
                    replacements: {
                         newQuantity: productsCntInStock[0].quantity - queryDto.quantity,
                         productId: queryDto.productId
                    },
                    type: QueryTypes.UPDATE,
                    transaction: t
               })

               await t.commit();

          } catch(e) {
               console.log(e);

               await t.rollback();

               if(e instanceof ProductsModuleError) {
                    throw e;
               }
               throw new ProductsModuleError(500, 'Не удалось создать новый заказ', {e});
          }

          return new OrderCreateResponse({orderId: newOrderId});

     }
     
}