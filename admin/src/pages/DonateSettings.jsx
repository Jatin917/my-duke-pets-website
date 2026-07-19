import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiUpload, FiX } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import { fetchDonateSettings, updateDonateSettings } from '../services/donateService';
import { resolveImageUrl } from '../services/api';

const emptyImpact = () => ({ title: '', description: '' });
const emptyStat = () => ({ label: '', value: '' });
const emptyFaq = () => ({ question: '', answer: '' });
const emptyThanks = () => ({ name: '', message: '' });

const DonateSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [removeQr, setRemoveQr] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetchDonateSettings()
      .then((data) => {
        setForm({
          ...data,
          amountsText: (data.amounts || []).join(', '),
        });
        setQrPreview(data.qrImage || '');
      })
      .catch(() => toast.error('Failed to load donate settings'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateListItem = (listKey, index, key, value) => {
    setForm((prev) => {
      const list = [...(prev[listKey] || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [listKey]: list };
    });
  };

  const addListItem = (listKey, factory) => {
    setForm((prev) => ({ ...prev, [listKey]: [...(prev[listKey] || []), factory()] }));
  };

  const removeListItem = (listKey, index) => {
    setForm((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).filter((_, i) => i !== index),
    }));
  };

  const onQrChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    setRemoveQr(false);
    setQrPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const amounts = String(form.amountsText || '')
        .split(/[,\s]+/)
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n > 0);

      const fd = new FormData();
      fd.append('pageEnabled', String(!!form.pageEnabled));
      fd.append('promptEnabled', String(!!form.promptEnabled));
      fd.append('promptDelaySeconds', String(form.promptDelaySeconds || 30));
      fd.append('promptTitle', form.promptTitle || '');
      fd.append('promptMessage', form.promptMessage || '');
      fd.append('promptCtaText', form.promptCtaText || '');
      fd.append('heroTitle', form.heroTitle || '');
      fd.append('heroSubtitle', form.heroSubtitle || '');
      fd.append('heroCtaText', form.heroCtaText || '');
      fd.append('upiId', form.upiId || '');
      fd.append('bankDetails', form.bankDetails || '');
      fd.append('payNote', form.payNote || '');
      fd.append('thankYouTitle', form.thankYouTitle || '');
      fd.append('thankYouMessage', form.thankYouMessage || '');
      fd.append('amounts', JSON.stringify(amounts));
      fd.append('impactItems', JSON.stringify(form.impactItems || []));
      fd.append('stats', JSON.stringify(form.stats || []));
      fd.append('faqs', JSON.stringify(form.faqs || []));
      fd.append('thankYous', JSON.stringify(form.thankYous || []));
      if (removeQr) fd.append('removeQr', 'true');
      if (qrFile) fd.append('qrImage', qrFile);

      const updated = await updateDonateSettings(fd);
      setForm({
        ...updated,
        amountsText: (updated.amounts || []).join(', '),
      });
      setQrFile(null);
      setRemoveQr(false);
      setQrPreview(updated.qrImage || '');
      toast.success('Donate settings saved');
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
          <h1 className="text-2xl font-bold text-gray-800">Donate Page</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage My Duke donate content, QR code, and the 30s prompt
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggles */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Visibility</h2>
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!form.pageEnabled}
              onChange={(e) => setField('pageEnabled', e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            Enable donate page (`/donate`)
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!form.promptEnabled}
              onChange={(e) => setField('promptEnabled', e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            Show donate prompt after delay
          </label>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt delay (seconds)</label>
            <input
              type="number"
              min={5}
              max={600}
              value={form.promptDelaySeconds ?? 30}
              onChange={(e) => setField('promptDelaySeconds', Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>
        </section>

        {/* Prompt copy */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Prompt text</h2>
          <input
            value={form.promptTitle || ''}
            onChange={(e) => setField('promptTitle', e.target.value)}
            placeholder="Prompt title"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <textarea
            rows={3}
            value={form.promptMessage || ''}
            onChange={(e) => setField('promptMessage', e.target.value)}
            placeholder="Prompt message"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <input
            value={form.promptCtaText || ''}
            onChange={(e) => setField('promptCtaText', e.target.value)}
            placeholder="CTA button text"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </section>

        {/* Hero */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Hero</h2>
          <input
            value={form.heroTitle || ''}
            onChange={(e) => setField('heroTitle', e.target.value)}
            placeholder="Hero title"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <textarea
            rows={3}
            value={form.heroSubtitle || ''}
            onChange={(e) => setField('heroSubtitle', e.target.value)}
            placeholder="Hero subtitle"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <input
            value={form.heroCtaText || ''}
            onChange={(e) => setField('heroCtaText', e.target.value)}
            placeholder="Hero CTA"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </section>

        {/* Payment */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Payment (UPI / QR)</h2>
          <input
            value={form.upiId || ''}
            onChange={(e) => setField('upiId', e.target.value)}
            placeholder="UPI ID (e.g. myduke@upi)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <input
            value={form.amountsText || ''}
            onChange={(e) => setField('amountsText', e.target.value)}
            placeholder="Suggested amounts (comma separated) e.g. 100, 500, 1000"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <textarea
            rows={2}
            value={form.payNote || ''}
            onChange={(e) => setField('payNote', e.target.value)}
            placeholder="Payment note shown above QR"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <textarea
            rows={3}
            value={form.bankDetails || ''}
            onChange={(e) => setField('bankDetails', e.target.value)}
            placeholder="Optional bank details"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">QR code image</p>
            {(qrPreview || form.qrImage) && !removeQr ? (
              <div className="relative inline-block">
                <img
                  src={qrFile ? qrPreview : resolveImageUrl(form.qrImage || qrPreview)}
                  alt="QR"
                  className="w-40 h-40 object-contain rounded-xl border border-gray-200 bg-white p-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRemoveQr(true);
                    setQrFile(null);
                    setQrPreview('');
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 cursor-pointer hover:border-primary-400 hover:text-primary-600">
                <FiUpload /> Upload QR image
                <input type="file" accept="image/*" className="hidden" onChange={onQrChange} />
              </label>
            )}
            {!removeQr && !qrFile && form.qrImage && (
              <label className="ml-3 text-sm text-primary-600 cursor-pointer hover:underline">
                Replace
                <input type="file" accept="image/*" className="hidden" onChange={onQrChange} />
              </label>
            )}
          </div>
        </section>

        {/* Impact */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Impact items</h2>
            <button
              type="button"
              onClick={() => addListItem('impactItems', emptyImpact)}
              className="text-sm text-primary-600 font-semibold inline-flex items-center gap-1"
            >
              <FiPlus /> Add
            </button>
          </div>
          {(form.impactItems || []).map((item, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2">
              <input
                value={item.title}
                onChange={(e) => updateListItem('impactItems', i, 'title', e.target.value)}
                placeholder="Title"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={item.description}
                onChange={(e) => updateListItem('impactItems', i, 'description', e.target.value)}
                placeholder="Description"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
              <button type="button" onClick={() => removeListItem('impactItems', i)} className="text-red-500 px-2">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </section>

        {/* Stats */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Stats</h2>
            <button
              type="button"
              onClick={() => addListItem('stats', emptyStat)}
              className="text-sm text-primary-600 font-semibold inline-flex items-center gap-1"
            >
              <FiPlus /> Add
            </button>
          </div>
          {(form.stats || []).map((item, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={item.value}
                onChange={(e) => updateListItem('stats', i, 'value', e.target.value)}
                placeholder="Value (e.g. 150+)"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={item.label}
                onChange={(e) => updateListItem('stats', i, 'label', e.target.value)}
                placeholder="Label"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
              <button type="button" onClick={() => removeListItem('stats', i)} className="text-red-500 px-2">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">FAQs</h2>
            <button
              type="button"
              onClick={() => addListItem('faqs', emptyFaq)}
              className="text-sm text-primary-600 font-semibold inline-flex items-center gap-1"
            >
              <FiPlus /> Add
            </button>
          </div>
          {(form.faqs || []).map((item, i) => (
            <div key={i} className="space-y-2 border border-gray-100 rounded-xl p-3">
              <div className="flex gap-2">
                <input
                  value={item.question}
                  onChange={(e) => updateListItem('faqs', i, 'question', e.target.value)}
                  placeholder="Question"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
                <button type="button" onClick={() => removeListItem('faqs', i)} className="text-red-500 px-2">
                  <FiTrash2 />
                </button>
              </div>
              <textarea
                rows={2}
                value={item.answer}
                onChange={(e) => updateListItem('faqs', i, 'answer', e.target.value)}
                placeholder="Answer"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </div>
          ))}
        </section>

        {/* Thank yous */}
        <section className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Thank-you quotes</h2>
            <button
              type="button"
              onClick={() => addListItem('thankYous', emptyThanks)}
              className="text-sm text-primary-600 font-semibold inline-flex items-center gap-1"
            >
              <FiPlus /> Add
            </button>
          </div>
          <input
            value={form.thankYouTitle || ''}
            onChange={(e) => setField('thankYouTitle', e.target.value)}
            placeholder="Post-donate thank you title"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <textarea
            rows={2}
            value={form.thankYouMessage || ''}
            onChange={(e) => setField('thankYouMessage', e.target.value)}
            placeholder="Post-donate thank you message"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          {(form.thankYous || []).map((item, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2">
              <input
                value={item.name}
                onChange={(e) => updateListItem('thankYous', i, 'name', e.target.value)}
                placeholder="Name"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={item.message}
                onChange={(e) => updateListItem('thankYous', i, 'message', e.target.value)}
                placeholder="Message"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
              <button type="button" onClick={() => removeListItem('thankYous', i)} className="text-red-500 px-2">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </section>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg disabled:opacity-60"
        >
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default DonateSettings;
