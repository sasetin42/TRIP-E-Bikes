import React, { useState, useEffect } from "react";
import { Search, Download, Monitor } from "lucide-react";
import { toast } from "sonner";
import { SettingsService } from "@/services/settingsService";
import { AuditLogEntry } from "../types";

export const AuditLogsSection: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  useEffect(() => {
    SettingsService.getAuditLogs().then(setLogs);
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const handleExportCsv = () => {
    const headers = "ID,User,Action,Module,Description,IPAddress,Device,Timestamp\n";
    const rows = logs
      .map(
        (l) =>
          '"' + l.id + '","' + l.user + '","' + l.action + '","' + l.module + '","' + l.description + '","' + l.ipAddress + '","' + l.device + '","' + l.timestamp + '"'
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trip-audit-logs-" + Date.now() + ".csv";
    a.click();
    toast.success("Audit trail exported as CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Activity & Audit Log Trail</h2>
          <p className="text-xs text-gray-400 mt-1">
            Immutable log entries documenting configuration modifications, user roles, timestamps, and IP provenance.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#39FF14]" />
          Export Audit Trail (CSV)
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search action, description, or administrator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[11px] font-orbitron uppercase text-gray-400">
                <th className="p-4">Administrator</th>
                <th className="p-4">Action / Event</th>
                <th className="p-4">Module</th>
                <th className="p-4">Client Telemetry</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#39FF14]/15 text-[#39FF14] flex items-center justify-center text-[10px] font-bold">
                        {log.user.slice(0, 1)}
                      </div>
                      <span className="font-semibold text-white">{log.user}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-white block">{log.action}</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">{log.description}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-gray-300">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                      <Monitor className="w-3 h-3 text-gray-500" />
                      {log.ipAddress} · {log.browser}
                    </div>
                  </td>
                  <td className="p-4 text-right text-[11px] text-gray-400">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
