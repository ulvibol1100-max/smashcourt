-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "username" TEXT NOT NULL, "email" TEXT NOT NULL,
    "phone" TEXT, "password_hash" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "label" TEXT, "line1" TEXT NOT NULL, "city" TEXT NOT NULL,
    "lat" DOUBLE PRECISION, "lng" DOUBLE PRECISION, "is_default" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "products" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "brand" TEXT NOT NULL, "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL, "weight" INTEGER, "balance" TEXT, "string_tension" TEXT, "grip_size" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL, "product_id" TEXT NOT NULL, "url" TEXT NOT NULL, "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "carts" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, CONSTRAINT "carts_pkey" PRIMARY KEY ("id"));
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL, "cart_id" TEXT NOT NULL, "product_id" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "orders" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL, "discount_total" DECIMAL(10,2) NOT NULL DEFAULT 0, "total" DECIMAL(10,2) NOT NULL,
    "delivery_address_id" TEXT NOT NULL, "discount_code" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL, "order_id" TEXT NOT NULL, "product_id" TEXT NOT NULL, "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL, "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL, "code" TEXT NOT NULL, "type" "DiscountType" NOT NULL, "value" DECIMAL(10,2) NOT NULL,
    "starts_at" TIMESTAMP(3), "ends_at" TIMESTAMP(3), "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL, "recipient_role" "Role" NOT NULL, "type" TEXT NOT NULL, "payload" JSONB NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "inventory_logs" (
    "id" TEXT NOT NULL, "product_id" TEXT NOT NULL, "change" INTEGER NOT NULL, "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "token" TEXT NOT NULL, "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "cart_items"("cart_id", "product_id");
CREATE UNIQUE INDEX "discounts_code_key" ON "discounts"("code");
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_address_id_fkey" FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
