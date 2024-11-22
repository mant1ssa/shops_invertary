--
-- Дамп базы для демонстрации работы проекта
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

-- CREATE USER mantissa WITH PASSWORD 'mantissa';
-- CREATE DATABASE mantissa OWNER mantissa;

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

INSERT INTO "user" (username, password, is_active) VALUES
    ('user1', 'password1', 1),
    ('user2', 'password2', 1);

INSERT INTO shop (name, address, is_active) VALUES
    ('Shop 1', 'Sverdlovsk', 1),
    ('Shop 2', 'Ufa', 1),
    ('Shop 3', 'Moscow', 1),
    ('Shop 4', 'Penza', 1);

INSERT INTO product (PLU, name, shop_id, is_active) VALUES
    ('32131123112', 'Product 1', 1, 1),
    ('82734718918', 'Product 2', 2, 1),
    ('72162736218', 'Product 3', 2, 1),
    ('12345678909', 'Product 4', 2, 1),
    ('99123132138', 'Product 5', 3, 1),
    ('18312311112', 'Product 6', 3, 1),
    ('31412412311', 'Product 7', 4, 1);

INSERT INTO "order" (user_id, product_id, date, status, is_active) VALUES
    (1, 1, '2024-11-01', 'issued', 1),
    (2, 2, '2024-11-02', 'delivering', 1),
    (2, 4, '2024-10-02', 'delivering', 1);

INSERT INTO order_detail (order_id, quantity, is_active) VALUES
    (1, 2, 1),
    (2, 10, 1),
    (3, 4, 1);


INSERT INTO shop_stock (shop_id, product_id, quantity, is_active) VALUES
    (1, 1, 625, 1),
    (2, 3, 300, 1),
    (4, 5, 3010, 1),
    (4, 1, 777, 1),
    (3, 7, 1000, 1);

ALTER TABLE public."order" ALTER COLUMN "date" SET DEFAULT now();

CREATE INDEX idx_product_plu ON product (plu);
CREATE INDEX idx_order_user_id ON "order" (user_id);
CREATE INDEX idx_order_product_id ON "order" (product_id);
CREATE INDEX idx_order_detail_order_id ON order_detail (order_id);
CREATE INDEX idx_shop_stock_shop_id ON shop_stock (shop_id);
CREATE INDEX idx_shop_stock_product_id ON shop_stock (product_id);

