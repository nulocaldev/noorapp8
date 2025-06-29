
import React from 'react';
import MenuIcon from './icons/MenuIcon.tsx';
import CloseIcon from './icons/CloseIcon.tsx';
import LanguageIcon from './icons/LanguageIcon.tsx';
import SunIcon from './icons/SunIcon.tsx';
import MoonIcon from './icons/MoonIcon.tsx';
import DesktopIcon from './icons/DesktopIcon.tsx';
import GalleryIcon from './icons/GalleryIcon.tsx';
import { Theme } from '../App.tsx'; 

export type AppView = 'userDataForm' | 'adminLogin' | 'chat' | 'sponsorApplication' | 'adminDashboard' | 'hikmahGallery';

interface NavigationBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  hasPendingSponsorApplications?: boolean; 
  isAdminAuthenticated: boolean; 
  showMenuButton?: boolean; 
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenLanguageModal: () => void;
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
  userDataAvailable: boolean; // To conditionally show gallery
}

const NavigationBar: React.FC<NavigationBarProps> = ({ 
    currentView, 
    onNavigate, 
    hasPendingSponsorApplications, 
    isAdminAuthenticated,
    showMenuButton,
    onToggleSidebar,
    isSidebarOpen,
    onOpenLanguageModal,
    currentTheme,
    onChangeTheme,
    userDataAvailable
}) => {
  const navItemsBase: { view: AppView; label: string; icon?: React.FC<{className?: string}> }[] = [
    { view: 'chat', label: 'Chat' },
    { view: 'hikmahGallery', label: 'Gallery', icon: GalleryIcon },
    { view: 'sponsorApplication', label: 'Sponsor myNoor App' },
  ];

  const adminNavItem: { view: AppView; label: string } = { view: 'adminDashboard', label: 'Admin' };
  
  let navItems = userDataAvailable ? navItemsBase : navItemsBase.filter(item => item.view === 'sponsorApplication'); 
  if (isAdminAuthenticated) {
    navItems = [...navItems.filter(item => item.view !== 'sponsorApplication'), adminNavItem];
  }


  const themeOptions: { value: Theme; label: string; icon: React.FC<{className?: string}> }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'auto', label: 'System', icon: DesktopIcon },
  ];

  return (
    <nav className="sticky top-0 z-20 glass-primary shadow-md">
      <div className="container mx-auto flex justify-between items-center px-2 sm:px-4 py-2">
        <div className="flex-shrink-0">
          {showMenuButton && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-theme-secondary hover:bg-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden
                         dark:hover:bg-slate-700/50 dark:focus:ring-slate-500"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          )}
        </div>
        
        <div className="flex justify-center items-center space-x-1 sm:space-x-2 flex-grow">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 relative flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                ${currentView === item.view
                  ? 'btn-accent text-white'
                  : 'text-theme-secondary hover:bg-gray-200/60 hover:text-theme-primary dark:hover:bg-slate-700/60 dark:hover:text-slate-100'
                }`}
              aria-current={currentView === item.view ? 'page' : undefined}
            >
              {item.icon && <item.icon className="w-4 h-4 hidden sm:inline-block" />}
              <span>{item.label}</span>
              {item.view === 'adminDashboard' && hasPendingSponsorApplications && isAdminAuthenticated && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-800"></span>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {currentView === 'chat' && userDataAvailable && (
            <button
              onClick={onOpenLanguageModal}
              className="p-2 rounded-full text-theme-secondary hover:bg-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:hover:bg-slate-700/50 dark:focus:ring-slate-500"
              title="Change Language"
              aria-label="Change preferred language"
            >
              <LanguageIcon className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center p-0.5 bg-gray-100/70 dark:bg-slate-700/70 rounded-full">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChangeTheme(opt.value)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-0 
                            ${currentTheme === opt.value 
                                ? 'bg-white/80 text-blue-600 shadow-sm dark:bg-slate-600/80 dark:text-blue-400 dark:shadow-inner focus:ring-blue-500' // Current theme button uses blue
                                : 'text-theme-secondary hover:text-theme-primary focus:ring-gray-400'}`}
                title={`Set theme to ${opt.label}`}
                aria-pressed={currentTheme === opt.value}
              >
                <opt.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ))}
          </div>
           {showMenuButton && currentView !== 'chat' && <div className="w-8 md:hidden"></div>}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
