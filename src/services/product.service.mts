import productModel from "../models/product.model.mts";
import type { Product, QueryParams, FindProductObj } from "../models/types.mts";
import { formatFields, buildPaginationWrapper } from "./utils.mts";


//  const getAllProducts = async () => {
//   return await productModel.getAllProducts();
// };

const getProductById = async (id: string) => {
  return await productModel.getProductById(id);
};

export async function getAllProducts(query: QueryParams) {
  const limit = query.limit ? parseInt(query.limit, 10) : 20;
  const offset = query.offset ? parseInt(query.offset, 10) : 0;

  const findProduct: FindProductObj = {
    search: {},
    limit: limit,
    offset: offset,
  };

  const {q, category, fields} = query;

  if (query.category) {
    findProduct.search.category = query.category as Product["category"];
  }



  if (query.q) {
    (findProduct.search as any).$or = [
      { name: { $regex: query.q, $options: "i" } },
      { descriptionHtmlSimple: { $regex: query.q, $options: "i" } },
    ];
  }

  if (query.category) {
    findProduct.search.category = query.category;
  }

  if (query.fields) {
    findProduct.fieldFilters = formatFields(query.fields);
  }

  const dbResult = await productModel.getAllProductsFromDb(findProduct);

  const paginationWrapper = buildPaginationWrapper(dbResult.totalCount, query);
  paginationWrapper.results = dbResult.products;

  return paginationWrapper;
}

export default {
  getAllProducts,
  getProductById
};