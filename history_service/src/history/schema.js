export const createHistorySchema = {
    tags: ["history"],
    summary: "Создание записи истории",
    description: "Метод для создания новой записи о событии, связанной с товарами и остатками",
    body: {
      type: "object",
      properties: {
        action: { type: "string" },
        actionDate: { type: "string", format: "date" },
        shopId: { type: "number", minimum: 1 },
        productId: { type: "number", minimum: 1 },
        productName: { type: "string", minLength: 1, maxLength: 250 },
        PLU: { type: "string", minLength: 10, maxLength: 12 },
        quantity: { type: "number" }
      },
      required: ['action', 'actionDate', 'shopId', 'productId', 'productName', 'PLU']
    }
}