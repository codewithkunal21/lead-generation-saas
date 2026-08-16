import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  Download,
} from 'lucide-react';
import { getLeadsApi } from '../api/leads';
import type { Lead } from '../types/lead';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { LeadDetailsModal } from '../components/leads/LeadDetailsModal';
import { useToast } from '../context/ToastContext';
import { exportLeadsToCsv } from '../utils/csvExport';

export const LeadsPage: React.FC = () => {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [hasEmailOnly, setHasEmailOnly] = useState(false);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeadsApi(undefined, 0, 1000);
      setLeads(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retrieve scraped leads.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter & Search Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search term matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(query);
        const matchesEmail = lead.email?.toLowerCase().includes(query);
        const matchesPhone = lead.phone?.toLowerCase().includes(query);
        const matchesQuery = lead.query.toLowerCase().includes(query);
        const matchesAddress = lead.address?.toLowerCase().includes(query);

        if (!matchesName && !matchesEmail && !matchesPhone && !matchesQuery && !matchesAddress) {
          return false;
        }
      }

      // Rating filter
      if (minRating > 0) {
        if (!lead.rating || lead.rating < minRating) return false;
      }

      // Has Email filter
      if (hasEmailOnly && !lead.email) return false;

      // Has Phone filter
      if (hasPhoneOnly && !lead.phone) return false;

      return true;
    });
  }, [leads, searchTerm, minRating, hasEmailOnly, hasPhoneOnly]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMinRating(0);
    setHasEmailOnly(false);
    setHasPhoneOnly(false);
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    if (filteredLeads.length === 0) {
      showToast('No leads available to export.', 'error');
      return;
    }
    exportLeadsToCsv(filteredLeads);
    showToast('Leads exported successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search leads by name, email, phone, or address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeads}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={isLoading || filteredLeads.length === 0}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
              title={filteredLeads.length === 0 ? 'No leads available to export' : 'Export currently filtered leads to CSV'}
            >
              <Download className="w-3.5 h-3.5 text-brand-600" />
              <span>Export CSV</span>
            </button>

            {(searchTerm || minRating > 0 || hasEmailOnly || hasPhoneOnly) && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Rating Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Min Rating:</span>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(parseFloat(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
            >
              <option value={0}>All Ratings</option>
              <option value={4.0}>⭐ 4.0 & above</option>
              <option value={4.5}>⭐ 4.5 & above</option>
            </select>
          </div>

          {/* Has Email Checkbox */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasEmailOnly}
              onChange={(e) => {
                setHasEmailOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <span className="text-slate-700">Has Email</span>
          </label>

          {/* Has Phone Checkbox */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasPhoneOnly}
              onChange={(e) => {
                setHasPhoneOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <span className="text-slate-700">Has Phone</span>
          </label>
        </div>
      </div>

      {/* Main Leads Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-600 text-sm">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchLeads}
              className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
            >
              Retry Loading
            </button>
          </div>
        ) : paginatedLeads.length === 0 ? (
          <EmptyState
            title="No leads match your criteria"
            description={
              leads.length === 0
                ? 'Your lead database is currently empty. Run the Scraper to extract new leads!'
                : 'Try adjusting your search terms or filter rules to display results.'
            }
            actionLabel={leads.length === 0 ? 'Go to Lead Scraper' : 'Reset Filters'}
            onAction={
              leads.length === 0
                ? () => (window.location.href = '/scraper')
                : handleResetFilters
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Business Name</th>
                    <th className="px-6 py-3.5">Phone</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Website</th>
                    <th className="px-6 py-3.5">Address</th>
                    <th className="px-6 py-3.5">Rating</th>
                    <th className="px-6 py-3.5">Created At</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {lead.name}
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Website */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {lead.website ? (
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            Visit Website
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4 max-w-xs truncate text-xs" title={lead.address || ''}>
                        {lead.address ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            {lead.address}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        {lead.rating ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {lead.rating}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-900">{filteredLeads.length}</span> leads
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-800 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};
