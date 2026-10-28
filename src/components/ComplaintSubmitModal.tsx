import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Paperclip,
  Shield,
  MapPin,
  Building2,
  FolderKanban,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  EyeOff,
} from 'lucide-react';
import {
  ComplaintCategory,
  COMPLAINT_CATEGORIES,
  DEPARTMENTS,
} from '../types';
import { storageService } from '../services/storage';
import { suggestCategoryAndDepartment } from '../utils/grievance-rules';

interface ComplaintSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (complaintId: string) => void;
}

const SAMPLE_LOCATIONS = [
  'Block A - Room 104',
  'Science Block - 3rd Floor Lab',
  'Central Library - 2nd Floor Study Room',
  'Girls Hostel - Wing B Washrooms',
  'Boys Hostel - Block 2 Common Area',
  'Main Academic Complex - LH-201',
  'Campus Cafeteria & Food Court',
  'North Gate Parking Lot',
];

export const ComplaintSubmitModal: React.FC<ComplaintSubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Infrastructure');
  const [department, setDepartment] = useState<string>('Facilities & Maintenance');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const [aiSuggestions, setAiSuggestions] = useState<{
    category: ComplaintCategory;
    department: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    reasoning: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAiAutoTriage = () => {
    const combinedText = `${title} ${description}`;
    if (combinedText.trim().length < 5) {
      setErrors({ description: 'Type a brief summary of the issue first so AI can analyze it.' });
      return;
    }

    const suggestion = suggestCategoryAndDepartment(combinedText);
    setAiSuggestions({
      category: suggestion.suggestedCategory,
      department: suggestion.suggestedDepartment,
      priority: suggestion.suggestedPriority,
      reasoning: suggestion.reasoning,
    });

    setCategory(suggestion.suggestedCategory);
    setDepartment(suggestion.suggestedDepartment);
    setPriority(suggestion.suggestedPriority);
    setErrors({});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Image file size should be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = storageService.submitComplaint({
      title,
      description,
      category,
      department,
      location,
      imageUrl,
      isAnonymous,
      priority,
    });

    setIsSubmitting(false);

    if (!result.success && result.errors) {
      setErrors(result.errors);
    } else if (result.success && result.complaint) {
      onSubmitSuccess(result.complaint.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FolderKanban className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 id="submit-modal-title" className="text-lg font-bold tracking-tight">
                Submit Campus Grievance
              </h2>
              <p className="text-xs text-blue-100">
                Report personal or campus-related issues for official review and resolution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Anonymity Shield Banner */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Shield className={`w-5 h-5 shrink-0 mt-0.5 ${isAnonymous ? 'text-emerald-600' : 'text-blue-600'}`} />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Report Anonymously
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  When enabled, your name, student ID, and college email are strictly redacted and hidden from college administrators and assigned departments.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAnonymous}
              aria-label="Toggle anonymous grievance submission"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                isAnonymous ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isAnonymous ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="complaint-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Grievance Title <span className="text-red-500">*</span>
            </label>
            <input
              id="complaint-title"
              type="text"
              required
              placeholder="e.g. Broken laboratory AC causing equipment overheating"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                errors.title ? 'border-red-500' : 'border-slate-300'
              } focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="complaint-desc" className="block text-xs font-semibold text-slate-700">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiAutoTriage}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                AI Auto-Detect Category & Dept
              </button>
            </div>
            <textarea
              id="complaint-desc"
              rows={4}
              required
              placeholder="Describe the issue, when it started, how it impacts students, and any previous attempts to get it fixed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                errors.description ? 'border-red-500' : 'border-slate-300'
              } focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}

            {/* AI Assistant Insight pill */}
            {aiSuggestions && (
              <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">CampusVoice AI Analysis:</span> {aiSuggestions.reasoning}
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px]">
                    <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      Category: {aiSuggestions.category}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      Department: {aiSuggestions.department}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      Priority: {aiSuggestions.priority}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category & Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="complaint-category" className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="complaint-department" className="block text-xs font-semibold text-slate-700 mb-1">
                Concerned Department <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Quick Presets */}
          <div>
            <label htmlFor="complaint-location" className="block text-xs font-semibold text-slate-700 mb-1">
              Exact Location / Room / Campus Area <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="complaint-location"
                type="text"
                required
                placeholder="e.g. Science Block, Room 302 or Central Cafeteria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border ${
                  errors.location ? 'border-red-500' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}

            {/* Quick location chips */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 self-center">Presets:</span>
              {SAMPLE_LOCATIONS.slice(0, 4).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urgency / Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    priority === p
                      ? p === 'Critical'
                        ? 'bg-red-600 text-white border-red-600'
                        : p === 'High'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Image Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Photo / Supporting Evidence
            </label>
            {imageUrl ? (
              <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Complaint preview" className="h-28 w-48 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => setImageUrl(undefined)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span>Attach Photo / Screenshot (Max 3MB)</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAnonymous ? 'Submit Anonymously' : 'Submit Official Grievance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
