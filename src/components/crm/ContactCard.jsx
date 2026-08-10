import { Link } from 'react-router-dom';
import { Mail, Phone, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import StageBadge from './StageBadge';
import CategoryBadge from './CategoryBadge';
import { getInitials, fullName } from '@/lib/format';

export default function ContactCard({ contact }) {
  return (
    <Link to={`/contacts/${contact.id}`} className="group block">
      <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-olive to-brand-moss text-sm font-semibold text-white">
            {getInitials(contact.first_name, contact.last_name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-gray-900 group-hover:text-brand-olive">
              {fullName(contact)}
            </h3>
            <div className="mt-1">
              <StageBadge stage={contact.stage} />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-sm text-gray-500">
          {contact.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{contact.phone}</span>
            </div>
          )}
          {contact.company && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{contact.company}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center border-t border-gray-100 pt-3">
          <CategoryBadge category={contact.category} />
        </div>
      </Card>
    </Link>
  );
}
