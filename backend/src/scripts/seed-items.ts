import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../configs/db";
import Item from "../models/item.model";
import User from "../models/user.model";
import { demoItems } from "../data/demo-items";

const seedItems = async () => {
  await connectDB();

  const owner = await User.findOne().sort({ createdAt: 1 });
  if (!owner) {
    throw new Error("Create at least one user through /api/auth/register before seeding items");
  }

  const existingItems = await Item.countDocuments({ owner: owner._id });
  if (existingItems > 0) {
    console.log("Seed skipped: this user already has items");
    return;
  }

  await Item.insertMany(demoItems.map((item) => ({
    ...item,
    owner: owner._id,
  })));

  console.log(`${demoItems.length} demo items created for ${owner.email}`);
};

seedItems()
  .catch((error) => {
    console.error("Item seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
