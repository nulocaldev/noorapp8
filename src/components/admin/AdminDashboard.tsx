
import React, { useState } from 'react';
import { SponsorApplication, ApprovedSponsor } from '../../types';

interface AdminDashboardProps {
  applications: SponsorApplication[];
  approvedSponsors: ApprovedSponsor[];
  onApproveApplication: (id: string) => void;
  onRejectApplication: (id: string, reason: string) => void;
  onRemoveSponsor: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  applications,
  approvedSponsors,
  onApproveApplication,
  onRejectApplication,
  onRemoveSponsor
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'sponsors'>('applications');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleReject = (id: string) => {
    if (rejectReason.trim()) {
      onRejectApplication(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Applications ({applications.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'sponsors'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active Sponsors ({approvedSponsors.length})
        </button>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Applications</h2>
          {applications.filter(app => app.status === 'pending').map((app) => (
            <div key={app.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{app.companyName}</h3>
                  <p className="text-gray-600">{app.contactEmail}</p>
                  <p className="text-sm text-gray-500">
                    {app.businessType} • {app.businessCategory}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tier: {app.tier} • {app.isGlobal ? 'Global' : `${app.radiusKm}km radius`}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => onApproveApplication(app.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(app.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  {rejectingId === app.id && (
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReject(app.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason('');
                          }}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sponsors Tab */}
      {activeTab === 'sponsors' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Sponsors</h2>
          {approvedSponsors.map((sponsor) => (
            <div key={sponsor.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{sponsor.companyName}</h3>
                  <p className="text-gray-600">{sponsor.contactEmail}</p>
                  <p className="text-sm text-gray-500">
                    {sponsor.businessType} • {sponsor.businessCategory}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Tier: {sponsor.tier}
                  </p>
                  <p className="text-sm text-gray-500">
                    {sponsor.isGlobal ? 'Global' : `${sponsor.radiusKm}km radius`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Clicks: {sponsor.clickCount}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => onRemoveSponsor(sponsor.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
