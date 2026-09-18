import { useState } from 'react';
import { resolveMediaUrl } from '../../utils/media';
import Pagination from '../../components/admin/Pagination';
import { useLanguage } from '../../context/LanguageContext';

interface QuotesTabProps {
  quoteList: any[];
  exportQuotesToExcel: () => void;
  updateQuoteStatus: (id: string, status?: any, estimatedPrice?: number) => Promise<void>;
}

export default function QuotesTab({ quoteList, exportQuotesToExcel, updateQuoteStatus }: QuotesTabProps) {
  const [page, setPage] = useState(1);
  const visibleQuotes = quoteList.slice((page - 1) * 10, page * 10);
  const { dict } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-bold uppercase text-slate-900">{dict.admin.quotes.title}</h2>
        <button
          onClick={exportQuotesToExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm shadow flex items-center gap-2"
        >
          <span>{dict.admin.quotes.exportExcel}</span>
        </button>
      </div>

      {quoteList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <p className="text-slate-500 font-semibold">{dict.clientPortal.noQuotes}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {visibleQuotes.map((q: any) => {
            const photoSrc = q.photoUrl ? resolveMediaUrl(q.photoUrl) : null;
            const dateStr = q.createdAt ? new Date(q.createdAt).toLocaleDateString('fr-FR') : (q.date || 'Récent');

            return (
              <div key={q._id || q.id} className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded mr-2">{q.quoteNumber}</span>
                      <span className="text-xs text-slate-400">{dateStr}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                      q.status === 'Accepté' ? 'bg-green-100 text-green-800' :
                      q.status === 'Devis envoyé' ? 'bg-blue-100 text-blue-800' :
                      q.status === 'Refusé' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg">{q.fullName || q.name} <span className="text-xs font-semibold text-slate-500 font-sans">({q.clientType || q.customerType || 'Particulier'})</span></h3>
                  <p className="text-xs text-slate-600 font-mono mb-3">
                    📞 {q.phone} {q.city ? `· 📍 ${q.city}` : ''} {q.email ? `· ✉ ${q.email}` : ''}
                  </p>

                  <div className="bg-white p-3 border border-slate-200 rounded text-xs space-y-1.5 mb-4">
                    <div><strong className="text-slate-700">Véhicule :</strong> {q.vehicleBrand || 'Non précisé'} {q.vehicleModel} {q.vehicleYear ? `(${q.vehicleYear})` : ''}</div>
                    <div><strong className="text-slate-700">Composant & Réf :</strong> {q.category || q.partCategory} {q.partReference || q.partRef ? `— ${q.partReference || q.partRef}` : ''}</div>
                    {q.issueDescription || q.description ? (
                      <div className="pt-1 border-t border-slate-100 mt-1">
                        <strong className="text-red-700 block mb-0.5">Problème / Symptômes :</strong>
                        <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 italic font-sans leading-relaxed">"{q.issueDescription || q.description}"</p>
                      </div>
                    ) : null}
                  </div>

                  {photoSrc && (
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-700 block mb-1">Photo transmise :</span>
                      <a href={photoSrc} target="_blank" rel="noopener noreferrer">
                        <img src={photoSrc} alt="Photo du devis" className="h-28 rounded border border-slate-300 object-cover hover:opacity-90 transition-opacity cursor-pointer" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{dict.admin.quotes.table.priceEstimate} :</span>
                    <input
                      type="number"
                      defaultValue={q.priceEstimate || q.estimatedPrice || ''}
                      placeholder="Ex: 1200"
                      onBlur={e => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        updateQuoteStatus(q._id || q.id, undefined, val);
                      }}
                      className="w-32 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button onClick={() => updateQuoteStatus(q._id || q.id, 'En chiffrage')} className="py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold uppercase rounded transition-colors">{dict.admin.quotes.statuses.en_cours}</button>
                    <button onClick={() => updateQuoteStatus(q._id || q.id, 'Devis Envoyé')} className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase rounded transition-colors">{dict.admin.quotes.statuses.traite}</button>
                    <button onClick={() => updateQuoteStatus(q._id || q.id, 'Accepté')} className="py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold uppercase rounded transition-colors">Accepté</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6">
        <Pagination page={page} totalItems={quoteList.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
