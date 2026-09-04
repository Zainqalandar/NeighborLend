import mongoose, { Schema, Document } from 'mongoose'

interface IItem extends Document {
  owner: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  status: 'available' | 'requested' | 'borrowed';
}

const ItemSchema = new Schema<IItem>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    description: String,
    category: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ["available", "requested", "borrowed"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

const Item = mongoose.model<IItem>("Item", ItemSchema);
export default Item;
