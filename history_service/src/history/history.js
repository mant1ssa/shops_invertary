import { db } from '../database/database.js';
import { gatewayAdapterErrors, GatewayAdapterErrorsWithParams } from '../response.js';

/**
 * Метод для получения истории всех действий из сервиса Продукты-заказы
 * @param {object} queryString - строка запроса с фильтрами
 * @returns {object} 
 */
export async function getHistory(queryString) {

    const { shopId, plu, actiondateBegin, actiondateEnd, action, actionsPerPage = process.env.DEFAULT_ITEMS_PER_PAGE, page = 1 } = queryString;

    const conditions = [];
    const params = [];

    if(shopId) {
        conditions.push(`hd.shop_id = $${params.length + 1}`);
        params.push(shopId);
    }
    if(plu) {
        conditions.push(`hd.plu = $${params.length + 1}`);
        params.push(plu);
    }
    if(actiondateBegin) {
        conditions.push(`h.action_date >= $${params.length + 1}`);
        params.push(actiondateBegin);
    }
    if(actiondateEnd) {
        conditions.push(`h.action_date <= $${params.length + 1}`);
        params.push(actiondateEnd);
    }
    if(action) {
        conditions.push(`h.action = $${params.length + 1}`);
        params.push(action);
    }

    const queryConditionString = `${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}` ;

    // Пагинация
    const limit = Number(actionsPerPage);
    const offset = (page - 1) * actionsPerPage;
    params.push(limit, offset);

    let result = await db.manyOrNone(`SELECT h.id AS "historyId", 
                                             h.action_date AS "actionDate", 
                                             hd.shop_id AS "shopId", 
                                             hd.product_id AS "productId",
                                             hd.product_name AS "productName",
                                             hd.plu AS "productPLU",
                                             hd.quantity AS "quantity"
                                         FROM history h 
                                         LEFT JOIN history_detail hd ON hd.history_id = h.id
                                       ${queryConditionString}
                                       LIMIT $${params.length - 1} OFFSET $${params.length}`, params)

    if(result) {

        result.forEach(act => {
            let date_temp = new Date(act.actionDate);

            date_temp.setHours(date_temp.getHours() + 5);

            act.actionDate = date_temp.toISOString().split('T')[0];
        });

        return result;
    } else {
        throw gatewayAdapterErrors.internalError;
    }
}


/**
 * Метод для создания новой записи о каком-то событии, происходящиими с товарами и остатками
 * @param {object} body - тело запроса
 * @returns {object} 
 */
export async function createHistory(body) {

    console.log(body)

    const { action, actionDate, shopId, productId, productName, PLU, quantity } = body;

    if(!['create_product', 'fill_stock', 'create_order'].includes(action)) {
        throw new GatewayAdapterErrorsWithParams().wrongActionNameInRequser(action);
    }

    if(action == 'create_product' && quantity) {
        throw gatewayAdapterErrors.createProductDoesntHaveQuantity;
    };

    let newHistory;
    try {
        await db.tx(async t => {
            newHistory = await t.one(`INSERT INTO history (action_date, action) VALUES ($1, $2) RETURNING id`, [actionDate, action]);

            await t.query(`INSERT INTO history_detail (history_id, shop_id, product_id, product_name, plu, quantity) VALUES ($1, $2, $3, $4, $5, $6)`, [newHistory.id, shopId, productId, productName, PLU, quantity])
        })
    } catch(e) {
        console.log(e);

        throw gatewayAdapterErrors.internalError;
    }

    return {
        statusCode: 201,
        message: 'Успешно создана новая запись о событии, связанной с товарами и остатками',
        result : newHistory
    }

}