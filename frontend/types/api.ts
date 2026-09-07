export type Person = {
  _id?: string;
  name?: string;
  email?: string;
};

export type Item = {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  status: "available" | "requested" | "borrowed";
  owner: Person | string;
  createdAt?: string;
};

export type BorrowRequest = {
  _id: string;
  item: Item | string;
  borrower: Person | string;
  owner: Person | string;
  status: "pending" | "approved" | "rejected" | "returned";
  requestDate?: string;
  approvedDate?: string;
  dueDate?: string;
  returnedDate?: string;
};

export function getPersonName(person: Person | string): string {
  if (typeof person === "string") return person;
  return person.name || person.email || "Neighbor";
}

export function getItemTitle(item: Item | string): string {
  if (typeof item === "string") return "Item";
  return item.title;
}
