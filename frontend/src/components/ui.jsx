export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div
      role="status"
      className={`animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 ${sizes[size]} ${className}`}
    />
  )
}

export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <Spinner size="lg" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

const buttonVariants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  type = 'button',
  ...props
}) {
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed ${buttonVariants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  )
}

const fieldBase =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100'

export function Input({ className = '', ...props }) {
  return <input className={`${fieldBase} ${className}`} {...props} />
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={`${fieldBase} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${fieldBase} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Field({ label, error, hint, children, required }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  )
}

export function Card({ title, subtitle, actions, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

const badgeColors = {
  gray: 'bg-slate-100 text-slate-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-sky-100 text-sky-700',
}

export function Badge({ color = 'gray', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[color]}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    PENDING: { color: 'amber', label: 'Pending' },
    APPROVED: { color: 'green', label: 'Approved' },
    REJECTED: { color: 'red', label: 'Rejected' },
    OPEN: { color: 'blue', label: 'Open' },
    IN_PROGRESS: { color: 'indigo', label: 'In progress' },
    COMPLETED: { color: 'green', label: 'Completed' },
    ARCHIVED: { color: 'gray', label: 'Archived' },
  }
  const cfg = map[status] || { color: 'gray', label: status }
  return <Badge color={cfg.color}>{cfg.label}</Badge>
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center">
      <div className={`w-full ${sizes[size]} rounded-xl bg-white shadow-xl`}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  )
}

export function StatCard({ label, value, hint, accent = 'indigo' }) {
  const accents = {
    indigo: 'text-indigo-600',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-rose-600',
    blue: 'text-sky-600',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accents[accent] || accents.indigo}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  }
  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
}
