import {RentalProduct} from "../models/rental-product";
import {dataSource} from "@medusajs/medusa/dist/loaders/database";

export const RentalProductRepository = dataSource.getRepository(RentalProduct)
export default RentalProductRepository



