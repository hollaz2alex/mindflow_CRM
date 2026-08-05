import { useEffect, useState } from 'react';
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
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS,
  DEFAULT_ACTIVITY_TYPE,
} from '@/lib/crmConstants';
import { useCreateActivity } from '@/hooks/useActivities';

const EMPTY = {
  type: DEFAULT_ACTIVITY_TYPE,
  title: '',
  description: '',
  logged_by: '',
};

export default function ActivityForm({ open, onOpenChange, contactId }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');
  const createActivity = useCreateActivity();

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY });
      setError('');
    }
  }, [open]);

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    try {
      // last_contacted is updated by the AFTER INSERT trigger — not here.
      await createActivity.mutateAsync({
        contact_id: contactId,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || null,
        logged_by: form.logged_by.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setField('type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACTIVITY_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Title<span className="text-destructive"> *</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Intro call, sent proposal, etc."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Details…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Logged by</Label>
            <Input
              value={form.logged_by}
              onChange={(e) => setField('logged_by', e.target.value)}
              placeholder="Your name"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createActivity.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={createActivity.isPending}
          >
            {createActivity.isPending ? 'Saving…' : 'Log activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
