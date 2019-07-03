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
        + boxen("\n ✿ Welcome to ✿\n" + chalk.bold.white(data + "✿ "), { backgroundColor: "green", borderColor: "green", padding: 1, margin: 1, borderStyle: 'round' })
        + "    ✿                               ✿                     ✿ \n           ✿                    ✿")
    console.log(chalk.bold.green("\n                  - Supervisor Version -\n\r\n\r\n\r\n\r"))

    // ============= 2.connection MySql =============
    connection.connect(function (err) {
        if (err) { throw err };
        // console.log("connected as id: " + connection.threadId + "\n");
        supervisor();
    });
});

function supervisor() {
    inquirer.prompt({
        name: "customer",
        type: "list",
        message: "How may I serve you?",
        choices: ["[View Product Sales by Department]", "[Create New Department]", "[Exit]"]
    })
        .then(function (answer) {
            switch (answer.customer) {
                case "[View Product Sales by Department]":
                    viewDept();
                    break;
                case "[Create New Department]":
                    addDept();
                    break;
                case "[Exit]":
                    connection.end();
                    process.exit();
                    break;
            }
        });
}

// ============= 3 Read and Update data of departments table [over_head_costs, product_sales] =============
function viewDept() {
    // ============= 3.1 View every 'product_sales' of products table first!! Then sum values by department name!! =============
    connection.query("SELECT department_name, SUM (product_sales) as product_sales FROM products GROUP BY department_name",
        function (err, prod) {
            if (err) { throw err };
            // console.log(prod);

            // ============= 3.2 Update every 'product_sales' of departments table =============
            for (let j = 0; j < prod.length; j++) {
                connection.query("UPDATE departments SET ? WHERE ?",
                    [{ product_sales: prod[j].product_sales }, { department_name: prod[j].department_name }],
                    function (err, saleUpdate) {
                        if (err) { throw err; };
                        // console.log("departments table product_sales updated!");
                    }
                )
            };
            viewDeptUp();
        }
    )
}

// ============= 4 Read and Update data of departments table [total_profit (Won't be stored in MySql)] =============
function viewDeptUp() {
    // ============= 4.1 build a departments cli-table with head only =============
    let table = new Table({
        head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']
    });

    // ============= 4.2 Read departments table and Generate a temporary total_profit column (Won't be stored in MySql)
    connection.query("SELECT department_id, department_name, over_head_costs, product_sales, SUM (product_sales - over_head_costs) as total_profit FROM departments GROUP BY department_name",
        function (err, dept) {
            if (err) { throw err; };
            // console.log(dept);

            // ============= 4.3 loop departments data and push to the cli-table =============
            for (let i = 0; i < dept.length; i++) {
                let deptArr = [chalk.yellow(dept[i].department_id), dept[i].department_name, chalk.cyanBright(dept[i].over_head_costs), chalk.magentaBright(dept[i].product_sales), chalk.redBright(dept[i].total_profit)];
                table.push(deptArr);
                // console.log(deptArr);
            }
            console.log(chalk.red("\n\n\n\n                                  departments table\n") + table.toString() + "\n\n\n\n");
            return supervisor();
        }
    )
}

// ============= 5. Create data in the department table [department_id, department_name, over_head_costs] =============
function addDept() {
    inquirer.prompt([{
        name: "deptID",
        type: "input",
        message: "Please enter the New Department ID",
    }, {
        name: "deptName",
        type: "input",
        message: "Please enter the New Department Name",
    }, {
        name: "deptCosts",
        type: "input",
        message: "Please enter the Over Head Costs",
    }])
        .then(function (answer) {
            if (answer.deptID.length > 0 && answer.deptName.length > 0 && answer.deptCosts.length > 0) {
                connection.query("INSERT INTO departments SET ?",
                    {
                        department_id: answer.deptID,
                        department_name: answer.deptName,
                        over_head_costs: answer.deptCosts
                    }, function (err, res) {
                        if (err) { throw error };
                        console.log(chalk.green("\n\n       ➯ New Department has added.\n\n"));
                        return viewDept();
                    })
            } else {
                console.log(chalk.redBright("\n\n\n\n       ➯ Invalid information, please try again.\n\n\n\n"));
                return addDept();
            }
        })
}