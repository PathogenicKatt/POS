# 🛒 Mooi Mart POS

A simple Point of Sale (POS) system for Mooi Mart, Potchefstroom, South Africa.

## ✨ Features

- Product browsing by category (General, Butchery, Deli, Bakery)
- Add products to cart and manage quantities
- Calculate subtotal, VAT (15%), and total
- Multiple payment methods (Cash, Card, EFT)
- Complete sale and generate receipt
- View sales reports

## 🚀 Getting Started

### 🧰 Prerequisites

- Node.js (for backend)
- Oracle Database (or Oracle XE)
- Oracle Instant Client (for Node.js OracleDB driver)

### 🛠️ Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/PathogenicKatt/POS.git
    cd POS
    ```

2. Install backend dependencies:
    ```bash
    cd backend
    npm install
    ```

3. Configure your Oracle database connection in `backend/.env`:
    ```
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_CONN_STRING=//localhost:1521/XE
    ```

4. Start the backend server:
    ```bash
    node server.js
    ```

5. Open `index.html` in your browser to use the POS system.


## 🖱️ Usage

- Select products and add them to the cart.
- Choose a payment method.
- Click **Complete Sale (F1)** to process the sale.
- View reports by clicking **Go to Reports**.

## 🛠️ Troubleshooting

- Make sure, you have data in your database(ORACLE), otherwise it will not render any data.
- Ensure your backend server is running and accessible at `http://localhost:3000`.
- Make sure your Oracle database is running and credentials are correct.
- Check the browser console for errors if something is not working.

## 📄 License

This project is for academic purposes.