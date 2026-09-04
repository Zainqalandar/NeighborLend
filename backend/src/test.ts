

const obj: { [key: string]: string | number } = {
  "owner": "64b8f1e5c9e7f2a1b2c3d4e5",
  "title": "Sample Item",
  "description": "This is a sample item description.",
  "category": "Electronics",
  "imageUrl": "http://example.com/image.jpg",
  "status": "available"
};

console.log(Object.keys(obj).length); // Output: 6

const updatedItem = new Item.findOneAndUpdate(
    { _id: "64b8f1e5c9e7f2a1b2c3d4e5" },
    { $set: { title: "Updated Item" } },
    { new: true }
);