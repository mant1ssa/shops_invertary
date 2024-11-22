import fastify from "fastify";
import { createHistory, getHistory } from "./src/history/history.js";
import { GatewayAdapterError } from "./src/response.js";
import { createHistorySchema } from "./src/history/schema.js";
import RabbitMQ from './src/tunnel/rabbitmq.js';

import 'dotenv/config';



const api = fastify({
    ajv: {
      customOptions: {
        formats: {},
      },
    },
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
});

// Настройка обработки ошибок с расширенным JSON-форматом (в проекте 'расширяется' класс Errors)
api.setErrorHandler((error, request, reply) => {
    if (error instanceof GatewayAdapterError) {
      reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        message: error.message,
        result: error.result,
      });
    } else {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  });


api.register((api, options, done) => {
    api.route({
        method: "GET",
        url: "/history",
        handler: async (request, reply) => {
            return getHistory(request.query);
        },
    }),
    api.route({
        method: "POST",
        url: "/history",
        schema: createHistorySchema,
        handler: async (request, reply) => {
            return createHistory(request.body);
        },
    })
    done();
})

// Инициализация RabbitMQ
RabbitMQ.init()
  .then(() => {
    RabbitMQ.consume(async (message) => {
      console.log("Получено сообщение:", message);

      await createHistory({
        action: message.action.toLowerCase(),
        // actionDate: message.timestamp,
        // shopId: message.data.shopId,
        // productId: message.data.productId,
        // productName: message.data.productName,
        // PLU: message.data.productPLU,
        // quantity: null,
      });
    });
  })
  .catch((err) => console.error("RabbitMQ не удалось запустить:", err));

try {
    api.listen({ port: process.env.HTTP_PORT });
    console.log(`Сервер запущен на порту ${process.env.HTTP_PORT}`);
  } catch (err) {
    console.error("Ошибка запуска сервера:", err);
}