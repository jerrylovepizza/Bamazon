DROP DATABASE IF EXISTS bamazonDB;
CREATE database bamazonDB;
USE bamazonDB;

CREATE TABLE products
(
	item_id INT (10) NOT NULL,
	product_name VARCHAR(20),
	department_name VARCHAR(20),
	price DECIMAL(10,2),
	stock_quantity INT(10),
    product_sales DECIMAL(10,2),
	PRIMARY KEY (item_id)
);
INSERT INTO products (item_id,product_name,department_name,price,stock_quantity,product_sales)
VALUES (1010024,"TP organic banana",grocery,0.59,13698,5900.00);
INSERT INTO products (item_id,product_name,department_name,price,stock_quantity,product_sales)
VALUES (1020035,"OG organic apple",grocery,2.99,19995,2990.00);
INSERT INTO products (item_id,product_name,department_name,price,stock_quantity,product_sales)
VALUES (1234568,"xmas led",garden,20.00,13691,6020.59);
/*CREATE TABLE departments
(
	department_id INT(10) NOT NULL,
	department_name VARCHAR(20),
	over_head_costs INT(10),
    product_sales DECIMAL(10,2),
	total_profit DECIMAL(10,2),
    PRIMARY KEY (department_id)
);*/

SELECT * FROM products;
/*SELECT * FROM departments;
