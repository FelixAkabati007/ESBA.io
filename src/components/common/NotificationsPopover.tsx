// ======================================================================================
// E-SBA Ghana — Institutional Notification Center
// Displays real-time academic deadlines, moderation alerts, and score approvals
// ======================================================================================

import React from "react";
import { Bell, CheckCircle2, Clock, AlertTriangle, FileCheck, X, ShieldAlert } from "lucide-react";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "MODERATION" | "DEADLINE" | "SECURITY" | "INFO";
  read: boolean;
}

const DEMO_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "NOTIF_001",
    title: "Continuous Assessment Submitted",
    description: "Mr. Kofi Mensah submitted Term 1 marks for Basic 7 (JHS 1) Mathematics.",
    timestamp: "10 mins ago",
    type: "MODERATION",
    read: false,
  },
  {
    id: "NOTIF_002",
    title: "Score Correction Requested",
    description: "Correction request filed for Kweku Boateng (Mathematics Exam score: 68 -> 78).",
    timestamp: "45 mins ago",
    type: "MODERATION",
    read: false,
  },
  {
    id: "NOTIF_003",
    title: "NaCCA Term 1 Moderation Window",
    description: "Internal SBA scores must be sealed and approved before terminal broadsheet publication.",
    timestamp: "2 hours ago",
    type: "DEADLINE",
    read: true,
  },
  {
    id: "NOTIF_004",
    title: "PWA Offline Cache Ready",
    description: "Class rosters and assessment templates cached locally for offline score recording.",
    timestamp: "1 day ago",
    type: "INFO",
    read: true,
  },
];

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModeration?: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateToModeration,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Notifications & System Alerts
          </h4>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {DEMO_NOTIFICATIONS.map((notif) => {
          const icon = {
            MODERATION: <FileCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />,
            DEADLINE: <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
            SECURITY: <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
            INFO: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
          }[notif.type];

          return (
            <div
              key={notif.id}
              className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                !notif.read ? "bg-indigo-50/30" : ""
              }`}
            >
              {icon}
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">{notif.title}</p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </div>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{notif.description}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        {onNavigateToModeration && (
          <button
            onClick={() => {
              onNavigateToModeration();
              onClose();
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Go to Results Moderation Queue →
          </button>
        )}
      </div>
    </div>
  );
};
