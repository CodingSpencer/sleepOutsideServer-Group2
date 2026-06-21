import mongodb from "../database/index.mts";
import type {Product, FindProductObj} from "./types.mts";
import { Collection } from "mongodb";

// models/product.model.mts
async function getProductById(id: string): Promise<Product | null> {
    const product = await mongodb.getDb().collection<Product>("products").findOne({id: id});
    return product;
}

export async function getAllProducts(find: FindProductObj) {
  const productsCollection:Collection<Product> = mongodb.getDb().collection<Product>('products');    

  // Build MongoDB-specific query
  let mongoQuery: any = {};

  // Category was provided
  if (find.search.category) {
    mongoQuery.category = find.search.category;
  }

  // Product search was provided
  if (find.search.globalSearchTerm) {
    // Convert search term to case-insensitive regex
    const searchRegex = new RegExp(find.search.globalSearchTerm, 'i');
    mongoQuery.$or = [
      { name: searchRegex },
      { descriptionHtmlSimple: searchRegex },
    ];
  }

  const totalCount = await productsCollection.countDocuments(mongoQuery);
  const cursor = await productsCollection.find(mongoQuery).skip(find.offset).limit(find.limit);

  if(find.fieldFilters) {
    cursor.project(find.fieldFilters);
}

// finally convert the result to an array that we can consume
const results = await cursor.toArray();
console.log("Found matching records count:", totalCount);

return {results, totalCount};
}

export default {
  getAllProducts,
  getProductById
}