//@ts-nocheck
"use server";

import { sql } from "kysely";
import { DEFAULT_PAGE_SIZE } from "../../constant";
import { db } from "../../db";
import { InsertProducts, UpdateProducts } from "@/types";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/utils/authOptions";
import { cache } from "react";

export async function getProducts(pageNo = 1, pageSize = DEFAULT_PAGE_SIZE , searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    // console.log("get prod ====> ");

    // 1. Count total products
    const result = await db
      .selectFrom("products")
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst();

    const count = Number(result?.count || 0);
    // console.log("count:", count);
    // console.log("pageSize:", pageSize);

    const lastPage = Math.ceil(count / pageSize);

    // 2. Get paginated products
    const products = await db
      .selectFrom("products")
      .selectAll()
      .offset((pageNo - 1) * pageSize)
      .limit(pageSize)
      .execute();

    const numOfResultsOnCurPage = products.length;

    return { products, count, lastPage, numOfResultsOnCurPage };
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw error;
  }
}


export const getProduct = cache(async function getProduct(productId: number) {
  // console.log("run");
  try {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("id", "=", productId)
      .execute();

    return product;
  } catch (error) {
    return { error: "Could not find the product" };
  }
});

async function enableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 1`.execute(db);
}

async function disableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 0`.execute(db);
}

export async function deleteProduct(productId: number) {
  try {
    await disableForeignKeyChecks();
    await db
      .deleteFrom("product_categories")
      .where("product_categories.product_id", "=", productId)
      .execute();
    await db
      .deleteFrom("reviews")
      .where("reviews.product_id", "=", productId)
      .execute();

    await db
      .deleteFrom("comments")
      .where("comments.product_id", "=", productId)
      .execute();

    await db.deleteFrom("products").where("id", "=", productId).execute();

    await enableForeignKeyChecks();
    revalidatePath("/products");
    return { message: "success" };
  } catch (error) {
    return { error: "Something went wrong, Cannot delete the product" };
  }
}

export async function MapBrandIdsToName(brandsId) {
  const brandsMap = new Map();
  try {
    for (let i = 0; i < brandsId.length; i++) {
      const brandId = brandsId.at(i);
      const brand = await db
        .selectFrom("brands")
        .select("name")
        .where("id", "=", +brandId)
        .executeTakeFirst();
      brandsMap.set(brandId, brand?.name);
    }
    return brandsMap;
  } catch (error) {
    throw error;
  }
}

export async function getAllProductCategories(products: any) {
  try {
    const productsId = products.map((product) => product.id);
    const categoriesMap = new Map();

    for (let i = 0; i < productsId.length; i++) {
      const productId = productsId.at(i);
      const categories = await db
        .selectFrom("product_categories")
        .innerJoin(
          "categories",
          "categories.id",
          "product_categories.category_id"
        )
        .select("categories.name")
        .where("product_categories.product_id", "=", productId)
        .execute();
      categoriesMap.set(productId, categories);
    }
    return categoriesMap;
  } catch (error) {
    throw error;
  }
}

export async function getProductCategories(productId: number) {
  try {
    const categories = await db
      .selectFrom("product_categories")
      .innerJoin(
        "categories",
        "categories.id",
        "product_categories.category_id"
      )
      .select(["categories.id", "categories.name"])
      .where("product_categories.product_id", "=", productId)
      .execute();

    return categories;
  } catch (error) {
    throw error;
  }
}
export async function updateProduct(id: number, payload: UpdateProducts) {
  try {
    await db
      .updateTable("products")
      .set(payload)
      .where("id", "=", id)
      .execute();

    revalidatePath("/products");

    return { message: "Product updated successfully!" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Could not update the product." };
  }
}
export async function updateProductCategories(productId: number, categoryIds: number[]) {
  try {
    // 1. Delete existing mappings
    await db
      .deleteFrom("product_categories")
      .where("product_id", "=", productId)
      .execute();

    // 2. Insert new mappings
    const insertValues = categoryIds.map((categoryId) => ({
      product_id: productId,
      category_id: categoryId,
    }));

    if (insertValues.length > 0) {
      await db.insertInto("product_categories").values(insertValues).execute();
    }

    revalidatePath("/products");

    return { message: "Categories updated successfully." };
  } catch (err) {
    console.error("updateProductCategories error:", err);
    return { error: "Failed to update product categories." };
  }
}
export async function postProduct(product: InsertProducts) {
  try {
    const result = await db
      .insertInto("products")
      .values(product)
      .executeTakeFirst();

    const insertId = result.insertId; // Get the auto-incremented ID

    if (!insertId) {
      return { error: "Failed to insert product" };
    }

    revalidatePath("/products");

    return { message: "success", id: insertId };
  } catch (err: any) {
    return { error: err.message };
  }
}

