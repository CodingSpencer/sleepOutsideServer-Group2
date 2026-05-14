import mongodb from "../database/index.mts";
import type {Product} from "./types.mts";


async function getAllProducts(): Promise<Product[] | null> {
    const data = (await mongodb.getDb().collection<Product>("products").find({}).toArray());
    console.log(data)
    return data ;
}

// models/product.model.mts
async function getProductById(id: string): Promise<Product | null> {
    const product = await mongodb.getDb().collection<Product>("products").findOne({id: id});
    return product;
}

// don't forget to export the function
export default {
  getAllProducts,
  getProductById
}

