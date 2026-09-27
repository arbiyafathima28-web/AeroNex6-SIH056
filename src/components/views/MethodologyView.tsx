import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BookOpen, ShieldCheck, Database, Layers, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  const { t, language } = useLanguage();

  const coreStorySteps = [
    { step: '01', title: 'OBSERVE', desc: 'Continuous discovery of scheduled civil flights across domestic city-pairs.' },
    { step: '02', title: 'COLLECT', desc: 'Ethical automated sampling via compliant NDC interfaces and demo adapters.' },
    { step: '03', title: 'CLEAN', desc: 'Immediate schema validation and parallel duplicate record purging.' },
    { step: '04', title: 'NORMALIZE', desc: 'Decomposition into Base Fare, GST, UDF, and booking fee components.' },
    { step: '05', title: 'MEASURE', desc: 'Standardization across T+1, T+7, T+15, T+30, T+45 lead time horizons.' },
    { step: '06', title: 'ANALYZE', desc: 'IQR anomaly filtering and geometric relative price ratio derivation.' },
    { step: '07', title: 'SIMULATE', desc: 'Econometric sensitivity modeling against CPI Transport sub-group weights.' },
    { step: '08', title: 'PUBLISH', desc: 'Dissemination via MoSPI statistical dashboards and verified Open API.' },
  ];

  const sourceCategories = [
    {
      category: 'Domestic Airlines (Carriers)',
      items: [
        { name: 'IndiGo (6E)', type: 'DEMO / AUTHORIZED PIPELINE', note: 'Largest domestic market share (>60%). Direct NDC interface ready.' },
        { name: 'Air India (AI)', type: 'DEMO / AUTHORIZED PIPELINE', note: 'Full-service carrier with bundled services and business class cabins.' },
        { name: 'Air India Express (IX)', type: 'DEMO / AUTHORIZED PIPELINE', note: 'Regional low-cost carrier specializing in Tier-2 and Tier-3 connectivity.' },
        { name: 'Akasa Air (QP)', type: 'DEMO / AUTHORIZED PIPELINE', note: 'Rapidly expanding domestic LCC fleet.' },
        { name: 'SpiceJet (SG)', type: 'DEMO / AUTHORIZED PIPELINE', note: 'Domestic point-to-point schedule coverage.' },
      ],
    },
    {
      category: 'Online Travel Aggregators (OTAs)',
      items: [
        { name: 'MakeMyTrip (MMT)', type: 'PLANNED OTA CONNECTOR', note: 'Syndicated meta-search fare observations.' },
        { name: 'Yatra', type: 'PLANNED OTA CONNECTOR', note: 'Corporate and retail domestic flight booking feeds.' },
        { name: 'EaseMyTrip', type: 'PLANNED OTA CONNECTOR', note: 'Zero-convenience fee pricing baseline.' },
        { name: 'Cleartrip', type: 'PLANNED OTA CONNECTOR', note: 'Domestic route inventory connector.' },
        { name: 'Ixigo & Goibibo', type: 'PLANNED OTA CONNECTOR', note: 'Multi-modal travel pricing comparison.' },
      ],
    },
    {
      category: 'Government Reference & Statutory Sources',
      items: [
        { name: 'DGCA (Directorate General of Civil Aviation)', type: 'REFERENCE (ACTIVE)', note: 'Official quarterly city-pair passenger traffic volume statistics for route weighting.' },
        { name: 'MoSPI (Ministry of Statistics & Programme Implementation)', type: 'REFERENCE (ACTIVE)', note: 'All-India Consumer Price Index (Base 2012=100) weighting diagrams & methodologies.' },
        { name: 'Open Government Data (data.gov.in)', type: 'REFERENCE (ACTIVE)', note: 'Public airport infrastructure and civil aviation statistics.' },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          {t.methodologyPage.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.methodologyPage.description}
        </p>
      </div>

      {/* The Core Story Workflow */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="mb-4">
          <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">
            Architecture Blueprint
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            The Complete AeroNex6 Data Pipeline Journey
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            OBSERVE → COLLECT → CLEAN → NORMALIZE → MEASURE → ANALYZE → SIMULATE → PUBLISH
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {coreStorySteps.map((item, idx) => (
            <div 
              key={item.step}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 block mb-1">
                  {item.step}
                </span>
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block mb-1">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Technical Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Ethical Collection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.methodologyPage.sections.dataCollection}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.methodologyPage.complianceNotice} AeroNex6 is engineered with dedicated adapters designed for authorized REST/NDC APIs and authorized travel distribution channels. Anti-bot circumvention, CAPTCHA bypass, and stealth IP rotation are strictly excluded.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            Connector Type: Authorized REST / NDC Adapter<br/>
            Rate Limit Policy: Adaptive backoff (max 2 req/sec)<br/>
            Status: Compliant Government Research Prototype
          </div>
        </div>

        {/* Section 2: Data Cleaning & Deduplication */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-600" />
            <span>{t.methodologyPage.sections.dataCleaning}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Raw fare observations pass through a multi-stage validation filter. Schema validation discards null records, identical scrapes across parallel scraping workers are eliminated via compound primary keys (Route + Carrier + Advance Window + Date), and outlier fares are scrubbed using route-specific Tukey Interquartile Range (IQR) fences.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            IQR Multiplier: [Q1 - 1.8·IQR, Q3 + 2.2·IQR]<br/>
            Deduplication Key: Date:Route:Carrier:AdvanceWindow<br/>
            Scrubbed Fares Preserved: In audit archive for review
          </div>
        </div>

        {/* Section 3: Fare Standardization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>{t.methodologyPage.sections.standardization}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            To ensure pure price index compilation, all fare quotes are decomposed into Carrier Base Fare, Statutory Government Taxes (GST, User Development Fee, Passenger Service Fee), and Ancillary Convenience Fees.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-800 dark:text-slate-200 font-mono">
            Total Fare = Base Fare + Taxes (UDF + PSF + GST) + Ancillary Fees
          </div>
        </div>

        {/* Section 4: Route Basket & DGCA Weighting */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t.methodologyPage.sections.routeWeighting}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The representative basket encompasses 42 high-volume domestic city-pairs connecting 13 major airport hubs across India. Route weighting coefficients are calibrated using official Directorate General of Civil Aviation (DGCA) quarterly city-pair passenger volume data.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            Trunk Metro Routes Weight: ~58.2% (DEL-BOM, DEL-BLR, etc.)<br/>
            Regional / Tier-2 Hubs Weight: ~41.8% (AMD, PNQ, GOI, COK, etc.)
          </div>
        </div>
      </div>

      {/* Sources Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t.methodologyPage.sourcesInventory}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clear classification of prototype data feeds versus scheduled production enterprise connectors
          </p>
        </div>

        <div className="space-y-6">
          {sourceCategories.map(cat => (
            <div key={cat.category} className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                {cat.category}
              </span>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="py-2 px-3 font-medium">Source / Entity</th>
                      <th className="py-2 px-3 font-medium">Classification</th>
                      <th className="py-2 px-3 font-medium">Description & Integration Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {cat.items.map(item => (
                      <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          {item.type}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
