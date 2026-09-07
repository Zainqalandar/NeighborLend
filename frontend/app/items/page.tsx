"use client";

import Link from "next/link";
import React from "react";
import api from "@/utils/axiosInstance";
import { getApiErrorMessage } from "@/utils/api-error";
import { hasAuthToken, subscribeToAuthChanges } from "@/utils/auth";
import { getPersonName, type Item } from "@/types/api";
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
  const [categoryReady, setCategoryReady] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [form, setForm] = React.useState<ItemForm>(emptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [enhancing, setEnhancing] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/items", {
        params: { search: search || undefined, category: category || undefined, page, limit: 6 },
      });
      setItems(response.data?.data ?? []);
      setTotalPages(Math.max(response.data?.pagination?.totalPages ?? 1, 1));
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not load items."));
    } finally {
      setLoading(false);
    }
  }, [category, notifyError, page, search]);

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
    if (!categoryReady) return;
    void loadItems();
  }, [categoryReady, loadItems]);

  React.useEffect(() => {
    const categoryFromUrl = new URLSearchParams(window.location.search).get("category")?.trim();
    setCategory(categoryFromUrl || "");
    setPage(1);
    setCategoryReady(true);
  }, []);

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
      setIsFormOpen(false);
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
    setEnhancing(true);
    try {
      const response = await api.post("/items/ai-enhance", { description: form.description });
      setForm((previous) => ({
        ...previous,
        description: response.data?.data?.enhancedDescription || previous.description,
      }));
      success("Description enhanced.");
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not enhance the description."));
    } finally {
      setEnhancing(false);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEnhancing(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setEnhancing(false);
  };

  React.useEffect(() => {
    if (!isFormOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeForm();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFormOpen, saving]);

  const startEditing = (item: Item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
    });
    setEnhancing(false);
    setIsFormOpen(true);
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
          {isAuthenticated ? (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={openCreateForm} className="rounded-full bg-[#e86e43] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#d95f36]">+ List an item</button>
              <Link href="/requests" className="rounded-full bg-[#185c46] px-5 py-3 text-center text-sm font-semibold text-white">View my requests</Link>
            </div>
          ) : <Link href="/signin" className="rounded-full bg-[#185c46] px-5 py-3 text-center text-sm font-semibold text-white">Sign in to borrow</Link>}
        </div>

        {isAuthenticated && isFormOpen && (
          <div role="dialog" aria-modal="true" aria-labelledby="item-form-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-[#163d31]/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
            <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#dfe8df] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#e86e43]">{editingId ? "Edit item" : "List an item"}</p>
                  <h2 id="item-form-title" className="mt-2 text-2xl font-semibold text-[#163d31]">{editingId ? "Update your item" : "Share something useful"}</h2>
                </div>
                <button type="button" onClick={closeForm} disabled={saving} aria-label="Close form" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f7e8] text-xl text-[#285347] transition hover:bg-[#e4f1cb] disabled:cursor-not-allowed disabled:opacity-50">×</button>
              </div>
            <form onSubmit={handleSubmitItem} className="mt-5 grid gap-4 md:grid-cols-2">
              <input required name="title" value={form.title} onChange={handleFormChange} placeholder="Item title" className="h-12 rounded-xl border border-[#d6e1d8] px-4 outline-none focus:border-[#185c46]" />
              <input required name="category" value={form.category} onChange={handleFormChange} placeholder="Category (e.g. Electronics)" className="h-12 rounded-xl border border-[#d6e1d8] px-4 outline-none focus:border-[#185c46]" />
              <input required type="url" name="imageUrl" value={form.imageUrl} onChange={handleFormChange} placeholder="Image URL" className="h-12 rounded-xl border border-[#d6e1d8] px-4 outline-none focus:border-[#185c46] md:col-span-2" />
              <div className="md:col-span-2">
                <textarea required name="description" value={form.description} onChange={handleFormChange} placeholder="Describe the item" rows={4} className="w-full rounded-xl border border-[#d6e1d8] px-4 py-3 outline-none focus:border-[#185c46]" />
                <button type="button" onClick={handleEnhance} disabled={enhancing} aria-busy={enhancing} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#e86e43] disabled:cursor-not-allowed disabled:opacity-60">
                  {enhancing && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e86e43]/30 border-t-[#e86e43]" aria-hidden="true" />}
                  {enhancing ? "Enhancing..." : "✨ Auto-enhance description"}
                </button>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} disabled={saving} className="h-12 rounded-xl border border-[#cddbd0] px-5 text-sm font-semibold text-[#285347] transition hover:bg-[#f5faef] disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                <button disabled={saving} type="submit" className="h-12 rounded-xl cursor-pointer bg-[#185c46] px-5 text-sm font-semibold text-white transition hover:bg-[#124a38] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update item" : "List item"}</button>
              </div>
            </form>
            </section>
          </div>
        )}

        <section className="mt-10">
          <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); setPage(1); }} className="flex flex-col gap-3 sm:flex-row">
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search items..." className="h-12 flex-1 rounded-xl border border-[#d6e1d8] bg-white px-4 outline-none focus:border-[#185c46]" />
            <input value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} placeholder="Filter category" className="h-12 rounded-xl border border-[#d6e1d8] bg-white px-4 outline-none focus:border-[#185c46] sm:w-56" />
            <button type="submit" className="h-12 rounded-xl bg-[#e86e43] px-6 text-sm font-semibold text-white cursor-pointer">Search</button>
          </form>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? <p className="text-[#708178]">Loading items...</p> : items.length === 0 ? <p className="text-[#708178]">No items found.</p> : items.map((item) => (
              <article key={item._id} className="overflow-hidden rounded-3xl border border-[#e0e8df] bg-white shadow-sm">
                <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#e86e43]">{item.category}</p><span className="rounded-full bg-[#eff7e2] px-2.5 py-1 text-xs font-semibold text-[#47705d]">{item.status}</span></div>
                  <h2 className="mt-2 text-xl font-semibold text-[#163d31]">{item.title}</h2>
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcece7] text-sm font-bold text-[#185c46]">{getPersonName(item.owner).charAt(0).toUpperCase()}</span>
                    <div>
                      <p className="text-xs text-[#708178]">Created by</p>
                      <p className="text-sm font-semibold text-[#285347]">{getPersonName(item.owner)}</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#708178]">{item.description}</p>
                  {(() => {
                    const isOwnItem = myItems.some((myItem) => myItem._id === item._id);
                    return <button disabled={isOwnItem || !isAuthenticated || item.status !== "available"} onClick={() => void handleRequest(item._id)} className="mt-5 h-10 w-full cursor-pointer rounded-xl bg-[#185c46] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#c9d6cc]">{isOwnItem ? "Your Item" : !isAuthenticated ? "Sign in to request" : item.status === "available" ? "Request to borrow" : "Currently unavailable"}</button>;
                  })()}
                </div>
              </article>
            ))}
          </div>

          {!loading && items.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button type="button" disabled={page === 1} onClick={() => setPage((currentPage) => currentPage - 1)} className="rounded-xl border border-[#cddbd0] px-4 py-2 text-sm font-semibold text-[#285347] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <span className="text-sm font-semibold text-[#708178]">Page {page} of {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((currentPage) => currentPage + 1)} className="rounded-xl border border-[#cddbd0] px-4 py-2 text-sm font-semibold text-[#285347] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          )}
        </section>

        {isAuthenticated && myItems.length > 0 && (
          <section className="mt-14 rounded-3xl border border-[#dfe8df] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#163d31]">Your listed items</h2>
            <div className="mt-5 divide-y divide-[#edf0e9]">
              {myItems.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold text-[#285347]">{item.title}</p><p className="text-sm text-[#708178]">{item.category} · {item.status}</p></div><div className="flex gap-2"><button type="button" onClick={() => startEditing(item)} className="rounded-lg border border-[#cddbd0] px-3 py-2 text-sm font-semibold text-[#285347] cursor-pointer">Edit</button><button type="button" onClick={() => void handleDelete(item._id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 cursor-pointer">Delete</button></div></div>)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
