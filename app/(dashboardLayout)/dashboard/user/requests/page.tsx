"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Loader2, Inbox, Send, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import RequestManageModal from "@/components/requests/RequestManageModal";

export default function RequestsPage() {
  const { data: session, isPending } = useSession();
  const userId = (session?.user as any)?.id;

  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/requests`, {
        headers: { "X-User-ID": userId },
      });
      const data = await res.json();
      if (data.success) {
        setIncoming(data.incoming || []);
        setOutgoing(data.outgoing || []);
      } else toast.error(data.message || "Failed to load requests");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  if (isPending || (loading && incoming.length === 0 && outgoing.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const currentData = activeTab === "incoming" ? incoming : outgoing;

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "accepted") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (status === "rejected") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const statusColor = (status: string) => {
    if (status === "accepted") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (status === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sell Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage incoming requests or track your sent requests.</p>
        </div>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "incoming" ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
          >
            <Inbox className="w-4 h-4" /> Incoming ({incoming.length})
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "outgoing" ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
          >
            <Send className="w-4 h-4" /> Sent ({outgoing.length})
          </button>
        </div>
      </div>

      {currentData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
            {activeTab === "incoming" ? <Inbox className="w-8 h-8 text-slate-400" /> : <Send className="w-8 h-8 text-slate-400" />}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No {activeTab} requests</h3>
          <p className="text-sm text-slate-500 max-w-xs mt-1">
            {activeTab === "incoming" ? "You haven't received any requests for your plants yet." : "You haven't sent any requests to other sellers."}
          </p>
        </div>
      ) : (
        <>
          {/* LG Table */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Plant & Price</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">{activeTab === "incoming" ? "Requested By" : "Requested To"}</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Pickup Date</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentData.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{req.plantTitle}</p>
                      <p className="text-emerald-600 font-semibold text-xs mt-0.5">${req.plantPrice.toFixed(2)} • {req.plantCategory}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={(activeTab === "incoming" ? req.requester : req.owner).image || "https://i.ibb.co.com/N0JFXfB/image.png"} className="w-8 h-8 rounded-full object-cover bg-slate-200" alt="" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{(activeTab === "incoming" ? req.requester : req.owner).name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(req.pickupDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusColor(req.status)}`}>
                        <StatusIcon status={req.status} /> {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedRequest(req)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MD / SM Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {currentData.map(req => (
              <div key={req._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{req.plantTitle}</h3>
                    <p className="text-emerald-600 font-semibold text-sm mt-0.5">${req.plantPrice.toFixed(2)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(req.status)}`}>
                    <StatusIcon status={req.status} /> {req.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <img src={(activeTab === "incoming" ? req.requester : req.owner).image || "https://i.ibb.co.com/N0JFXfB/image.png"} className="w-8 h-8 rounded-full object-cover bg-slate-200" alt="" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">{activeTab === "incoming" ? "By" : "To"}</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-none">{(activeTab === "incoming" ? req.requester : req.owner).name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium">Pickup: {new Date(req.pickupDate).toLocaleDateString()}</span>
                  <button onClick={() => setSelectedRequest(req)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedRequest && (
        <RequestManageModal
          request={selectedRequest}
          mode={activeTab}
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchRequests}
        />
      )}
    </div>
  );
}
