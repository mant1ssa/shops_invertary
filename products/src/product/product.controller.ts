import { Router } from "express";
import { ProductService } from "./product.service";

const router = Router();

const productService = new ProductService();

router.get('/', (req, res) => {
    res.status(200).send(productService.getProductsLeavings());
})

export const productsRouter = router