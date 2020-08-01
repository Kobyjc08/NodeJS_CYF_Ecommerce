const express = require("express");
const app = express();
const port = 3001
const { Pool } = require('pg');
const bodyParser = require("body-parser");


const pool = new Pool({
    user: 'JorgeMarioCobo',
    host: 'localhost',
    database: 'cyf_ecommerce',
    password: '123',
    port: 5432
});

app.use(bodyParser.json());

app.get("/customers", function(req, res) {
    pool.query('SELECT * FROM customers', (error, result) => {
        res.json(result.rows);
    });
});

app.get("/suppliers", function(req, res) {
    pool.query('SELECT * FROM suppliers', (error, result) => {
        res.json(result.rows);
    });
});

app.get("/products/:productName", function(req, res) {
    const nameProduct = req.params.productName;
    pool
    .query("SELECT p.product_name , s.supplier_name FROM products p inner Join suppliers s on p.supplier_id=s.id WHERE p.product_name like $1",["%" + nameProduct + "%"])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/customer/:customerId", function(req, res) {
    const customerId = req.params.customerId;
    pool
    .query("SELECT * FROM customers WHERE customers.id = $1",[customerId])
    .then(result => {
        if(result.rowCount > 0) {
            return res.json(result.rows[0]);
        } else {
            return res.status(400).send(`customer with Id = ${customerId} NOT FOUND`)
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).send("something went wrong :( ...");
    });
});


////POST A NEW CUSTOMER


app.post("/customers", function (req,res) {
  const { name, address, city, country} = req.body;
 
  pool
      .query('INSERT INTO customers (name, address, city, country) VALUES ($1, $2, $3, $4)', [name, address, city, country])
      .then(result => res.status(201).send("Customer Created:) !"))
      .catch(error => {
          console.log(error)
          res.status(500).send("Something Went Wrong :( ...");
      });
});

app.post






app.listen(port, function() {
    console.log("Server is listening on port 3001. Ready to accept requests!");
});



/*
## Task

- Create a new NodeJS application called `cyf-ecommerce-api`
- Add Express and node-postgres and make sure you can start the server with `node server.js`
- Add a new GET endpoint `/customers` to load all the customers from the database
- Add a new GET endpoint `/suppliers` to load all the suppliers from the database
- (STRETCH GOAL) Add a new GET endpoint `/products` to load all the product names along with their supplier names.
*/