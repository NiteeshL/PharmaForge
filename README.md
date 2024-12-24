# PharmaForge

## Overview
This project is a Pharmacy Management System that allows customers and employees to manage pharmacy-related activities such as logging in, viewing drug details, placing orders, submitting feedback, and more. The system is built using Node.js, Express.js, and MySQL.

## Features
- Customer and Employee login
- Customer sign-up
- View drug details
- Place orders
- Submit feedback and queries
- View customer and order details
- Delete customer account

## Prerequisites
- Node.js
- MySQL

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NiteeshL/PharmaForge
   cd PharmaForge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the MySQL database:**
   - Create a MySQL database named `pharmacy`.
   - Import the SQL script from `sql.txt` to create the necessary tables and insert initial data.

4. **Configure the database connection:**
   - Update the MySQL connection details in `server.js`:
     ```javascript
     const connection = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: 'your-password',
       database: 'pharmacy'
     });
     ```

5. **Start the server:**
   ```bash
   node server.js
   ```

6. **Access the application:**
   - Open a web browser and navigate to `http://localhost:3000`.

## Project Structure
```
/DBMS
├── public
│   ├── customer.html
│   ├── login.html
│   ├── query.html
│   ├── view.html
│   ├── styles.css
├── server.js
├── sql.txt
└── README.md
```

## API Endpoints

### Authentication
- **POST /login**: Handle login for both customers and employees.

### Customer
- **GET /getCustomerDetails**: Fetch customer details.
- **POST /signup**: Handle customer sign-up.
- **POST /deleteAccount**: Delete customer account.

### Orders
- **GET /getOrderDetails**: Fetch order details for a customer.
- **POST /submitOrder**: Submit a new order.
- **GET /getAllOrders**: Fetch all order details.

### Drugs
- **GET /getDrugDetails**: Fetch all drug details.
- **POST /addDrug**: Add a new drug.
- **POST /removeDrug**: Remove a drug.
- **POST /subtractQuantity**: Subtract quantity from a drug.

### Feedback and Queries
- **POST /submitFeedback**: Submit feedback.
- **GET /getFeedback**: Fetch all feedback.
- **POST /submitQuery**: Submit a query.
- **GET /getQuery**: Fetch all queries.

### Contact
- **GET /getContactDetails**: Fetch contact details.

## License
This project is licensed under the MIT License.
