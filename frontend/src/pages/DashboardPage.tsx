import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Star,
  Globe,
} from 'lucide-react';
import { getLeadsApi, scrapeLeadsApi } from '../api/leads';
import type { Lead } from '../types/lead';
import { Skeleton } from '../components/common/Skeleton';
import { LeadDetailsModal } from '../components/leads/LeadDetailsModal';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Scrape State
  const [quickQuery, setQuickQuery] = useState('');
  const [quickEngine, setQuickEngine] = useState<'maps' | 'search' | 'all'>('maps');
  const [quickLimit] = useState(10);
  const [isScraping, setIsScraping] = useState(false);

  // Selected Lead Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeadsApi(undefined, 0, 100);
      setLeads(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch dashboard metric data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) {
      showToast('Please enter a search query for lead scraping.', 'info');
      return;
    }

    setIsScraping(true);
    showToast(`Scraping leads for "${quickQuery}"... Please wait.`, 'info');

    try {
      const newLeads = await scrapeLeadsApi({
        query: quickQuery.trim(),
        engine: quickEngine,
        limit: quickLimit,
      });

      showToast(`Success! Scraped ${newLeads.length} new leads.`, 'success');
      setQuickQuery('');
      // Refresh dashboard list
      await fetchDashboardData();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Scraping request failed.';
      showToast(msg, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  // Metrics
  const totalLeads = leads.length;
  const leadsWithEmail = leads.filter((l) => l.email).length;
  const leadsWithPhone = leads.filter((l) => l.phone).length;
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Business Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Target & Scrape High-Intent Local B2B Leads
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Discover verified business details, email addresses, phone contacts, and ratings powered by Playwright and FastAPI.
            </p>
          </div>
          <Link
            to="/scraper"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Launch Full Scraper</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Leads */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalLeads}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Recorded in database</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Leads Scraped */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scraped Batches</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {new Set(leads.map((l) => l.query)).size}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">Unique search queries</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Leads With Email */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">With Email</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 mt-1">{leadsWithEmail}</p>
            )}
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {totalLeads > 0 ? `${Math.round((leadsWithEmail / totalLeads) * 100)}% coverage` : '0%'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Leads With Phone */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">With Phone</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 mt-1">{leadsWithPhone}</p>
            )}
            <p className="text-xs text-brand-600 font-medium mt-1">
              {totalLeads > 0 ? `${Math.round((leadsWithPhone / totalLeads) * 100)}% coverage` : '0%'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Scrape Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quick Lead Scrape</h3>
            <p className="text-xs text-slate-500">Run an instant extraction directly from your dashboard</p>
          </div>
          <span className="text-xs font-medium text-slate-400 hidden sm:block">
            Engine: Google Maps / Search
          </span>
        </div>

        <form onSubmit={handleQuickScrape} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="e.g. jewellery shops Delhi, gyms Mumbai, software Bangalore"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={quickEngine}
              onChange={(e) => setQuickEngine(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
            >
              <option value="maps">Google Maps</option>
              <option value="search">Google Search</option>
              <option value="all">All Engines</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isScraping}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scraping...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Scrape Leads</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Leads Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Leads</h3>
            <p className="text-xs text-slate-500">Latest business listings retrieved by scraper</p>
          </div>
          <Link
            to="/leads"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
          >
            <span>View All Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">{error}</div>
        ) : recentLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No leads scraped yet. Use the Quick Scrape tool above to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Business Name</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Website</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4">
                      {lead.rating ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {lead.rating}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="text-brand-600 hover:underline font-medium">
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline font-medium">
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.website ? (
                        <a
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          Visit Website
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};
