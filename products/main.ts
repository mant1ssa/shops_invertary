import express, { NextFunction, Request, Response } from 'express'
import RabbitMQ from './src/tunnel/rabbitmq';
import 'dotenv/config'

import { productsRouter } from './src/product/product.controller';
import { ApiResponse } from './src/response';

const app = express();

app.use(express.json());


app.use('/api/products', productsRouter);


app.all('*', (req: Request, res: Response) => {
    res.status(404).send( new ApiResponse(404, 'Не найден данный путь', {}) )
})



app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send( new ApiResponse(500, 'Внутренняя ошибка сервера', {error: err}) )
});


RabbitMQ.init()
    .then(() => console.log("RabbitMQ запущен"))
    .catch((err) => console.error("RabbitMQ не удалось запустить:", err));


app.listen(process.env.HTTP_PORT || 5000, () => {
    console.log(`SERVER is running on port ${process.env.HTTP_PORT || 5000}`)
})