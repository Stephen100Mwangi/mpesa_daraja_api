import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema (
  {
    phone: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    paymentTime: {
      type: String,
      required: true,
    },
    paymentID: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel = mongoose.model ('Payment', PaymentSchema);
export default PaymentModel;
