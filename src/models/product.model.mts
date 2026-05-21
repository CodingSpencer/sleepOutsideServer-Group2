import mongodb from "../database/index.mts";
import type {Product, FindProductObj} from "./types.mts";
import { Collection } from "mongodb";


// async function getAllProducts(): Promise<Product[] | null> {
//     const data = (await mongodb.getDb().collection<Product>("products").find({}).toArray());
//     console.log(data)
//     return data ;
// }

// models/product.model.mts
async function getProductById(id: string): Promise<Product | null> {
    const product = await mongodb.getDb().collection<Product>("products").findOne({id: id});
    return product;
}

export async function getAllProducts(find: FindProductObj) {
  const productsCollection:Collection<Product> = mongodb.getDb().collection<Product>('products');    
  // get the total number of records matching our query
  const totalCount = await productsCollection.countDocuments(find.search);
// apply the filters to get the matching records
  const cursor = await productsCollection.find(find.search).skip(find.offset).limit(find.limit);
// if fields were specified then reduce the results to just the required fields
  if(find.fieldFilters) {
    cursor.project(find.fieldFilters);
}
// finally convert the result to an array that we can consume
const results = await cursor.toArray();
console.log(totalCount, results)
    return {results, totalCount};


  // const productsCollection: Collection<Product> =
  //   mongodb.getDb().collection<Product>("products");

  // const totalCount = await productsCollection.countDocuments(findObj.search);

  // let cursor = productsCollection.find(findObj.search).skip(findObj.offset).limit(findObj.limit);

  // if (
  //   findObj.fieldFilters &&
  //   Object.keys(findObj.fieldFilters).length > 0
  // ) {
  //   cursor = cursor.project(findObj.fieldFilters);
  // }

  // const products = await cursor.toArray();

  // return {
  //   totalCount,
  //   products,
  // };
}

// don't forget to export the function
export default {
  getAllProducts,
  getProductById
}