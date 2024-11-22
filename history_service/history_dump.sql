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


CREATE TYPE action_type AS ENUM ('create_product', 'fill_stock', 'create_order');



CREATE TABLE history (
    id serial PRIMARY KEY,
    action_date date NOT NULL,
    "action" action_type NOT NULL
);

CREATE TABLE history_detail (
    id serial PRIMARY KEY,
    history_id serial NOT NULL,
    shop_id serial NOT NULL,
    product_id serial NOT NULL,
    product_name varchar(250) NOT NULL,
    PLU varchar(11) NOT NULL,
    quantity smallint,
    FOREIGN KEY (history_id) REFERENCES history (id)
);



INSERT INTO history (action_date, "action") VALUES
    ('2024-10-11', 'create_product');


-- Обойдемся без индексов

