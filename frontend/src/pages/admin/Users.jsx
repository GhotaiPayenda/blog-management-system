import { useCallback, useEffect, useState } from 'react';
import { Search, Trash2, Shield, User as UserIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function Users() {
  const { admin: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'role'|'delete', user, nextRole? }
  const [actionLoading, setActionLoading] = useState(null); // user id
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.get('/users', { params })
      .then((res) => { setUsers(res.data.users); setPagination(res.data.pagination); })
      .catch((err) => setToast({ type: 'error', message: err.response?.data?.message || 'Failed to load users' }))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const requestRoleChange = (user, nextRole) => {
    if (user.role === nextRole) return;
    setConfirm({ type: 'role', user, nextRole });
  };

  const requestDelete = (user) => setConfirm({ type: 'delete', user });

  const handleConfirm = async () => {
    if (!confirm) return;
    const { type, user, nextRole } = confirm;
    setActionLoading(user.id);
    try {
      if (type === 'role') {
        const res = await api.patch(`/users/${user.id}/role`, { role: nextRole });
        setToast({ type: 'success', message: res.data.message || 'Role updated' });
      } else if (type === 'delete') {
        const res = await api.delete(`/users/${user.id}`);
        setToast({ type: 'success', message: res.data.message || 'User deleted' });
      }
      setConfirm(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
      setConfirm(null);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmTitle = confirm?.type === 'delete' ? 'Delete Account' : 'Change Account Role';
  const confirmMessage = confirm?.type === 'delete'
    ? `Are you sure you want to delete ${confirm.user.name} (${confirm.user.email})? This action cannot be undone.`
    : `Change ${confirm?.user?.name}'s role from ${confirm?.user?.role} to ${confirm?.nextRole}? Their active sessions will be invalidated and they must sign in again.`;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <ConfirmDialog
        open={!!confirm}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm">Manage accounts and roles</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? <Spinner label="Loading users..." /> : users.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Full Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Current Role</th>
                  <th className="text-left px-5 py-3 font-medium">Created</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const busy = actionLoading === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-600">#{u.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {u.name} {isSelf && <span className="ml-2 text-xs text-brand-600 font-medium">(You)</span>}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role === 'Admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end items-center gap-2">
                          <select
                            value={u.role}
                            disabled={isSelf || busy}
                            onChange={(e) => requestRoleChange(u, e.target.value)}
                            title={isSelf ? 'You cannot change your own role' : 'Change role'}
                            className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                          </select>
                          <button
                            onClick={() => requestDelete(u)}
                            disabled={isSelf || busy}
                            title={isSelf ? 'You cannot delete your own account' : 'Delete account'}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                          {busy && <span className="text-xs text-slate-400">Updating…</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 text-sm">
            <span className="text-slate-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} accounts)</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Prev</button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <strong>Security notes:</strong> You cannot change or delete your own account. The system prevents demoting or deleting the last active administrator. Role changes invalidate the affected user&apos;s existing sessions.
      </div>
    </div>
  );
}