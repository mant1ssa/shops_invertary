import express, { NextFunction, Request, Response } from 'express'
import 'dotenv/config'

import { productsRouter } from './src/product/product.controller';

const app = express();

app.use(express.json());

app.use('/api/products', productsRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send('Internal error')
});

app.listen(process.env.HTTP_PORT || 5000, () => {
    console.log(`SERVER is running on port ${process.env.HTTP_PORT || 5000}`)
})