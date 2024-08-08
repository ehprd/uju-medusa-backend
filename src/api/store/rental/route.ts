import {Router} from "express";
import {z} from "zod";
import {MedusaError} from "medusa-core-utils";
import {MedusaRequest, MedusaResponse} from "@medusajs/medusa";

const router = Router();

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const schema = z.object({
        vehicle: z.string(),
        start_date: z.date(),
        end_date: z.date(),
    });

    const {data, error} = schema.safeParse(req.body);
    if (error) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, error.errors.toString());
    }

    const productService = req.scope.resolve("productService");
    const variantService = req.scope.resolve("variantService");

    // Find the product for the vehicle
    const product = await productService.retrieveByTitle(data.vehicle);

    // Create a new variant for the rental period
    const variant = await variantService.create({
        productId: product.id,
        title: `${data.start_date} to ${data.end_date}`,
        options: [{title: "Rental Period", value: `${data.start_date} to ${data.end_date}`}],
        prices: [{currency_code: "usd", amount: 100}],
    });

    return res.status(200).json({variant});
}

export default router;
