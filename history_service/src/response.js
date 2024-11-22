export class GatewayAdapterError extends Error {

  constructor(httpStatusCode, message, code = 0, result = []) {
    super(message);
    this.code = code;
    this.statusCode = httpStatusCode;
    this.name = "AdapterError";

    this.result = result;
  }
}

export class GatewayAdapterErrorsWithParams {
  incorrectParamError(param) { 
    return new GatewayAdapterError(400, `Передан неверный параметр ${param}`)
  }
  
  wrongActionNameInRequser(actionName) { 
    return new GatewayAdapterError(400, `Указан неверный тип для поля 'action' (${actionName})`)
  }
}

export const gatewayAdapterErrors = {
  internalError: new GatewayAdapterError(500, "Ошибка внутри сервиса"),
  createProductDoesntHaveQuantity: new GatewayAdapterError(400, "При создании нового товара незачем записывать поле количества"),
};
