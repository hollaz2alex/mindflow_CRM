import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Mail,
  Phone,
  Building2,
  MapPin,
  Radio,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import StageBadge from '@/components/crm/StageBadge';
import CategoryBadge from '@/components/crm/CategoryBadge';
import ContactForm from '@/components/crm/ContactForm';
import ActivityForm from '@/components/crm/ActivityForm';
import { useContact, useDeleteContact } from '@/hooks/useContacts';
import { useContactActivities } from '@/hooks/useActivities';
import { ACTIVITY_ICON, ACTIVITY_ICON_COLOR } from '@/lib/activityIcons';
import {
  SOURCE_LABELS,
  CLIENT_TYPE_LABELS,
  ACTIVITY_TYPE_LABELS,
} from '@/lib/crmConstants';
import {
  getInitials,
  fullName,
  formatDate,
  formatDateTime,
} from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: contact, isLoading, isError } = useContact(id);
  const { data: activities, isLoading: activitiesLoading } =
    useContactActivities(id);
  const deleteContact = useDeleteContact();

  const [editOpen, setEditOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    await deleteContact.mutateAsync(id);
    navigate('/contacts');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !contact) {
    return (
      <div className="py-16 text-center">
        <p className="font-medium text-gray-900">Contact not found</p>
        <Link
          to="/contacts"
          className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
        >
          Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — identity */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-semibold text-white">
                  {getInitials(contact.first_name, contact.last_name)}
                </div>
                <h1 className="mt-3 text-xl font-bold">{fullName(contact)}</h1>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  <StageBadge stage={contact.stage} />
                  <CategoryBadge category={contact.category} />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
                <InfoRow icon={Mail} label="Email" value={contact.email} />
                <InfoRow icon={Phone} label="Phone" value={contact.phone} />
                <InfoRow
                  icon={Building2}
                  label="Company"
                  value={contact.company}
                />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={contact.location}
                />
                <InfoRow
                  icon={Radio}
                  label="Source"
                  value={SOURCE_LABELS[contact.source]}
                />
                <InfoRow
                  icon={UserCheck}
                  label="Assigned to"
                  value={contact.assigned_to}
                />

                {/* Conditional fields */}
                {contact.category === 'potential_client' &&
                  contact.client_type && (
                    <InfoRow
                      icon={Building2}
                      label="Client type"
                      value={CLIENT_TYPE_LABELS[contact.client_type]}
                    />
                  )}
                {contact.category === 'event_attendee' &&
                  contact.last_event_date && (
                    <InfoRow
                      icon={Calendar}
                      label="Last event"
                      value={formatDate(contact.last_event_date)}
                    />
                  )}
                {contact.last_contacted && (
                  <InfoRow
                    icon={Calendar}
                    label="Last contacted"
                    value={formatDate(contact.last_contacted)}
                  />
                )}
              </div>

              {/* Tags */}
              {contact.tags?.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contact.notes && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                    Notes
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-gray-600">
                    {contact.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — activity timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Activity</h2>
                <Button size="sm" onClick={() => setLogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Log Activity
                </Button>
              </div>

              <div className="mt-6">
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (activities || []).length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    No activity yet. Log the first interaction.
                  </p>
                ) : (
                  <Timeline activities={activities} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactForm
        open={editOpen}
        onOpenChange={setEditOpen}
        contact={contact}
      />
      <ActivityForm open={logOpen} onOpenChange={setLogOpen} contactId={id} />

      {/* Delete confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete contact?</DialogTitle>
            <DialogDescription>
              This permanently deletes {fullName(contact)} and all of their
              logged activities. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleteContact.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteContact.isPending}
            >
              {deleteContact.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="truncate text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Timeline({ activities }) {
  return (
    <ol className="relative space-y-6 border-l border-gray-200 pl-6">
      {activities.map((a) => {
        const Icon = ACTIVITY_ICON[a.type] || ACTIVITY_ICON.other;
        return (
          <li key={a.id} className="relative">
            <span
              className={cn(
                'absolute -left-[2.1rem] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white',
                ACTIVITY_ICON_COLOR[a.type] || ACTIVITY_ICON_COLOR.other
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2">
              <p className="font-medium text-gray-900">{a.title}</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {ACTIVITY_TYPE_LABELS[a.type] ?? a.type}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {formatDateTime(a.created_date)}
              {a.logged_by ? ` · ${a.logged_by}` : ''}
            </p>
            {a.description && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                {a.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
