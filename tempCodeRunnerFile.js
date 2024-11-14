const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0306',
  database: 'pharmacy'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
  console.log('Connected to the database');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle login POST request
app.post('/login', (req, res) => {
  console.log('Received login request:', req.body); // Log the entire request body

  // Check if the request contains the EmployeeID field
  if (req.body.EmployeeID) {
    const { EmployeeID, Password } = req.body;
    connection.query('SELECT * FROM emplogin WHERE Employee_ID = ? AND Password = ?', [EmployeeID, Password], (error, results) => {
      if (error) {
        console.error('Error querying emplogin:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      console.log('Query results:', results);

      if (results.length > 0) {
        // Pass EmployeeID as a query parameter in the redirect
        console.log('Redirecting to test.html with EmployeeID:', EmployeeID);
        return res.redirect(`/test.html?EmployeeID=${EmployeeID}`);
      } else {
        return res.status(401).json({ success: false, message: 'Incorrect employee ID or password' });
      }
    });
  } 
  // Check if the request contains the Username field
  else if (req.body.Username) {
    const { Username, Password } = req.body;
    connection.query('SELECT * FROM custlogin WHERE Username = ? AND Password = ?', [Username, Password], (error, results) => {
      if (error) {
        console.error('Error querying custlogin:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      console.log('Query results:', results);

      if (results.length > 0) {
        // Redirect to customer.html upon successful login
        console.log('Redirecting to customer.html with Username:', Username);
        return res.redirect(`/customer.html?Username=${Username}`);
      } else {
        return res.status(401).json({ success: false, message: 'Incorrect username or password' });
      }
    });
  } else {
    // Invalid login request
    return res.status(400).json({ success: false, message: 'Invalid login request' });
  }
});


// Handle GET request for test.html
app.get('/getCustomerDetails', (req, res) => {
  // Assuming username is passed as a query parameter
  const Username = req.query.Username;
  console.log('Username:',Username); // Add this line for debugging
  // Query to fetch customer details based on Username
  connection.query('SELECT Customer_name, Email_ID, Address, Phone FROM customer WHERE Username = ?', [Username], (error, results) => {
    if (error) {
      console.error('Error querying customer details:', error);
      return res.status(500).send('Internal server error');
    }
    console.log('Customer details:', results); // Add this line for debugging
    // Check if customer exists
    if (results.length === 0) {
      return res.status(404).send('Customer not found');
    }
    
    // Extract customer details
    const customer = {
      Customer_name: results[0].Customer_name,
      Email_ID: results[0].Email_ID,
      Address: results[0].Address,
      Phone: results[0].Phone
    };
    res.json(customer);
  });
});

// Handle GET request for order details
app.get('/getOrderDetails', (req, res) => {
  const Username = req.query.Username;
  console.log('Username:', Username);

  // Query to fetch all orders based on the provided Username
  connection.query('SELECT Order_ID, Items, Quantity, Amount, Total_price, Order_Placed, Expected_Delivery FROM orders WHERE Username = ?', [Username], (error, results) => {
    if (error) {
      console.error('Error querying order details:', error);
      return res.status(500).send('Internal server error');
    }
    console.log('Order details:', results);

    if (results.length === 0) {
      return res.status(404).send('No orders placed');
    }
    
    res.json(results); // Sending all orders associated with the provided Username
  });
});

// Handle POST request to delete account
app.post('/deleteAccount', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password are provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  // Delete the corresponding rows from the feedback table
  connection.query('DELETE FROM feedback WHERE Username = ?', [username], (error, feedbackResult) => {
    if (error) {
      console.error('Error deleting account feedback:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    // Delete the corresponding rows from the query table
    connection.query('DELETE FROM help WHERE Username = ?', [username], (error, queryResult) => {
      if (error) {
        console.error('Error deleting account queries:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      // Delete the corresponding row from the custlogin table
      connection.query('DELETE FROM custlogin WHERE Username = ? AND Password = ?', [username, password], (error, loginResult) => {
        if (error) {
          console.error('Error deleting account from custlogin:', error);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (loginResult.affectedRows === 0) {
          // If no rows were affected, it means the username/password combination is incorrect
          return res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }

        // Delete the corresponding row from the customer table
        connection.query('DELETE FROM customer WHERE Username = ?', [username], (error, customerResult) => {
          if (error) {
            console.error('Error deleting account from customer:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }

          // Delete the corresponding rows from the orders table
          connection.query('DELETE FROM orders WHERE Username = ?', [username], (error, ordersResult) => {
            if (error) {
              console.error('Error deleting account orders:', error);
              return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            // Send a success response if all deletions were successful
            return res.status(200).json({ success: true, message: 'Account deleted successfully' });
          });
        });
      });
    });
  });
});





// Handle GET request for test.html
app.get('/getEmployeeDetails', (req, res) => {
  // Assuming Employee_ID is passed as a query parameter
  const EmployeeID = req.query.EmployeeID;
  console.log('EmployeeID:',EmployeeID); // Add this line for debugging
  // Query to fetch employee details based on Employee_ID
  connection.query('SELECT Employee_ID, Employee_name, Email_ID, Phone FROM employee WHERE Employee_ID = ?', [EmployeeID], (error, results) => {
    if (error) {
      console.error('Error querying employee details:', error);
      return res.status(500).send('Internal server error');
    }
    console.log('Employee details:', results); // Add this line for debugging
    // Check if employee exists
    if (results.length === 0) {
      return res.status(404).send('Employee not found');
    }
    
    // Extract employee details
    const employee = {
      Employee_ID: results[0].Employee_ID,
      Employee_name: results[0].Employee_name,
      Email_ID: results[0].Email_ID,
      Phone: results[0].Phone
    };
    res.json(employee);
  });
});

// Handle POST request to add drug
app.post('/addDrug', (req, res) => {
  const { Drug_ID, Drug_name, Quantity, Price, Description, Expiry_date } = req.body;

  console.log('Adding drug:', { Drug_ID, Drug_name, Quantity, Price, Description, Expiry_date });

  connection.query('INSERT INTO drugs (Drug_ID, Drug_name, Quantity, Price, Description, Expiry_date) VALUES (?, ?, ?, ?, ?, ?)', 
    [Drug_ID, Drug_name, Quantity, Price, Description, Expiry_date], 
    (error, results) => {
      if (error) {
        console.error('Error adding drug:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      res.sendStatus(200); // Send success response
    });
});

// Handle POST request to remove drug
app.post('/removeDrug', (req, res) => {
  const { Drug_name } = req.body;
  console.log('Drug', Drug_name, 'was removed'); // Add this line for debugging
  connection.query('DELETE FROM drugs WHERE Drug_name = ?', [Drug_name], (error, results) => {
    if (error) {
      console.error('Error removing drug:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    if (results.affectedRows > 0) {
      // Drug was successfully removed
      res.json({ success: true });
    } else {
      // Drug with the specified name was not found
      res.json({ success: false });
    }
  });
});

// Handle customer sign up
app.post('/signup', (req, res) => {
  console.log('Received sign up request:', req.body); // Log the entire request body
  const { Username, Password, CustomerName, Email, Address, Phone } = req.body;

  // Insert customer details into the customer table
  connection.query('INSERT INTO customer (Username,Customer_name, Email_ID, Address, Phone) VALUES (?, ?, ?, ?,?)',
    [Username, CustomerName, Email, Address, Phone],
    (error, results) => {
      if (error) {
        console.error('Error inserting customer details:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      console.log('Customer details inserted successfully');

      // Insert username and password into custlogin table
      connection.query('INSERT INTO custlogin (Username, Password) VALUES (?, ?)',
        [Username, Password],
        (error, results) => {
          if (error) {
            console.error('Error inserting username and password into custlogin:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }

          console.log('Username and password inserted into custlogin table');
          return res.status(200).json({ success: true, message: 'Customer sign up successful' });
        });
    });
});

// Handle GET request to fetch drug details
app.get('/getDrugDetails', (req, res) => {
  // Query to fetch all drug details
  connection.query('SELECT * FROM drugs', (error, results) => {
    if (error) {
      console.error('Error querying drug details:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    // Check if any drugs were found
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No drugs found' });
    }

    // Send the drug details as JSON response
    res.json(results);
  });
});

// Handle POST request to submit order
app.post('/submitOrder', (req, res) => {
  const { items, quantity, username } = req.body;

  // Get today's date
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

  // Calculate expected delivery date (2 days from today)
  const expectedDelivery = new Date(today);
  expectedDelivery.setDate(today.getDate() + 2);
  const expectedDeliveryFormatted = expectedDelivery.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

  connection.query('SELECT Drug_ID, Price FROM drugs WHERE Drug_name = ?', [items], (error, results) => {
      if (error) {
          console.error('Error querying drug details:', error);
          return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Drug not found' });
      }
      const { Drug_ID, Price } = results[0];
      const orderData = [items, quantity, Price, Drug_ID, username, todayFormatted, expectedDeliveryFormatted];

      connection.query('INSERT INTO orders (Items, Quantity, Amount, Drug_ID, Username, Order_Placed, Expected_Delivery) VALUES (?, ?, ?, ?, ?, ?, ?)', orderData, (error, results) => {
          if (error) {
              console.error('Error inserting order details:', error);
              return res.status(500).json({ success: false, message: 'Internal server error' });
          }
          return res.status(200).json({ success: true, message: 'Order placed successfully' });
      });
  });
});

// Handle POST request to subtract quantity from drugs table
app.post('/subtractQuantity', (req, res) => {
  const { drugName, quantity } = req.body;
  console.log('Subtract quantity request:', req.body); // Log the request body
  connection.query('UPDATE drugs SET Quantity = Quantity - ? WHERE Drug_name = ?', [quantity, drugName], (error, results) => {
      if (error) {
          console.error('Error subtracting quantity from drugs:', error);
          return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      return res.status(200).json({ success: true, message: 'Quantity subtracted from drugs successfully' });
  });
});

// Route to fetch contact details
app.get('/getContactDetails', (req, res) => {
  // Query to select contact details from the contact table
  const query = 'SELECT Employee_name, Address, Phone FROM pharmacy';

  // Execute the query
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching contact details:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact details not found' });
    }

    // Send the retrieved contact details as JSON response
    res.status(200).json(results);
  });
});

app.post('/submitQuery', (req, res) => {
  const { query, username } = req.body;
  console.log('Question request:', req.body);
  // Insert query into the database table
  connection.query('INSERT INTO help (Username, Query) VALUES (?, ?)', [username, query], (error, results) => {
    if (error) {
      console.error('Error inserting query:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    return res.status(200).json({ success: true, message: 'Query submitted successfully' });
  });
});

app.get('/getFeedback', (req, res) => {
  connection.query('SELECT * FROM feedback', (error, results) => {
    if (error) {
      console.error('Error fetching feedback:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    return res.status(200).json(results);
  });
});

app.get('/getQuery', (req, res) => {
  connection.query('SELECT * FROM help', (error, results) => {
    if (error) {
      console.error('Error fetching queries:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    return res.status(200).json(results);
  });
});

app.post('/submitFeedback', (req, res) => {
  const { Username, feedback } = req.body;
  console.log('Submit feedback request:', req.body);
  // Check if both username and feedback are provided
  if (!Username || !feedback) {
    return res.status(400).json({ success: false, message: 'Username and feedback are required' });
  }

  // Insert the feedback into the feedback table
  connection.query('INSERT INTO feedback (Username, Response) VALUES (?, ?)', [Username, feedback], (error, results) => {
    if (error) {
      console.error('Error submitting feedback:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    return res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
  });
});

// Handle GET request to fetch all order details
app.get('/getAllOrders', (req, res) => {
  connection.query('SELECT * FROM orders', (error, results) => {
      if (error) {
          console.error('Error fetching all order details:', error);
          return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      return res.status(200).json(results);
  });
});

// Handle GET request to fetch all customer details
app.get('/getAllCustomers', (req, res) => {
  connection.query('SELECT * FROM customer', (error, results) => {
      if (error) {
          console.error('Error fetching all customer details:', error);
          return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      return res.status(200).json(results);
  });
});
