# MPesa Daraja API Integration

This project demonstrates the integration of the [MPesa Daraja API](https://developer.safaricom.co.ke/daraja/apis/post/safaricom-sandbox) for seamless mobile payments. It provides functionality to send payment requests, query transaction status, and receive real-time payment notifications.

## Features

- **STK Push**: Initiate payment requests to customers via the MPesa STK Push feature.
- **Transaction Status**: Query the status of a particular MPesa transaction.
- **Real-time Payment Notifications**: Receive instant feedback when payments are successfully processed.
- **Secure API Communication**: Utilizes secure OAuth 2.0 tokens for all API interactions.

## Prerequisites

Before running this project, ensure you have the following set up:

1. **MPesa Developer Account**: Sign up for the [MPesa Daraja API](https://developer.safaricom.co.ke/daraja/apis/post/safaricom-sandbox) and get your API keys.
2. **Node.js**: Install [Node.js](https://nodejs.org/) to manage server-side code.
3. **Ngrok (Optional)**: Use [Ngrok](https://ngrok.com/) for local development to expose your localhost to receive real-time payment notifications from MPesa.

## Installation

1. Clone the repository:
   `bash
   git clone https://github.com/yourusername/mpesa-daraja-app.git
   cd mpesa-daraja-app
   `

2. Install dependencies:
   `bash
   npm install
   `

3. Create a `.env` file in the root directory and add the following:

   `
   CONSUMER_KEY=<your_consumer_key>
   CONSUMER_SECRET=<your_consumer_secret>
   SHORTCODE=<your_shortcode>
   PASSKEY=<your_lipa_na_mpesa_online_passkey>
   CALLBACK_URL=<your_callback_url>
   `

4. Start the server:
   `bash
   npm start
   `

## Usage

### Initiate Payment Request

1. Open your browser or API client like Postman.
2. Send a POST request to `http://localhost:3000/stkpush` with the following payload:
   `json
   {
     "phoneNumber": "2547XXXXXXXX",
     "amount": 100
   }
   `

3. The user will receive a payment prompt on their phone to enter their MPesa PIN and complete the payment.

### Query Transaction Status

1. Send a POST request to `http://localhost:3000/transactionstatus` with the transaction ID you want to query:
   `json
   {
     "transactionId": "xxxxxxxxxx"
   }
   `

## Environment Variables

Ensure you have the following environment variables set in your `.env` file:

- `CONSUMER_KEY`: Your MPesa consumer key from the developer portal.
- `CONSUMER_SECRET`: Your MPesa consumer secret.
- `SHORTCODE`: Your business short code registered with MPesa.
- `PASSKEY`: The Lipa na MPesa online passkey from the developer portal.
- `CALLBACK_URL`: The URL to receive real-time notifications from MPesa.

## API Endpoints

- `POST /stkpush`: Initiates an MPesa STK Push request.
- `POST /transactionstatus`: Queries the status of a transaction.

## Built With

- **Node.js**: Server-side runtime for handling API requests.
- **Express.js**: Web framework for building the API endpoints.
- **Axios**: HTTP client for sending API requests to MPesa.
- **dotenv**: For managing environment variables.
- **Ngrok**: For exposing localhost in development to receive MPesa callbacks.
