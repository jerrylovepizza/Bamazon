require('dotenv').config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require('figlet');
const boxen = require('boxen');
const moment = require('moment');
const Table = require('cli-table3');

let tof = false;

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
        + boxen("\n ✿ Welcome to ✿\n" + chalk.bold.white(data + "✿ "), { backgroundColor: "magenta", borderColor: "magenta", padding: 1, margin: 1, borderStyle: 'round' })
        + "    ✿                               ✿                     ✿ \n           ✿                    ✿ \n\r\n\r\n\r\n\r")

    // ============= 2.connection MySql =============
    connection.connect(function (err) {
        if (err) { throw err };
        // console.log("connected as id: " + connection.threadId + "\n");
        customer();
    });
});

function customer() {
    inquirer.prompt({
        name: "customer",
        type: "list",
        message: "How may I help you?",
        choices: ["[Shopping]", "[Exit]"]
    })
        .then(function (answer) {
            switch (answer.customer) {
                case "[Shopping]":
                    shop()
                    break;
                case "[Exit]":
                    connection.end();
                    process.exit();
                    break;
            }
        });
}
function shop() {
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
        return purchase();
    })
}

// ============= 3. Read & Update database through inquirer =============
function purchase() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "Enter the product unique[ID] please."
        }, {
            name: "quantity",
            type: "input",
            message: "How many would you like for shopping?"
        }
    ]).then(function (answer) {
        connection.query("SELECT * FROM products WHERE ?", { item_id: answer.id }, function (err, response) {
            if (err) { throw err };

            // ======= 3.1 read database (customer check if ID is valid) =======
            let idArr = [];
            for (var k = 0; k < response.length; k++) {
                idArr.push(response[k].item_id);
            }

            if (idArr.indexOf(parseInt(answer.id)) === -1) {
                console.log(chalk.yellowBright("\n\n    Invalid item ID, would you like to try again?\n\n"));
                return purchase();
            }

            // ======= 3.2 ======= read database (customer check if quantity is enough) =======
            else if (answer.quantity.length < 1 || parseInt(response[0].stock_quantity) < parseInt(answer.quantity)) {
                console.log(
                    boxen("✿ Product Name       " + chalk.bold.greenBright(response[0].product_name + ' (' + response[0].item_id + ')\n') +
                        "✿ Product Price      " + chalk.bold.cyanBright('$ ' + response[0].price + "\n") +
                        "✿ Product Quantity   " + chalk.bold.redBright(response[0].stock_quantity + " left"), { backgroundColor: "black", borderColor: "magenta", padding: 1, margin: 1, borderStyle: 'classic' }) +
                    chalk.yellowBright("\n     Sorry we don't have enough in the store.\n\r\n\r\n\r\n\r")
                )
                return purchase();
            }

            // ======= 3.3 Update database (stock_quantity) if 3.1 and 3.2 are true =======
            else {
                let newStock = parseFloat(response[0].stock_quantity) - parseFloat(answer.quantity);

                connection.query("UPDATE products SET ? WHERE ?",
                    [{ stock_quantity: newStock }, { item_id: answer.id }],
                    function (err, update) {
                        if (err) { throw err; };

                        // ============= 3.5 Make a customer receipt =============
                        let totalPrice = parseInt(answer.quantity) * parseFloat(response[0].price);
                        console.log(
                            "\n\n       ................. Receipt ................." +
                            "\n\n         " + response[0].product_name + " ............ $ " + response[0].price +
                            "\n         Purchased ............ x " + answer.quantity +
                            "\n\n         ...Payment approved..." +
                            "\n         ...Total price: $ " + chalk.yellow.underline(totalPrice.toFixed(2)) +
                            "\n         Print Time: " + moment().format() +
                            "\n\n         Thank you for shopping at Bamazon!\n\n" +
                            "       ...........................................\n\n")

                        // ============= 4 Update database (product_sales) INVISIBLE!! =============
                        let totalSales = response[0].product_sales + totalPrice
                        connection.query("UPDATE products SET ? WHERE ?", [{ product_sales: totalSales }, { item_id: answer.id }],
                            function (err, sales) { if (err) { throw err; }; }
                        );

                        return customer();
                    }
                );
            }
        });
    });
}