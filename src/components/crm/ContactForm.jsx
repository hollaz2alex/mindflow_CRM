import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DEFAULT_CATEGORY,
  DEFAULT_STAGE,
  DEFAULT_SOURCE,
} from '@/lib/crmConstants';
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts';
import { useFieldOptions } from '@/hooks/useFieldOptions';

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  location: '',
  category: DEFAULT_CATEGORY,
  stage: DEFAULT_STAGE,
  source: DEFAULT_SOURCE,
  brand: '',
  brand_other: '',
  client_type: null,
  last_event_date: '',
  assigned_to: '',
  notes: '',
  tags: [],
};

// Build the controlled state from an existing contact (edit mode) or blanks.
function initialState(contact) {
  if (!contact) return { ...EMPTY };
  return {
    ...EMPTY,
    ...contact,
    last_name: contact.last_name || '',
    phone: contact.phone || '',
    company: contact.company || '',
    location: contact.location || '',
    assigned_to: contact.assigned_to || '',
    notes: contact.notes || '',
    last_event_date: contact.last_event_date || '',
    brand: contact.brand || '',
    brand_other: contact.brand_other || '',
    tags: contact.tags || [],
  };
}

export default function ContactForm({ open, onOpenChange, contact }) {
  const isEdit = !!contact;
  const [form, setForm] = useState(() => initialState(contact));
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const { options } = useFieldOptions();
  const saving = createContact.isPending || updateContact.isPending;

  // Reset the form whenever the dialog opens (or the target contact changes).
  useEffect(() => {
    if (open) {
      setForm(initialState(contact));
      setTagInput('');
      setError('');
    }
  }, [open, contact]);

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setField('tags', [...form.tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag) =>
    setField(
      'tags',
      form.tags.filter((t) => t !== tag)
    );

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    setError('');
    if (!form.first_name.trim() || !form.email.trim()) {
      setError('First name and email are required.');
      return;
    }

    // Only send conditional fields when their category applies.
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim() || null,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      location: form.location.trim() || null,
      category: form.category,
      stage: form.stage,
      source: form.source,
      brand: form.brand || null,
      brand_other:
        form.brand === 'other' ? form.brand_other.trim() || null : null,
      assigned_to: form.assigned_to.trim() || null,
      notes: form.notes.trim() || null,
      tags: form.tags,
      client_type:
        form.category === 'potential_client' ? form.client_type || null : null,
      last_event_date:
        form.category === 'event_attendee' ? form.last_event_date || null : null,
    };

    try {
      if (isEdit) {
        await updateContact.mutateAsync({ id: contact.id, updates: payload });
      } else {
        await createContact.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required>
            <Input
              value={form.first_name}
              onChange={(e) => setField('first_name', e.target.value)}
              placeholder="Ada"
            />
          </Field>
          <Field label="Last name">
            <Input
              value={form.last_name}
              onChange={(e) => setField('last_name', e.target.value)}
              placeholder="Lovelace"
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="ada@example.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="+1 555 123 4567"
            />
          </Field>
          <Field label="Company">
            <Input
              value={form.company}
              onChange={(e) => setField('company', e.target.value)}
              placeholder="Analytical Engines Ltd"
            />
          </Field>
          <Field label="Location">
            <Input
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="London, UK"
            />
          </Field>

          <Field label="Category">
            <EnumSelect
              value={form.category}
              onValueChange={(v) => setField('category', v)}
              items={options.category}
            />
          </Field>
          <Field label="Stage">
            <EnumSelect
              value={form.stage}
              onValueChange={(v) => setField('stage', v)}
              items={options.stage}
            />
          </Field>
          <Field label="Source">
            <EnumSelect
              value={form.source}
              onValueChange={(v) => setField('source', v)}
              items={options.source}
            />
          </Field>
          <Field label="Assigned to">
            <Input
              value={form.assigned_to}
              onChange={(e) => setField('assigned_to', e.target.value)}
              placeholder="Sales rep name"
            />
          </Field>

          <Field label="Brand">
            <Select
              value={form.brand}
              onValueChange={(v) => setField('brand', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {options.brand.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Conditional: free-text brand when "Other" is chosen */}
          {form.brand === 'other' && (
            <Field label="Brand name">
              <Input
                value={form.brand_other}
                onChange={(e) => setField('brand_other', e.target.value)}
                placeholder="Enter brand"
              />
            </Field>
          )}

          {/* Conditional: client_type only for potential_client */}
          {form.category === 'potential_client' && (
            <Field label="Client type">
              <Select
                value={form.client_type ?? ''}
                onValueChange={(v) => setField('client_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  {options.client_type.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {/* Conditional: last_event_date only for event_attendee */}
          {form.category === 'event_attendee' && (
            <Field label="Last event date">
              <Input
                type="date"
                value={form.last_event_date || ''}
                onChange={(e) => setField('last_event_date', e.target.value)}
              />
            </Field>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag and press Enter"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-olive/10 px-2.5 py-0.5 text-xs font-medium text-brand-olive"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full hover:text-brand-moss"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Anything worth remembering about this contact…"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function EnumSelect({ value, onValueChange, items }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
