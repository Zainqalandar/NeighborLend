"use client";

import Link from "next/link";
import React from "react";
import api from "@/utils/axiosInstance";
import { getApiErrorMessage } from "@/utils/api-error";
import { hasAuthToken, subscribeToAuthChanges } from "@/utils/auth";
import type { BorrowRequest } from "@/types/api";
import { getItemTitle, getPersonName } from "@/types/api";
import { useNotification } from "@/context/notification-context";
import { useSyncExternalStore } from "react";

export default function RequestsPage() {
  const { error: notifyError, success } = useNotification();
  const isAuthenticated = useSyncExternalStore(subscribeToAuthChanges, hasAuthToken, () => false);
  const [myRequests, setMyRequests] = React.useState<BorrowRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = React.useState<BorrowRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadRequests = React.useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const [mine, received] = await Promise.allSettled([
      api.get("/requests/my-requests"),
      api.get("/requests/received"),
    ]);

    if (mine.status === "fulfilled") setMyRequests(mine.value.data?.data ?? []);
    if (received.status === "fulfilled") setReceivedRequests(received.value.data?.data ?? []);
    if (mine.status === "rejected" && received.status === "rejected") {
      notifyError(getApiErrorMessage(mine.reason, "Could not load requests."));
    }
    setLoading(false);
  }, [isAuthenticated, notifyError]);

  React.useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateRequest = async (requestId: string, action: "approve" | "reject" | "return") => {
    try {
      await api.patch(`/requests/${requestId}/${action}`);
      success(`Request ${action === "return" ? "marked as returned" : `${action}d`} successfully.`);
      await loadRequests();
    } catch (error) {
      notifyError(getApiErrorMessage(error, "Could not update this request."));
    }
  };

  if (!isAuthenticated) {
    return <main className="flex flex-1 items-center justify-center px-5 py-20"><div className="text-center"><h1 className="text-3xl font-semibold text-[#163d31]">Sign in to view requests</h1><p className="mt-3 text-[#708178]">Track your borrow requests and manage requests for your items.</p><Link href="/signin" className="mt-6 inline-flex rounded-full bg-[#185c46] px-5 py-3 text-sm font-semibold text-white">Sign in</Link></div></main>;
  }

  return (
    <main className="flex-1 bg-[#f8faf5] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">Borrowing & lending</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#163d31]">Requests</h1>
        {loading ? <p className="mt-8 text-[#708178]">Loading requests...</p> : (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section className="rounded-3xl border border-[#dfe8df] bg-white p-6">
              <h2 className="text-2xl font-semibold text-[#163d31]">My borrow requests</h2>
              <div className="mt-5 space-y-3">
                {myRequests.length === 0 ? <p className="text-sm text-[#708178]">You have not requested anything yet.</p> : myRequests.map((request) => <div key={request._id} className="rounded-2xl border border-[#edf0e9] p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-[#285347]">{getItemTitle(request.item)}</p><span className="text-xs font-semibold uppercase text-[#e86e43]">{request.status}</span></div><p className="mt-2 text-sm text-[#708178]">Requested {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "recently"}</p>{request.status === "approved" && <button type="button" onClick={() => void updateRequest(request._id, "return")} className="mt-3 rounded-lg cursor-pointer bg-[#185c46] px-3 py-2 text-sm font-semibold text-white">Mark as returned</button>}</div>)}
              </div>
            </section>
            <section className="rounded-3xl border border-[#dfe8df] bg-white p-6">
              <h2 className="text-2xl font-semibold text-[#163d31]">Requests for my items</h2>
              <div className="mt-5 space-y-3">
                {receivedRequests.length === 0 ? <p className="text-sm text-[#708178]">No one has requested your items yet.</p> : receivedRequests.map((request) => <div key={request._id} className="rounded-2xl border border-[#edf0e9] p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-[#285347]">{getItemTitle(request.item)}</p><span className="text-xs font-semibold uppercase text-[#e86e43]">{request.status}</span></div><p className="mt-2 text-sm text-[#708178]">Borrower: {getPersonName(request.borrower)}</p>{request.status === "pending" && <div className="mt-3 flex gap-2"><button type="button" onClick={() => void updateRequest(request._id, "approve")} className="rounded-lg bg-[#185c46] px-3 py-2 text-sm font-semibold text-white cursor-pointer">Approve</button><button type="button" onClick={() => void updateRequest(request._id, "reject")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 cursor-pointer">Reject</button></div>}</div>)}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
