import { Response, Request, Router } from "express";
import { ProductService } from "./product.service";
import { ApiResponse } from "../response";
import { ProductsModuleError } from "./responses/product.responses";

const router = Router();

const productService = new ProductService();

router.get('/stock', async (req: Request, res: Response) => {
    productService.getProductsLeavings(req.query)
        .then(response => res.status(response.statusCode).send( new ApiResponse(response.statusCode, response.message, response.payload) ))
        .catch(err => res.status(err.statusCode).send( new ProductsModuleError(err.statusCode, err.message, err.payload) ))
})

router.get('/', async (req: Request, res: Response) => {
    productService.getProducts(req.query)
    .then(response => res.status(response.statusCode).send( new ApiResponse(response.statusCode, response.message, response.payload) ))
    .catch(err => res.status(err.statusCode).send( new ProductsModuleError(err.statusCode, err.message, err.payload) ))
})

router.post('/', async (req: Request, res: Response) => {
    productService.createProduct(req.body)
        .then(response => res.status(response.statusCode).send( new ApiResponse(response.statusCode, response.message, response.payload) ))
        .catch(err => res.status(err.statusCode).send( new ProductsModuleError(err.statusCode, err.message, {}) ))
})

router.post('/stock', async (req: Request, res: Response) => {
    productService.fillStock(req.body)
        .then(response => res.status(response.statusCode).send( new ApiResponse(response.statusCode, response.message, response.payload) ))
        .catch(err => res.status(err.statusCode).send( new ProductsModuleError(err.statusCode, err.message, {}) ))
})

router.post('/order', async (req: Request, res: Response) => {
    productService.createOrder(req.body)
        .then(response => res.status(response.statusCode).send( new ApiResponse(response.statusCode, response.message, response.payload) ))
        .catch(err => res.status(err.statusCode).send( new ProductsModuleError(err.statusCode, err.message, {}) ))
})

export const productsRouter = router