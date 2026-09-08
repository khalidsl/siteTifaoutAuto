import type { RepairTicket } from '../../types';

interface RepairsTabProps {
  repairList: RepairTicket[];
  updateRepairStatus: (id: string, status: RepairTicket['status'], progressPercentage: number) => void;
}

export default function RepairsTab({ repairList, updateRepairStatus }: RepairsTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      <h2 className="font-display text-2xl font-bold uppercase text-slate-900 mb-6">Mise à jour du Statut Atelier des Réparations</h2>

      <div className="space-y-4">
        {repairList.map(rep => (
          <div key={rep.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded mr-2">{rep.ticketNumber}</span>
              <strong className="text-slate-900">{rep.partName} (Réf. {rep.ref})</strong>
              <span className="text-xs text-slate-500 block mt-0.5">Client : {rep.customerName} ({rep.phone}) — {rep.vehicle}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <span className="block font-semibold text-slate-700">Étape actuelle :</span>
                <span className="font-bold text-blue-600">{rep.status} ({rep.progressPercentage}%)</span>
              </div>

              <select
                value={rep.status}
                onChange={e => {
                  const newStatus = e.target.value as RepairTicket['status'];
                  const perc = newStatus === 'Réceptionné' ? 20 : newStatus === 'Diagnostic' ? 40 : newStatus === 'Nettoyage Ultrasons' ? 60 : newStatus === 'Calibration Banc DCI 200' ? 80 : 100;
                  updateRepairStatus(rep.id, newStatus, perc);
                }}
                className="text-xs bg-white border border-slate-300 rounded px-3 py-2 outline-none font-semibold cursor-pointer"
              >
                <option value="Réceptionné">1. Réceptionné (20%)</option>
                <option value="Diagnostic">2. Diagnostic (40%)</option>
                <option value="Nettoyage Ultrasons">3. Nettoyage (60%)</option>
                <option value="Calibration Banc DCI 200">4. Calibration Banc DCI 200 (80%)</option>
                <option value="Prêt à livrer">5. Prêt à livrer (100%)</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
