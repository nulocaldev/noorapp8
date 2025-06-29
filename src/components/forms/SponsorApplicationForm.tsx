
import React, { useState } from 'react';
import { SponsorApplication, SponsorTier } from '../../types';

interface SponsorApplicationFormProps {
  onSubmit: (application: Omit<SponsorApplication, 'id' | 'status' | 'submittedAt'>) => void;
  onCancel?: () => void;
}

export const SponsorApplicationForm: React.FC<SponsorApplicationFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    businessType: 'local' as 'local' | 'online',
    businessCategory: '',
    linkType: 'visit' as 'visit' | 'call' | 'email',
    linkUrl: '',
    isGlobal: false,
    radiusKm: 10,
    tier: 'Bronze' as SponsorTier
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Sponsor Application</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email *
          </label>
          <input
            type="email"
            required
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Type
          </label>
          <select
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value as 'local' | 'online' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="local">Local Business</option>
            <option value="online">Online Business</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Category *
          </label>
          <input
            type="text"
            required
            value={formData.businessCategory}
            onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
            placeholder="e.g., Restaurant, Bookstore, Education"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link Type
          </label>
          <select
            value={formData.linkType}
            onChange={(e) => setFormData({ ...formData, linkType: e.target.value as 'visit' | 'call' | 'email' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="visit">Website Visit</option>
            <option value="call">Phone Call</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link URL *
          </label>
          <input
            type="url"
            required
            value={formData.linkUrl}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            placeholder="https://example.com or tel:+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sponsorship Tier
          </label>
          <select
            value={formData.tier}
            onChange={(e) => setFormData({ ...formData, tier: e.target.value as SponsorTier })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Bronze">Bronze - $50/month</option>
            <option value="Silver">Silver - $100/month</option>
            <option value="Gold">Gold - $200/month</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isGlobal"
            checked={formData.isGlobal}
            onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isGlobal" className="ml-2 block text-sm text-gray-900">
            Global sponsorship (visible to all users)
          </label>
        </div>

        {!formData.isGlobal && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius (km)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.radiusKm}
              onChange={(e) => setFormData({ ...formData, radiusKm: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Application
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SponsorApplicationForm;
