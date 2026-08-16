import React, { useState } from 'react';
import {
  Search,
  Sliders,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe,
  Info,
} from 'lucide-react';
import { scrapeLeadsApi } from '../api/leads';
import type { Lead } from '../types/lead';
import { useToast } from '../context/ToastContext';
import { LeadDetailsModal } from '../components/leads/LeadDetailsModal';

export const ScraperPage: React.FC = () => {
  const { showToast } = useToast();

  const [query, setQuery] = useState('jewellery shops Delhi');
  const [engine, setEngine] = useState<'maps' | 'search' | 'all'>('maps');
  const [limit, setLimit] = useState<number>(10);

  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapedResults, setScrapedResults] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const suggestedQueries = [
    'jewellery shops Delhi',
    'gyms in Mumbai',
    'software companies Bangalore',
    'real estate agents Hyderabad',
    'dentists Chennai',
  ];

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      showToast('Please specify a search query term.', 'info');
      return;
    }

    setIsScraping(true);
    setError(null);
    setScrapedResults(null);
    showToast(`Initializing lead extraction for "${query.trim()}"...`, 'info');

    try {
      const results = await scrapeLeadsApi({
        query: query.trim(),
        engine,
        limit,
      });

      setScrapedResults(results);
      showToast(`Extraction complete! Found ${results.length} business leads.`, 'success');
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        'An error occurred while executing the scraper. Please verify backend availability.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Automated Business Lead Scraper
            </h2>
            <p className="text-xs text-slate-500">
              Extract real-time contact details, addresses, ratings, and websites from search engines.
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Try Sample Query:
          </span>
          {suggestedQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="px-3 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 border border-slate-200 rounded-full text-xs font-medium text-slate-600 transition-all"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Scraper Configuration Form */}
      <form onSubmit={handleScrape} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Search Query Input */}
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Search Query *
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. jewellery shops Delhi"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Specify business category and location keywords.
            </p>
          </div>

          {/* Engine Select */}
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Scraper Engine
            </label>
            <div className="relative">
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
              >
                <option value="maps">Google Maps (Local Places)</option>
                <option value="search">Google Search (Web Organic)</option>
                <option value="all">All Engines (Combined)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Select local map listings or web site search.
            </p>
          </div>

          {/* Limit Input */}
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Extraction Limit (1 - 50)
            </label>
            <div className="relative">
              <Sliders className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={1}
                max={50}
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Maximum items to retrieve per pipeline.
            </p>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-brand-600" />
            <span>Results are automatically deduplicated and saved to PostgreSQL.</span>
          </div>

          <button
            type="submit"
            disabled={isScraping}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center gap-2.5 transition-all"
          >
            {isScraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scraping Leads...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>🔍 Scrape Leads</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Scraping Feedback Status Banner */}
      {isScraping && (
        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-indigo-900">Scraping Pipeline Active</h4>
            <p className="text-xs text-indigo-700 mt-0.5">
              Extracting business directory records for "{query}" via {engine.toUpperCase()} engine. This usually takes 5-15 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Error Callout */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Scraper Execution Failed</h4>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Immediate Results Display Table */}
      {scrapedResults && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
          <div className="px-6 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scraped Results ({scrapedResults.length} Leads)
                </h3>
                <p className="text-xs text-slate-500">Query: "{query}"</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              HTTP 201 Created
            </span>
          </div>

          {scrapedResults.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No matching business listings were returned by the scraper engine. Try broadening your query terms.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Business Name</th>
                    <th className="px-6 py-3.5">Rating</th>
                    <th className="px-6 py-3.5">Phone</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Address</th>
                    <th className="px-6 py-3.5">Website</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scrapedResults.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
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
                          <a href={`tel:${lead.phone}`} className="text-brand-600 hover:underline font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
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
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};
