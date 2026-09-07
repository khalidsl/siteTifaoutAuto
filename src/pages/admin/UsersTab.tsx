interface UsersTabProps {
  usersList: any[];
  handleUpdateUserRole: (userId: string, newRole: string) => Promise<void>;
  handleDeleteUser: (userId: string, email: string) => Promise<void>;
}

export default function UsersTab({ usersList, handleUpdateUserRole, handleDeleteUser }: UsersTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase text-slate-900">Comptes Utilisateurs & Garagistes ({usersList.length})</h2>
          <p className="text-xs text-slate-500 mt-1">Gérez les accès, les remises professionnelles et les points de fidélité.</p>
        </div>
      </div>

      {usersList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <p className="text-slate-500 font-semibold">Aucun utilisateur enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-xs border-b">
              <tr>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Véhicule / Garage</th>
                <th className="p-3">Rôle</th>
                <th className="p-3">Remise Pro</th>
                <th className="p-3">Points</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usersList.map((u: any) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{u.firstName} {u.lastName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {u._id}</div>
                  </td>
                  <td className="p-3 text-xs">
                    <div>✉ {u.email}</div>
                    <div className="font-mono text-slate-500">📞 {u.phone}</div>
                  </td>
                  <td className="p-3 text-xs font-semibold text-slate-700">{u.vehicleBrand || 'Non renseigné'}</td>
                  <td className="p-3">
                    <select
                      value={u.role || 'client'}
                      onChange={e => handleUpdateUserRole(u._id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      <option value="client">Client / Garagiste</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-700 text-xs">-{u.discountRate || 5}%</td>
                  <td className="p-3 font-mono font-bold text-slate-800 text-xs">{u.loyaltyPoints || 0} pts</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDeleteUser(u._id, u.email)} className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
