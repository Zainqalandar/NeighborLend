"use client";

import Link from "next/link";
import React from "react";
import api from "@/utils/axiosInstance";
import { getApiErrorMessage } from "@/utils/api-error";
import { hasAuthToken, subscribeToAuthChanges } from "@/utils/auth";
import type { Item } from "@/types/api";
import { useNotification } from "@/context/notification-context";
import { useSyncExternalStore } from "react";

type ItemForm = {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
};

const emptyForm: ItemForm = {
  title: "",
  description: "",
  category: "",
  imageUrl: "",
};

export default function ItemsPage() {
  const { error: notifyError, success } = useNotification();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthChanges,
    hasAuthToken,
    () => false,
  );
  const [items, setItems] = React.useState<Item[]>([]);
  const [myItems, setMyItems] = React.useState<Item[]>([]);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [form, setForm] = React.useState<ItemForm>(emptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/items", {
        params: { search: search || undefined, category: category || undefined, limit: 50 },
      });
      setItems(response.data?.data ?? []);
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not load items."));
    } finally {
      setLoading(false);
    }
  }, [category, notifyError, search]);

  const loadMyItems = React.useCallback(async () => {
    if (!isAuthenticated) {
      setMyItems([]);
      return;
    }

    try {
      const response = await api.get("/items/mine");
      setMyItems(response.data?.data ?? []);
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not load your items."));
    }
  }, [isAuthenticated, notifyError]);

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  React.useEffect(() => {
    void loadMyItems();
  }, [loadMyItems]);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmitItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, form);
        success("Item updated successfully.");
      } else {
        await api.post("/items", form);
        success("Item listed successfully.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await Promise.all([loadItems(), loadMyItems()]);
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not save this item."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/items/${itemId}`);
      success("Item deleted successfully.");
      await Promise.all([loadItems(), loadMyItems()]);
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not delete this item."));
    }
  };

  const handleRequest = async (itemId: string) => {
    try {
      await api.post("/requests", { itemId });
      success("Borrow request sent successfully.");
      await loadItems();
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not send borrow request."));
    }
  };

  const handleEnhance = async () => {
    if (!form.description.trim()) {
      notifyError("Add a description first.");
      return;
    }
    try {
      const response = await api.post("/items/ai-enhance", { description: form.description });
      setForm((previous) => ({
        ...previous,
        description: response.data?.data?.enhancedDescription || previous.description,
      }));
      success("Description enhanced.");
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not enhance the description."));
    }
  };

  const startEditing = (item: Item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="flex-1 bg-[#f8faf5] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">Community marketplace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#163d31]">Find useful things nearby</h1>
            <p className="mt-3 max-w-2xl text-[#708178]">Browse items shared by your neighbors or list something you are happy to lend.</p>
          </div>
          {isAuthenticated ? <Link href="/requests" className="rounded-full bg-[#185c46] px-5 py-3 text-center text-sm font-semibold text-white">View my requests</Link> : <Link href="/signin" className="rounded-full bg-[#185c46] px-5 py-3 text-center text-sm font-semibold text-white">Sign in to borrow</Link>}
        </div>

        {isAuthenticated && (
          <section className="mt-10 rounded-3xl border border-[#dfe8df] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#e86e43]">{editingId ? "Edit item" : "List an item"}</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#163d31]">Share something useful</h2>
              </div>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-sm font-semibold text-[#185c46]">Cancel edit</button>}
            </div>
            <form onSubmit={handleSubmitItem} className="mt-5 grid gap-4 md:grid-cols-2">
              <input required name="title" value={form.title} onChange={handleFormChange} placeholder="Item title" className="h-12 rounded-xl border border-[#d6e1d8] px-4 outline-none focus:border-[#185c46]" />
              <input required name="category" value={form.category} onChange={handleFormChange} placeholder="Category (e.g. Electronics)" className="h-12 rounded-xl border border-[#d6e1d8] px-4 outline-none focus:border-[#185c46]" />
              <input required type="url" name="imageUrl" value={form.imageUrl} onChange={handleFormChange} placeholder="Image URL" className="h-12 rounded-xl border border-[#d6e1d8] px-4 outline-none focus:border-[#185c46] md:col-span-2" />
              <div className="md:col-span-2">
                <textarea required name="description" value={form.description} onChange={handleFormChange} placeholder="Describe the item" rows={4} className="w-full rounded-xl border border-[#d6e1d8] px-4 py-3 outline-none focus:border-[#185c46]" />
                <button type="button" onClick={handleEnhance} className="mt-2 text-sm font-semibold text-[#e86e43]">✨ Auto-enhance description</button>
              </div>
              <button disabled={saving} type="submit" className="h-12 rounded-xl bg-[#185c46] text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">{saving ? "Saving..." : editingId ? "Update item" : "List item"}</button>
            </form>
          </section>
        )}

        <section className="mt-10">
          <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="flex flex-col gap-3 sm:flex-row">
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search items..." className="h-12 flex-1 rounded-xl border border-[#d6e1d8] bg-white px-4 outline-none focus:border-[#185c46]" />
            <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Filter category" className="h-12 rounded-xl border border-[#d6e1d8] bg-white px-4 outline-none focus:border-[#185c46] sm:w-56" />
            <button type="submit" className="h-12 rounded-xl bg-[#e86e43] px-6 text-sm font-semibold text-white">Search</button>
          </form>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? <p className="text-[#708178]">Loading items...</p> : items.length === 0 ? <p className="text-[#708178]">No items found.</p> : items.map((item) => (
              <article key={item._id} className="overflow-hidden rounded-3xl border border-[#e0e8df] bg-white shadow-sm">
                <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#e86e43]">{item.category}</p><span className="rounded-full bg-[#eff7e2] px-2.5 py-1 text-xs font-semibold text-[#47705d]">{item.status}</span></div>
                  <h2 className="mt-2 text-xl font-semibold text-[#163d31]">{item.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#708178]">{item.description}</p>
                  <button disabled={!isAuthenticated || item.status !== "available"} onClick={() => void handleRequest(item._id)} className="mt-5 h-10 w-full rounded-xl bg-[#185c46] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#c9d6cc]">{!isAuthenticated ? "Sign in to request" : item.status === "available" ? "Request to borrow" : "Currently unavailable"}</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {isAuthenticated && myItems.length > 0 && (
          <section className="mt-14 rounded-3xl border border-[#dfe8df] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#163d31]">Your listed items</h2>
            <div className="mt-5 divide-y divide-[#edf0e9]">
              {myItems.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold text-[#285347]">{item.title}</p><p className="text-sm text-[#708178]">{item.category} · {item.status}</p></div><div className="flex gap-2"><button type="button" onClick={() => startEditing(item)} className="rounded-lg border border-[#cddbd0] px-3 py-2 text-sm font-semibold text-[#285347]">Edit</button><button type="button" onClick={() => void handleDelete(item._id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Delete</button></div></div>)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
