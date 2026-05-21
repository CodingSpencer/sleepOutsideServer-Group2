import * as argon2 from "argon2";
import { MongoClient, ServerApiVersion } from "mongodb";
import { products } from "./products.js";

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URI}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

const init = async () => {
  try {
    await client.connect();
    console.log(`Connected to MongoDB`);

    const db = client.db(process.env.MONGO_DATABASE);

    await seedProducts(db);
    await seedUsers(db);
    await setupOrders(db);
    await setupAlerts(db);

    console.log("Database setup complete!");
  } catch (error) {
    console.error(error.message);
  } finally {
    await client.close();
  }
};

const lowerCaseKeys = function (obj) {
  if (typeof obj === "object" && !Array.isArray(obj)) {
    for (let key in obj) {
      let newKey = key[0].toLowerCase() + key.slice(1);

      if (typeof obj[key] === "object") {
        obj[newKey] = lowerCaseKeys(obj[key]);
        delete obj[key];
      } else {
        obj[newKey] = obj[key];
        delete obj[key];
      }
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      let item = obj[i];

      if (typeof item === "object") {
        obj[i] = lowerCaseKeys(item);
      }
    }
  }

  return obj;
};

const seedProducts = async (db) => {
  const newProducts = products.map((product) => {
    product.Reviews.ReviewsUrl = `/products/${product.Id}/reviews/`;
    product = lowerCaseKeys(product);
    return product;
  });

  try {
    await db.collection("products").drop().catch(() => {
      console.log("No existing products collection to drop");
    });

    await db.createCollection("products");
    console.log("Collection 'products' created successfully");

    const productsCollection = db.collection("products");

    const result = await productsCollection.insertMany(newProducts);

    console.log(`${result.insertedCount} product(s) inserted`);

    await productsCollection.createIndex({ name: 1 });
    await productsCollection.createIndex({ descriptionHtmlSimple: 1 });
    await productsCollection.createIndex({ category: 1 });
    await productsCollection.createIndex({ id: 1 });

    console.log("Product indexes created");
  } catch (error) {
    console.error(error.message);
  }
};

const seedUsers = async (db) => {
  try {
    await db.collection("users").drop().catch(() => {
      console.log("No existing users collection to drop");
    });

    await db.createCollection("users");
    console.log("Collection 'users' created successfully");

    const usersCollection = db.collection("users");

    const hashedPassword = await argon2.hash("password");

    await usersCollection.insertOne({
      name: "Test User",
      email: "test@test.com",
      password_hash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await usersCollection.createIndex({ name: 1 });
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    console.log("Test user inserted and user indexes created");
  } catch (error) {
    console.error(error.message);
  }
};

const setupOrders = async (db) => {
  try {
    await db.collection("orders").drop().catch(() => {
      console.log("No existing orders collection to drop");
    });

    await db.createCollection("orders");
    console.log("Collection 'orders' created successfully");
  } catch (error) {
    console.error(error.message);
  }
};

const setupAlerts = async (db) => {
  try {
    await db.collection("alerts").drop().catch(() => {
      console.log("No existing alerts collection to drop");
    });

    await db.createCollection("alerts");
    console.log("Collection 'alerts' created successfully");
  } catch (error) {
    console.error(error.message);
  }
};

init();