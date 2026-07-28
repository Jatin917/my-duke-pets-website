import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import {
  fetchEnquiryPromptSettings,
  updateEnquiryPromptSettings,
} from '../services/enquiryPromptService';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm transition';

const EnquiryPromptSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetchEnquiryPromptSettings()
      .then(setForm)
      .catch(() => toast.error('Failed to load enquiry prompt settings'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateEnquiryPromptSettings({
        promptEnabled: !!form.promptEnabled,
        promptDelaySeconds: Number(form.promptDelaySeconds) || 30,
        promptTitle: form.promptTitle || '',
        promptMessage: form.promptMessage || '',
        promptCtaText: form.promptCtaText || '',
      });
      setForm(updated);
      toast.success('Enquiry prompt settings saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Loader full />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Enquiry Prompt</h1>
          <p className="text-gray-500 text-sm mt-1">
            Timed guest enquiry popup (category &amp; breed). Recommended delay: 30 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg disabled:opacity-60"
        >
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Visibility</h2>
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!form.promptEnabled}
              onChange={(e) => setField('promptEnabled', e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            Show enquiry prompt after delay
          </label>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt delay (seconds)
            </label>
            <input
              type="number"
              min={5}
              max={600}
              value={form.promptDelaySeconds ?? 30}
              onChange={(e) => setField('promptDelaySeconds', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Prompt text</h2>
          <input
            value={form.promptTitle || ''}
            onChange={(e) => setField('promptTitle', e.target.value)}
            placeholder="Prompt title"
            className={inputClass}
          />
          <textarea
            rows={3}
            value={form.promptMessage || ''}
            onChange={(e) => setField('promptMessage', e.target.value)}
            placeholder="Prompt message"
            className={inputClass}
          />
          <input
            value={form.promptCtaText || ''}
            onChange={(e) => setField('promptCtaText', e.target.value)}
            placeholder="Submit button text"
            className={inputClass}
          />
        </section>
      </form>
    </div>
  );
};

export default EnquiryPromptSettings;
