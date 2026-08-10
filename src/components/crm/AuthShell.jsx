import { Zap } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-olive to-brand-moss text-white shadow-sm">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-bold tracking-tight">MindFlow CRM</h1>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer && (
          <p className="mt-4 text-center text-sm text-gray-500">{footer}</p>
        )}
      </div>
    </div>
  );
}
