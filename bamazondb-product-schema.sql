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

CREATE TABLE departments
(
	department_id INT(10) NOT NULL,
	department_name VARCHAR(20),
	over_head_costs INT(10),
    product_sales DECIMAL(10,2),
	total_profit DECIMAL(10,2),
    PRIMARY KEY (department_id)
);

-- SELECT * FROM products;
SELECT * FROM departments;