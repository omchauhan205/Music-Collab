import { useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, EmptyState, Input, PageLoader } from '../../components/ui'
import { extractErrorMessage, formatDateTime } from '../../utils/format'

export default function AdminSettings() {
  const toast = useToast()
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState({})
  const [savingKey, setSavingKey] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi
      .settings()
      .then((res) => {
        setSettings(res.data)
        setDrafts(Object.fromEntries(res.data.map((s) => [s.settingKey, s.settingValue])))
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (key) => {
    setSavingKey(key)
    try {
      await adminApi.updateSetting(key, drafts[key])
      toast.success('Setting updated successfully')
      load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSavingKey(null)
    }
  }

  const renderControl = (s) => {
    const value = drafts[s.settingKey] ?? ''
    if (value === 'true' || value === 'false') {
      return (
        <select
          value={value}
          onChange={(e) => setDrafts((d) => ({ ...d, [s.settingKey]: e.target.value }))}
          className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      )
    }
    return (
      <Input
        value={value}
        onChange={(e) => setDrafts((d) => ({ ...d, [s.settingKey]: e.target.value }))}
        className="w-64"
      />
    )
  }

  if (loading) return <PageLoader label="Loading settings..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage system-wide preferences and access controls.</p>
      </div>

      <Card bodyClassName="p-0">
        {settings.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No settings available" />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {settings.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-medium text-slate-800">{s.settingKey}</p>
                    <Badge color="gray">config</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{s.description || 'No description'}</p>
                  <p className="mt-1 text-xs text-slate-400">Last updated {formatDateTime(s.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderControl(s)}
                  <Button
                    size="sm"
                    loading={savingKey === s.settingKey}
                    disabled={drafts[s.settingKey] === s.settingValue}
                    onClick={() => save(s.settingKey)}
                  >
                    Save
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
