import React from 'react';
import { X, Star, Phone, Mail, Globe, MapPin, Calendar, Hash, Tag } from 'lucide-react';
import type { Lead } from '../../types/lead';

interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/20 mb-2">
              <Tag className="w-3 h-3" />
              {lead.query}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">{lead.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rating */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Rating Score
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {lead.rating ? `${lead.rating} / 5.0` : 'Not Rated'}
              </p>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                Phone Number
              </p>
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="text-sm font-semibold text-brand-600 hover:underline truncate block"
                >
                  {lead.phone}
                </a>
              ) : (
                <p className="text-sm text-slate-400 italic">Not available</p>
              )}
            </div>

            {/* Email */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Email Address
              </p>
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="text-sm font-semibold text-indigo-600 hover:underline truncate block"
                >
                  {lead.email}
                </a>
              ) : (
                <p className="text-sm text-slate-400 italic">Not available</p>
              )}
            </div>

            {/* Website */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Website Link
              </p>
              {lead.website ? (
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-600 hover:underline truncate block"
                >
                  Visit Website
                </a>
              ) : (
                <p className="text-sm text-slate-400 italic">Not available</p>
              )}
            </div>
          </div>

          {/* Full Address */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Full Address
            </p>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {lead.address || 'No address provided'}
            </p>
          </div>

          {/* Metadata Section */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Created Date:
              </span>
              <span className="font-mono text-slate-700">
                {new Date(lead.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Last Updated:
              </span>
              <span className="font-mono text-slate-700">
                {new Date(lead.updated_at).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Record UUID:
              </span>
              <span className="font-mono text-slate-600 text-[11px] truncate max-w-[200px]" title={lead.id}>
                {lead.id}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
