import type { QueryParams, User } from "../models/types.mts";
import jwt from "jsonwebtoken";
import Ajv from "ajv";
import addFormats from "ajv-formats"
import addKeywords from "ajv-keywords"
import type { JSONSchema7 } from "json-schema"
import EntityNotFoundError from "../errors/EntityNotFoundError.mts";

export function validator(schema:JSONSchema7 , data:Object) {
    // @ts-ignore
    const ajv = new Ajv();
    // @ts-ignore
    addFormats(ajv);
    // @ts-ignore
    addKeywords(ajv, "instanceof"); 
    const validate = ajv.compile(schema)
    if(!validate(data)) {
        if(validate.errors) {
            const message = validate.errors.map((error:any)=> error.instancePath+" "+error.message).join(", ");
            throw new EntityNotFoundError({message:message, statusCode:400 });
        }
    }
}

export function formatFields(fields: string): Record<string, number> {
  const projectionObj: Record<string, number> = {};

  fields.split(",").forEach((field) => {
    const trimmed = field.trim();

    if (trimmed) {
      projectionObj[trimmed] = 1;
    }
  });

  return projectionObj;
}

// remember we created a QueryParams interface earlier in types.mts? Import it and use it here again
export function buildPaginationWrapper(totalCount: number, query: QueryParams) {
  // here we check to see if there is a limit...if yes convert it to a number, if no set it to the default of 20
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  // assume you got 35 results back with a limit of 20, total pages would be 1.75. We can't have partial pages so Math.ceil would raise that to 2
  const totalPages = Math.ceil(totalCount / limit);
  // offset/limit would give us 0, then we add one so we are on the first page.
  const currentPage = Math.ceil(offset / limit) + 1;
  // in this case currentPage == 1 so hasPreviousPage would be false
  const hasPreviousPage = currentPage > 1;
  console.log(currentPage, totalPages);
  // currentPage < totalPages would be true. (1 < 2)
  const hasNextPage = currentPage < totalPages;
  let next, prev;
  // create a new URLSearchParams object from the query parameters. This will make it easy to modify the fields we need to, while passing all the others on.
  // This is a bit of a hack because we can't use the query object directly in our URLSearchParams constructor.
  const params = new URLSearchParams(query as Record<string, any>);
  if (hasPreviousPage) {
    params.set("offset", (offset - limit).toString());
    prev = `/?${params}`;
  }
  if (hasNextPage) {
    params.set("offset", (offset + limit).toString());
    next = `/?${params}`;
  }

  return {
    count: totalCount,
    prev: prev || null,
    next: next || null,
    results: [] as any,
  };
}

export function sanitize(v: Record<string, any>) {
  if (typeof v === "object") {
    for (var key in v) {
      console.log(key, /^\$/.test(key));
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        sanitize(v[key]);
      }
    }
  }
  return v;
}

export function generateToken(user: User) {
  const secret = process.env.JWT_SECRET;

  const token = jwt.sign({ _id: user._id, email: user.email }, secret as string, {expiresIn: process.env.JWT_EXPIRES_IN as any});

  return token;
}