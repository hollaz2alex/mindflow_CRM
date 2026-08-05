import { useMemo, useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { parseCSVToObjects } from '@/lib/csv';
import {
  CSV_FIELDS,
  CATEGORIES,
  STAGES,
  SOURCES,
  DEFAULT_CATEGORY,
  DEFAULT_STAGE,
  DEFAULT_SOURCE,
  autoDetectMapping,
  normalizeEnum,
  normalizeClientType,
  normalizeTags,
  labelize,
} from '@/lib/crmConstants';
import { useImportContacts } from '@/hooks/useContacts';

const STEPS = ['Upload', 'Map Columns', 'Preview', 'Done'];
const NONE = '__none__'; // sentinel for "don't map this column"

// Turn a raw CSV row (keyed by header) + mapping into a normalized contact.
function buildContact(rawRow, mapping) {
  const get = (field) => {
    const header = Object.keys(mapping).find((h) => mapping[h] === field);
    return header ? rawRow[header] : undefined;
  };

  const first_name = (get('first_name') || '').trim();
  const email = (get('email') || '').trim();

  const contact = {
    first_name,
    last_name: (get('last_name') || '').trim() || null,
    email,
    phone: (get('phone') || '').trim() || null,
    company: (get('company') || '').trim() || null,
    location: (get('location') || '').trim() || null,
    category: normalizeEnum(get('category'), CATEGORIES, DEFAULT_CATEGORY),
    stage: normalizeEnum(get('stage'), STAGES, DEFAULT_STAGE),
    source: normalizeEnum(get('source'), SOURCES, DEFAULT_SOURCE),
    notes: (get('notes') || '').trim() || null,
    tags: normalizeTags(get('tags')),
    assigned_to: (get('assigned_to') || '').trim() || null,
    client_type: normalizeClientType(get('client_type')),
    last_event_date: (get('last_event_date') || '').trim() || null,
  };

  const valid = !!first_name && !!email;
  return { contact, valid };
}

export default function ImportContactsModal({ open, onOpenChange }) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [parseError, setParseError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const importContacts = useImportContacts();

  const reset = () => {
    setStep(0);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setParseError('');
    setResult(null);
  };

  const handleClose = (next) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const readFile = (file) => {
    setParseError('');
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Please choose a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { headers: hdrs, rows: parsed } = parseCSVToObjects(
          e.target.result
        );
        if (hdrs.length === 0) {
          setParseError('That file appears to be empty.');
          return;
        }
        setFileName(file.name);
        setHeaders(hdrs);
        setRows(parsed);
        setMapping(autoDetectMapping(hdrs));
        setStep(1);
      } catch {
        setParseError('Could not parse that CSV file.');
      }
    };
    reader.onerror = () => setParseError('Could not read that file.');
    reader.readAsText(file);
  };

  // Build + partition rows for preview / import.
  const processed = useMemo(
    () => rows.map((r) => buildContact(r, mapping)),
    [rows, mapping]
  );
  const validCount = processed.filter((p) => p.valid).length;
  const invalidCount = processed.length - validCount;

  const runImport = async () => {
    const validContacts = processed.filter((p) => p.valid).map((p) => p.contact);
    try {
      const res = await importContacts.mutateAsync(validContacts);
      setResult({
        inserted: res.inserted,
        skipped: invalidCount,
        failed: res.failed,
      });
    } catch (err) {
      setResult({
        inserted: 0,
        skipped: invalidCount,
        failed: validCount,
        error: err.message,
      });
    }
    setStep(3);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  i <= step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  i <= step ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px flex-1',
                    i < step ? 'bg-indigo-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0 — Upload */}
        {step === 0 && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                readFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                dragging
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <UploadCloud className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  Drag &amp; drop a CSV here
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => readFile(e.target.files?.[0])}
              />
            </div>
            {parseError && (
              <p className="mt-3 text-sm text-destructive">{parseError}</p>
            )}
          </div>
        )}

        {/* Step 1 — Map columns */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-gray-700">{fileName}</span>
              <span>· {rows.length} rows</span>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {headers.map((header) => (
                <div
                  key={header}
                  className="grid grid-cols-2 items-center gap-3"
                >
                  <div className="truncate text-sm font-medium text-gray-700">
                    {header}
                  </div>
                  <Select
                    value={mapping[header] ?? NONE}
                    onValueChange={(v) =>
                      setMapping((prev) => ({
                        ...prev,
                        [header]: v === NONE ? undefined : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Don't import" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Don&apos;t import</SelectItem>
                      {CSV_FIELDS.map((field) => (
                        <SelectItem key={field} value={field}>
                          {labelize(field)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Preview */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> {validCount} valid
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                <AlertCircle className="h-4 w-4" /> {invalidCount} will be
                skipped
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Rows missing a first name or email are invalid and won&apos;t be
              imported. Showing the first 5 rows.
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">First name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Stage</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.slice(0, 5).map(({ contact, valid }, i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-t border-gray-100',
                        !valid && 'bg-gray-50 opacity-50'
                      )}
                    >
                      <td className="px-3 py-2">{contact.first_name || '—'}</td>
                      <td className="px-3 py-2">{contact.email || '—'}</td>
                      <td className="px-3 py-2">{contact.category}</td>
                      <td className="px-3 py-2">{contact.stage}</td>
                      <td className="px-3 py-2">{contact.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && result && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold">Import complete</p>
              <p className="text-sm text-gray-500">
                {result.inserted} imported · {result.skipped} skipped ·{' '}
                {result.failed} failed
              </p>
            </div>
            {result.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 0 && (
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
          )}
          {step === 1 && (
            <>
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)}>Preview</Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={runImport}
                disabled={validCount === 0 || importContacts.isPending}
              >
                {importContacts.isPending
                  ? 'Importing…'
                  : `Import ${validCount} contact${validCount === 1 ? '' : 's'}`}
              </Button>
            </>
          )}
          {step === 3 && (
            <Button onClick={() => handleClose(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
