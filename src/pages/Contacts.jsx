import { useMemo, useState } from 'react';
import { Plus, Upload, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ContactCard from '@/components/crm/ContactCard';
import ContactForm from '@/components/crm/ContactForm';
import ImportContactsModal from '@/components/crm/ImportContactsModal';
import { useContacts } from '@/hooks/useContacts';
import { useFieldOptions } from '@/hooks/useFieldOptions';

const ALL = '__all__';

export default function Contacts() {
  const { data: contacts, isLoading } = useContacts();
  const { options } = useFieldOptions();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [source, setSource] = useState(ALL);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const hasFilters =
    search.trim() !== '' || stage !== ALL || category !== ALL || source !== ALL;

  const filtered = useMemo(() => {
    const list = contacts || [];
    const q = search.trim().toLowerCase();
    return list.filter((c) => {
      if (stage !== ALL && c.stage !== stage) return false;
      if (category !== ALL && c.category !== category) return false;
      if (source !== ALL && c.source !== source) return false;
      if (q) {
        const haystack = [
          c.first_name,
          c.last_name,
          c.email,
          c.company,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [contacts, search, stage, category, source]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-gray-500">
            {contacts?.length ?? 0} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or company…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
          <FilterSelect
            value={stage}
            onValueChange={setStage}
            placeholder="All stages"
            items={options.stage}
          />
          <FilterSelect
            value={category}
            onValueChange={setCategory}
            placeholder="All categories"
            items={options.category}
          />
          <FilterSelect
            value={source}
            onValueChange={setSource}
            placeholder="All sources"
            items={options.source}
          />
        </div>
      </div>

      {/* Grid / states */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onAdd={() => setAddOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}

      <ContactForm open={addOpen} onOpenChange={setAddOpen} />
      <ImportContactsModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function FilterSelect({ value, onValueChange, placeholder, items }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {items.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({ hasFilters, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Users className="h-6 w-6 text-gray-400" />
      </div>
      {hasFilters ? (
        <>
          <p className="mt-4 font-medium text-gray-900">
            No contacts match your filters
          </p>
          <p className="text-sm text-gray-500">
            Try adjusting your search or filters.
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 font-medium text-gray-900">No contacts yet</p>
          <p className="text-sm text-gray-500">
            Add your first contact to get started.
          </p>
          <Button className="mt-4" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </>
      )}
    </div>
  );
}
