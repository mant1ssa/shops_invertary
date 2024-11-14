--
-- Дамп базы для демонстрации работы проекта
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;



CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;



COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;


CREATE TYPE order_status AS ENUM ('issued', 'delivering', 'finished', 'cancelled');


CREATE TABLE "user" (
    id serial PRIMARY KEY,
    username varchar(250) NOT NULL,
    password varchar(250),
    is_active SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE shop (
    id serial PRIMARY KEY,
    name varchar(250) NOT NULL,
    address varchar(250),
    is_active SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE product (
    id serial PRIMARY KEY,
    PLU varchar(11) UNIQUE NOT NULL,
    name varchar(250) NOT NULL,
    shop_id serial,
    is_active SMALLINT NOT NULL DEFAULT 1,
    FOREIGN KEY (shop_id) REFERENCES shop (id)
);

CREATE TABLE "order" (
    id serial PRIMARY KEY,
    user_id serial NOT NULL,
    product_id serial NOT NULL,
    date date,
    status order_status DEFAULT 'issued',
    is_active SMALLINT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES "user" (id),
    FOREIGN KEY (product_id) REFERENCES product (id)
);

CREATE TABLE order_detail (
    id serial PRIMARY KEY,
    order_id serial NOT NULL,
    quantity smallserial,
    is_active SMALLINT NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES "order" (id)
);

CREATE TABLE shop_stock (
    id serial PRIMARY KEY,
    shop_id serial NOT NULL,
    product_id serial NOT NULL,
    quantity int DEFAULT 0,
    is_active SMALLINT NOT NULL DEFAULT 1,
    FOREIGN KEY (shop_id) REFERENCES shop (id),
    FOREIGN KEY (product_id) REFERENCES product (id)
);


CREATE INDEX idx_product_plu ON product (plu);
CREATE INDEX idx_order_user_id ON "order" (user_id);
CREATE INDEX idx_order_product_id ON "order" (product_id);
CREATE INDEX idx_order_detail_order_id ON order_detail (order_id);
CREATE INDEX idx_shop_stock_shop_id ON shop_stock (shop_id);
CREATE INDEX idx_shop_stock_product_id ON shop_stock (product_id);

