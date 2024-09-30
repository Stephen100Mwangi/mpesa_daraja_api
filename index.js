import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import mongoose from 'mongoose';
import PaymentModel from './models/Payments.js';

const mpesaApp = express();
dotenv.config();

mpesaApp.use(cors());
mpesaApp.use(express.json()); // Accept JSON
mpesaApp.use(express.urlencoded({ extended: true })); // Form

const port = process.env.PORT;
const callback = process.env.PAYMENT_STATUS;

let token = '';

// Connect to mongoose
mongoose.connect(process.env.MONGO_URL).then(()=>{
  console.log("Mongoose connected to database successfully");
}).catch((error)=>{
  console.log("Error connecting to MongoDB "+ error);
  
})

mpesaApp.listen(port, () => {
  console.log(
    `Welcome to Mpesa App. App running well on http://localhost:${port}`
  );
});

mpesaApp.get('/', (req, res) => {
  return res.status(200).send('Welcome to MPESA');
});

mpesaApp.get('/token', (req, res) => {
  generateToken(req, res);
});

const generateToken = async (req, res, next) => {
  // Generate a new token each time we are paying

  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;

  const auth = process.env.AUTH;

  await axios
    .get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization:`Basic ${auth}`,
        },
      }
    )
    .then((resp) => {
      console.log(resp.data);
      token = resp.data.access_token;
      next();
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ message: 'Error generating token' });
    });
};

// Routes
mpesaApp.post('/stkPush', generateToken, async (req, res) => {
  const phone = req.body.phone?.substring(1);
  const amount = req.body.amount;

  if (!phone || !amount) {
    return res.status(400).send('All fields must be provided');
  }

  const date = new Date();

  const timeStamp =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) + // Add 1 to month since months are zero-indexed
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);

  console.log(timeStamp); // Outputs something like 20240809123045 (YYYYMMDDHHmmss)

  const shortCode = process.env.SHORT_CODE;
  const passKey = process.env.PASS_KEY;
  const password = new Buffer.from(shortCode + passKey + timeStamp).toString(
    'base64'
  );

  // Send phone and amount to mpesa

  await axios
    .post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: '174379', // Paybill if you use Till replace BusinessShortCode with store number
        Password: password,
        Timestamp: timeStamp,
        TransactionType: 'CustomerPayBillOnline', // If you intend to use Till then replace TransactionType with CustomerBuyGoodsOnline
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: '174379',
        PhoneNumber: `254${phone}`,
        // CallBackURL: 'https://mydomain.com/callback',  // Payment status
        CallBackURL: `https://80a0-102-215-32-244.ngrok-free.app/${callback}`,  // Payment status
        // https://4180-102-215-32-244.ngrok-free.app
        AccountReference: `254${phone}`,
        TransactionDesc: 'Test',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((data) => {
      return res.status(200).send(data.data);
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ message: 'Error sending money' });
    });
});


// Listen on payment status


mpesaApp.post(`/${callback}`, async (req,res)=>{
  const callbackData = req.body; // What Safaricom sends on payment
  console.log(callbackData);

  if(callbackData.Body.stkCallback){
    console.log("Request made");
    console.log(callbackData.Body.stkCallback);

    if (!callbackData.Body.stkCallback.CallbackMetadata) {
      console.log ('Transaction Not Successful');
      return res.json("ok");
    } else {
      console.log (callbackData.Body.stkCallback.CallbackMetadata);

      const amount = callbackData.Body.stkCallback.CallbackMetadata.Item[0].Value;
      const transactionID = callbackData.Body.stkCallback.CallbackMetadata.Item[1].Value;
      const transactionTime = callbackData.Body.stkCallback.CallbackMetadata.Item[3].Value;
      const phone = callbackData.Body.stkCallback.CallbackMetadata.Item[4].Value;

      const newPayment = new PaymentModel ({
        phone,
        amount,
        paymentTime: transactionTime, // Use the correct transactionTime variable
        paymentID: transactionID, // Use the correct transactionID variable
      });

     

      await newPayment.save().then(data=>{
        console.log(data);
        console.log("Data saved successfully");
      }).catch(error=>{
        console.log(error);
        return;
      })
    }
  }
    
  
})
