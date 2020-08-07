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

app.post("/products", function (req, res) {
    const { product_name, unit_price, supplier_id} = req.body;
    if (!Number.isInteger(unit_price) || unit_price <= 0) {
        return res.status(400).send("The price should be an Integer and greater than 0");
    }
pool
    .query('SELECT * FROM suppliers WHERE suppliers.id=$1', [supplier_id])
    .then((result) => {
        if (result.rows.length > 0) {
            pool
            .query('INSERT INTO products (product_name, unit_price, supplier_id) VALUES ($1,$2,$3)', [product_name, unit_price, supplier_id])
            .then(result => res.status(201).send("Product Created :) ..!"))
            .catch(error => {
                console.log(error)
                res.status(500).send("something went wrong :(..");
            })      
        } else {
            return res.status(400).send("The Id Supplier does not exist! :( ..") 

    }});
});

app.post("/customers/:customerId/orders", function (req,res) {
    const {order_date, order_reference} = req.body;
    const customerId = req.params.customerId;
    pool
    .query('SELECT * FROM customers WHERE customers.id=$1', [customerId])
    .then((result) => {
        if (result.rows.length > 0) {
            pool
            .query("INSERT INTO orders (order_date, order_reference, customer_id) VALUES ($1,$2,$3)", [order_date, order_reference, customerId])
            .then(result => res.status(201).send("Order Created :) ..!"))
            .catch(error => {
                console.log(error)
                res.status(500).send("something went wrong :(..");
            })    
        } else {
            return res.status(400).send("The Id customer does not exist! :( ..") 

        }});
    
});

app.put("/customers/:customerId", function (req,res) {
    const {newName, newAddress, newCity, newCountry} = req.body;
    const customerId = req.params.customerId;
    pool
    .query("UPDATE customers SET name=$1, address=$2, city=$3, country=$4 WHERE id=$5", [newName, newAddress, newCity, newCountry, customerId])
    .then(() => res.send(`Customer ${customerId} Update!`))
    .catch((e) => console.error(e));
});

//DELETE FROM ID
app.delete("/orders/:orderId", function (req,res) {
    const orderId = req.params.orderId;
    let query = 'DELETE FROM order_items WHERE order_id=$1';
    pool
    .query(query, [orderId])
    .then(() => {
        pool
        .query('DELETE FROM orders WHERE id=$1', [orderId])
        .then(() => res.send(`Order ${orderId} Deleted`))
        .catch((e) => console.error(e));
    })
    .catch(error => {
        console.log(error);
        res.status(500).send("something went wrong :(..")
    });
});

app.delete("/customers/:customersId", function (req,res) {
    let customerId = req.params.customerId;

    pool
    .query("SELECT * FROM orders WHERE customer_id=$1", [customerId])
    .then((result) => {
        if(result.rows.length <= 0) {
            pool
            .query('DELETE FROM customers WHERE id=$1', [customerId])
            .then(result => res.status(201).send(`Customer ${customerId} was Deleted !`))
            .catch(error => {
                console.log(error)
                res.status(500).send("error my friend");
            })
            
        } else {
            return res.status(400).send("The Customers has Orders, can not be deleted!");
        }
    });
});






app.get("/customers/:customerId/orders", function (req, res) {
    const customerId = req.params.customerId;
    const query = `SELECT 
    customers.name,
    orders.order_reference,
    orders.order_date,
    products.product_name,
    products.unit_price,
    suppliers.supplier_name,
    suppliers.country,
    order_items.quantity
    FROM customers
    INNER JOIN orders ON customer_id = customers.id
    INNER JOIN order_items ON order_id = orders.id
    INNER JOIN products ON products.id = order_items.product_id
    INNER JOIN suppliers ON suppliers.id = products.supplier_id
    WHERE customers.id = $1`;

    pool
        .query(query, [customerId])
        .then(result => res.json(result.rows))
        .catch((e) => console.error(e));
});




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