import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listUsers, deactivateUser } from '../../api/users.js';
import { apiMessage } from '../../api/error.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { UserFormModal } from './UserFormModal.jsx';

export const UsersPage = () => {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [editing, setEditing] = useState(null); // user | 'new' | null

  const load = useCallback(async () => {
    const { data } = await listUsers();
    setUsers(data.data);
  }, []);

  useEffect(() => {
    load().catch((e) => toast(apiMessage(e), 'err'));
  }, [load, toast]);

  const onDeactivate = async (u) => {
    if (!window.confirm(t('users.deactivateConfirm'))) return;
    try {
      await deactivateUser(u.id);
      toast(t('users.deactivated'), 'ok');
      load();
    } catch (e) {
      toast(apiMessage(e), 'err');
    }
  };

  if (!users) return <Loading label={t('common.loading')} />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{t('users.title')}</h1>
          <span className="muted">{users.length}</span>
        </div>
        <Button variant="primary" onClick={() => setEditing('new')}>
          + {t('users.new')}
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState title={t('users.none')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('users.name')}</th>
                <th>{t('users.email')}</th>
                <th>{t('users.role')}</th>
                <th>{t('users.status')}</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td className="muted num">{u.email}</td>
                  <td>{t(`users.role_${u.role}`)}</td>
                  <td>
                    <Badge tone={u.is_active ? 'ok' : 'default'}>
                      {u.is_active ? t('users.active') : t('users.inactive')}
                    </Badge>
                  </td>
                  <td className="right">
                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>
                        {t('common.edit')}
                      </Button>
                      {u.is_active && u.id !== me?.id && (
                        <Button size="sm" variant="ghost" onClick={() => onDeactivate(u)}>
                          {t('users.deactivate')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <UserFormModal
          user={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </section>
  );
};
