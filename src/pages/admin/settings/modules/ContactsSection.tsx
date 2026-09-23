import React from "react";
import { CheckCircle, RefreshCw, Plus, Trash2, Mail, Phone, User, Bell } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState, ContactProfile } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const ContactsSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const contacts = settings.contact_profiles || [];

  const handleToggleNotify = (id: string) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, receivesNotifications: !c.receivesNotifications } : c
    );
    onChange({ contact_profiles: updated });
    toast.success("Notification recipient routing updated");
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    onChange({ contact_profiles: updated });
    toast.info("Contact profile removed");
  };

  const handleAdd = () => {
    const newProfile: ContactProfile = {
      id: "cnt_" + Date.now(),
      name: "New Team Contact",
      department: "Support",
      email: "team@tripmobility.ph",
      phone: "+63 2 8888 7273",
      mobile: "+63 917 000 0000",
      position: "Specialist",
      status: "active",
      receivesNotifications: true,
    };
    onChange({ contact_profiles: [...contacts, newProfile] });
    toast.success("Added new contact card");
  };

  const handleUpdate = (id: string, patch: Partial<ContactProfile>) => {
    const updated = contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
    onChange({ contact_profiles: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Department Contact Profiles</h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure designated department contacts for customer support, quotations, billing questions, and automated notification alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            type="button"
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-orbitron text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#39FF14]" /> Add Profile
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Save Contacts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-5 space-y-4 hover:border-white/15 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleUpdate(contact.id, { name: e.target.value })}
                      className="bg-transparent text-white font-semibold text-xs focus:outline-none focus:border-b border-[#39FF14]"
                    />
                    <input
                      type="text"
                      value={contact.position}
                      onChange={(e) => handleUpdate(contact.id, { position: e.target.value })}
                      className="block bg-transparent text-[11px] text-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                <select
                  value={contact.department}
                  onChange={(e) => handleUpdate(contact.id, { department: e.target.value as any })}
                  className="bg-[#141414] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-[#39FF14] font-semibold"
                >
                  <option value="General">General</option>
                  <option value="Sales">Sales</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Support">Support</option>
                  <option value="Technical">Technical</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => handleUpdate(contact.id, { email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-gray-200 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => handleUpdate(contact.id, { phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-gray-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleNotify(contact.id)}
                className={"flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all " +
                  (contact.receivesNotifications
                    ? "bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30"
                    : "bg-white/5 text-gray-400 border border-white/10")
                }
              >
                <Bell className="w-3 h-3" />
                {contact.receivesNotifications ? "Notified on Leads" : "Silent"}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(contact.id)}
                className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
