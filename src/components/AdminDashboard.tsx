
import React, { useState } from 'react';
import { SponsorApplication, ApprovedSponsor, SponsorLink, ManagedUrlConfig, CardBackground, CardBackgroundPack, SponsorTier, AppSkin, ThemeOverrides, BehaviorOverrides, BrandingAssets } from '../types';
import SponsorshipManager from './admin/SponsorshipManager';
import ThemeEditor from './admin/ThemeEditor';
import BehaviorEditor from './admin/BehaviorEditor';
import PromptEditor from './admin/PromptEditor';
import BrandingEditor from './admin/BrandingEditor';
import BackgroundManager from './admin/BackgroundManager';
import PackManager from './admin/PackManager';
import { SYSTEM_PROMPT_BASE_TEMPLATE } from '../constants';


interface AdminDashboardProps {
  pendingApplications: SponsorApplication[];
  approvedSponsors: ApprovedSponsor[];
  onApproveApplication: (
    applicationId: string, 
    radiusKm: number, 
    isGlobal: boolean, 
    startDate: string, 
    durationDays: number,
    companyName: string,
    contactEmail: string,
    linkType: SponsorLink['linkType'] | undefined,
    linkUrl: string | undefined,
    businessType: 'local' | 'online',
    businessCategory: string,
    tier: SponsorTier
  ) => void;
  onRejectApplication?: (applicationId: string) => void;
  onUpdateApprovedSponsor: (
    sponsorId: string, 
    newStartDate: string, 
    newDurationDays: number,
    newRadiusKm: number,
    newIsGlobal: boolean,
    newLinkType: SponsorLink['linkType'] | undefined,
    newLinkUrl: string | undefined,
    newTier: SponsorTier
  ) => void;
  onDeleteApprovedSponsor: (sponsorId: string) => void;
  managedUrlConfig: ManagedUrlConfig | null;
  onUpdateManagedUrl: (newConfig: ManagedUrlConfig) => void;
  cardBackgrounds: CardBackground[];
  onUpdateCardBackgrounds: (newBackgrounds: CardBackground[]) => void;
  cardBackgroundPacks: CardBackgroundPack[];
  onUpdateCardBackgroundPacks: (newPacks: CardBackgroundPack[]) => void;
  skin: AppSkin;
  onUpdateSkin: (newSkin: AppSkin) => void;
  themeOverrides: ThemeOverrides;
  onUpdateThemeOverrides: (newOverrides: ThemeOverrides) => void;
  behaviorOverrides: BehaviorOverrides;
  onUpdateBehaviorOverrides: (newOverrides: BehaviorOverrides) => void;
  systemPrompt: string;
  onUpdateSystemPrompt: (newPrompt: string) => void;
  brandingAssets: BrandingAssets;
  onUpdateBrandingAssets: (newAssets: BrandingAssets) => void;
}

type AdminTab = 'sponsorship' | 'appearance' | 'behavior';

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('sponsorship');

  const tabs: { id: AdminTab, label: string }[] = [
    { id: 'sponsorship', label: 'Sponsorship' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'behavior', label: 'Behavior & Prompts' },
  ];

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-120px)] bg-slate-50/70 dark:bg-slate-900/70 custom-scrollbar overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4 text-center">Admin Dashboard</h2>
      
      <div className="border-b border-gray-200/80 dark:border-slate-700/80 mb-6 flex justify-center">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="animate-fadeIn">
        {activeTab === 'sponsorship' && (
            <SponsorshipManager
                pendingApplications={props.pendingApplications}
                approvedSponsors={props.approvedSponsors}
                onApproveApplication={props.onApproveApplication}
                onRejectApplication={props.onRejectApplication}
                onUpdateApprovedSponsor={props.onUpdateApprovedSponsor}
                onDeleteApprovedSponsor={props.onDeleteApprovedSponsor}
            />
        )}
        {activeTab === 'appearance' && (
            <div className="space-y-6">
                 <BrandingEditor
                    assets={props.brandingAssets}
                    onUpdate={props.onUpdateBrandingAssets}
                />
                <section className="p-4 rounded-lg shadow-xl glass-secondary">
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">
                    Skin Management
                    </h3>
                    <div className="space-y-2">
                    <label htmlFor="skin-select" className="block text-sm font-medium text-theme-secondary">
                        Select App Skin
                    </label>
                    <select
                        id="skin-select"
                        value={props.skin}
                        onChange={(e) => props.onUpdateSkin(e.target.value as AppSkin)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/70 dark:border-slate-600/80 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white/70 dark:bg-slate-700/70 text-theme-primary"
                    >
                        <option value="default">Default</option>
                        <option value="noctis">Noctis</option>
                    </select>
                    </div>
                </section>
                <ThemeEditor 
                    overrides={props.themeOverrides}
                    onUpdate={props.onUpdateThemeOverrides}
                />
                <BackgroundManager
                    backgrounds={props.cardBackgrounds}
                    onUpdate={props.onUpdateCardBackgrounds}
                />
                <PackManager
                    allBackgrounds={props.cardBackgrounds}
                    packs={props.cardBackgroundPacks}
                    onUpdatePacks={props.onUpdateCardBackgroundPacks}
                />
            </div>
        )}
        {activeTab === 'behavior' && (
            <div className="space-y-6">
                <BehaviorEditor
                    overrides={props.behaviorOverrides}
                    onUpdate={props.onUpdateBehaviorOverrides}
                />
                <PromptEditor
                    prompt={props.systemPrompt}
                    onUpdate={props.onUpdateSystemPrompt}
                    defaultPrompt={SYSTEM_PROMPT_BASE_TEMPLATE}
                />
            </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
