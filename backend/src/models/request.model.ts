import mongoose, { Schema, Document } from 'mongoose'

interface IRequest extends Document {
  item: mongoose.Schema.Types.ObjectId;
  borrower: mongoose.Schema.Types.ObjectId;
  owner: mongoose.Schema.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  requestDate?: Date;
  approvedDate?: Date;
  dueDate?: Date; // return deadline
  returnedDate?: Date;
  reminderSent?: boolean;
}

const requestSchema = new Schema<IRequest>(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned"],
      default: "pending",
    },
    requestDate: Date,
    approvedDate: Date,
    dueDate: Date, // return deadline
    returnedDate: Date,
    reminderSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Request = mongoose.model<IRequest>("Request", requestSchema);
export default Request;
