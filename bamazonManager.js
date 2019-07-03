require('dotenv').config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require('figlet');
const boxen = require('boxen');
const Table = require('cli-table3');

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "bamazondb"
});

// ============= 1.Welcome =============
figlet('Bamazon', function (err, data) {
    if (err) { console.dir(err); return };
    console.log("\r\n\r\n           ✿                        ✿              ✿\n     ✿        ✿                                       ✿"
        + boxen("\n ✿ Welcome to ✿\n" + chalk.bold.white(data + "✿ "), { backgroundColor: "cyan", borderColor: "cyan", padding: 1, margin: 1, borderStyle: 'round' })
        + "    ✿                               ✿                     ✿ \n           ✿                    ✿")
    console.log(chalk.bold.cyan("\n                      - Manager Version -\n\r\n\r\n\r\n\r"))

    // ============= 2.connection MySql =============
    connection.connect(function (err) {
        if (err) { throw err };
        // console.log("connected as id: " + connection.threadId + "\n");
        manager();
    });
});

// ============= 3. Read & Update database through inquirer =============
function manager() {
    inquirer.prompt({
        name: "manager",
        type: "list",
        message: "How may I serve you?",
        choices: ["[View Products for Sale]", "[View Low Inventory]", "[Add to Inventory]", "[Add New Product]", "[Exit]"]
    })
        .then(function (answer) {
            switch (answer.manager) {
                case "[View Products for Sale]":
                    viewAll()
                    break;
                case "[View Low Inventory]":
                    viewLow()
                    break;
                case "[Add to Inventory]":
                    addLow()
                    break;
                case "[Add New Product]":
                    addNew()
                    break;
                case "[Exit]":
                    connection.end();
                    process.exit();
                    break;
            }
        });
}

// ======= 3.1 read database (all products) =======
function viewAll() {

    // ============= 3.1a build a departments cli-table with head only =============
    let table = new Table({
        head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
    });

    // ============= 3.1b read every departments data and push into the table =============
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) { throw err };
        // console.log(res);
        for (let i = 0; i < res.length; i++) {
            let prodArr = [chalk.yellow(res[i].item_id), res[i].product_name, res[i].department_name, chalk.cyanBright(res[i].price), chalk.magentaBright(res[i].stock_quantity)];
            table.push(prodArr);
        };
        console.log(chalk.red("\n\n\n\n                              products table\n") + table.toString() + "\n\n\n\n");
        return manager();
    })
}

// ======= 3.2 read database (low inventory) =======
function viewLow() {

    // ============= 3.2a build a low inventory cli-table with head only =============
    let table2 = new Table({
        head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
    });

    // ============= 3.1b read the data which inventory quantity between 0 -- 50, and push into the table =============
    connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN 0 AND 50", function (err, res) {
        if (err) { throw err };
        // console.log(res);
        for (let i = 0; i < res.length; i++) {
            let lowArr = [chalk.yellow(res[i].item_id), res[i].product_name, res[i].department_name, chalk.cyanBright(res[i].price), chalk.magentaBright(res[i].stock_quantity)];
            table2.push(lowArr);
        };
        console.log(chalk.red("\n\n\n\n                              Low Inventory\n") + table2.toString() + "\n\n\n\n");
        return manager();
    })
}

// ======= 3.3 update data in table column of database (add low inventory) =======
function addLow() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Enter the product ID which need to reload: "
    }, {
        name: "addQuantity",
        type: "input",
        message: "Enter the product quantity for reloading: "
    }]).then(function (answer) {
        if (answer.id.length < 1 || answer.addQuantity.length < 1 || parseFloat(answer.addQuantity) === NaN) {
            console.log(chalk.yellowBright("\n\n    Invalid item ID or quantity, would you like to try again?"));
            console.log(chalk.cyan("\n Return to Menu.......\n\r\n\r\n\r\n\r"));
            return addLow();
        } else {
            // ======= 3.31 read database (low inventory) =======
            connection.query("SELECT * FROM products WHERE ?",
                { item_id: answer.id }, function (err, res) {
                    if (err) { throw err; };
                    // console.log(res);

                    // ======= 3.32 update database (low inventory) =======
                    let upId = answer.id;
                    let upQuantity = parseFloat(answer.addQuantity) + parseFloat(res[0].stock_quantity);
                    // console.log("tlNum: "+upQuantity);

                    connection.query("UPDATE products SET ? WHERE ?",
                        [{ stock_quantity: upQuantity }, { item_id: upId }], function (err, update) {
                            if (err) { throw err; };
                            // console.log(res);
                            console.log(chalk.green("\n\n       ➯ Reloading Complete.\n\r"));
                            return viewLow();
                        }
                    );
                });
        }
    })
}

// ======= 3.4 Create data in table column of database (add new item) =======
function addNew() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Enter a new 'item_id': "
    }, {
        name: "name",
        type: "input",
        message: "Enter a new 'product_name': "
    }, {
        name: "dept",
        type: "input",
        message: "Enter a new 'department_name': ",
    }, {
        name: "price",
        type: "input",
        message: "Enter a new 'price': "
    }, {
        name: "quantity",
        type: "input",
        message: "Enter a new 'stock_quantity': "
    }]).then(function (answer) {
        if (answer.id.length < 1 || answer.dept.length < 1 || answer.price.length < 1 || answer.quantity.length < 1 || parseFloat(answer.price) === NaN || parseFloat(answer.quantity) === NaN) {
            console.log(chalk.yellowBright("\n\n    Please try again. Make sure Price and Quantity are number ONLY."));
            console.log(chalk.cyan("\n Return to Menu.......\n\r\n\r\n\r\n\r"));
            return addNew();
        } else {
            connection.query("INSERT INTO products SET ?", {
                item_id: answer.id,
                product_name: answer.name,
                department_name: answer.dept,
                price: answer.price,
                stock_quantity: answer.quantity
            }, function (err, res) {
                if (err) { throw err; };
                console.log(chalk.green("\n\n       ➯ New Product Added.\n\r\n\r"));
                return viewAll();
            });
        }
    });
}