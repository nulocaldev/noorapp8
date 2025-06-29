
import React, { useState, useRef, useEffect } from 'react';
import { UnlockedWisdomCard, CardBackground, ManagedUrlConfig, UnlockedAchievementCard, ReflectionCard, CardBackgroundPack, BookmarkedHadith, BookmarkedAyah } from '../types';
import { MEMORABLE_URL_BASE_DISPLAY, INITIAL_CARD_BACKGROUNDS } from '../constants';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import DownloadIcon from './icons/DownloadIcon';
import PaletteIcon from './icons/PaletteIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import SparklesIcon from './icons/SparklesIcon';
import SquareIcon from './icons/SquareIcon';
import PortraitIcon from './icons/PortraitIcon';
import LandscapeIcon from './icons/LandscapeIcon';
import PortraitTallIcon from './icons/PortraitTallIcon';
import TrophyIcon from './icons/TrophyIcon'; 
import LightBulbIcon from './icons/LightBulbIcon'; 
import JournalIcon from './icons/JournalIcon'; // New Icon
import { getTodayISOString } from '../utils/dateUtils';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer';
import CardBackgroundDisplay from './CardBackgroundDisplay';
import BookmarkFilledIcon from './icons/BookmarkFilledIcon';
import BookOpenIcon from './icons/BookOpenIcon';


type AspectRatioOption = 'auto' | '1:1' | '4:5' | '9:16' | '16:9';
type GalleryView = 'wisdom' | 'achievements' | 'reflections' | 'hadith' | 'quran_bookmarks' | 'store';

interface TakeawayCaptureConfig {
  aspectRatio: AspectRatioOption;
  width: number;
}

const aspectRatioOptions: {label: string, value: AspectRatioOption, icon: React.FC<{className?: string}>, captureWidth: number }[] = [
    { label: 'Auto', value: 'auto', icon: () => <span className="text-xs">Auto</span>, captureWidth: 360 },
    { label: '1:1', value: '1:1', icon: SquareIcon, captureWidth: 360 }, 
    { label: '4:5', value: '4:5', icon: PortraitIcon, captureWidth: 320 },
    { label: '9:16', value: '9:16', icon: PortraitTallIcon, captureWidth: 320 }, 
    { label: '16:9', value: '16:9', icon: LandscapeIcon, captureWidth: 480 },
];

interface HikmahGalleryProps {
  cardBackgrounds: CardBackground[]; 
  cardBackgroundPacks: CardBackgroundPack[];
  unlockedWisdomCards: UnlockedWisdomCard[];
  unlockedCardBackgroundIds: string[];
  unlockedPackIds: string[];
  onUnlockBackground: (backgroundId: string) => void; 
  onUnlockPack: (packId: string) => void;
  
  unlockedAchievementCards: UnlockedAchievementCard[]; 
  unlockedActivityBackgroundIds: string[]; 
  onUnlockActivityBackground: (backgroundId: string) => void; 

  unlockedReflectionCards: ReflectionCard[];
  onGenerateReflection: (date: string) => Promise<void>;
  isLoadingReflection: boolean;
  reflectionError: string | null;

  bookmarkedHadiths: BookmarkedHadith[];
  bookmarkedAyahs: BookmarkedAyah[];

  hikmahPoints: number;
  managedUrlConfig: ManagedUrlConfig | null;
}

const HikmahGallery: React.FC<HikmahGalleryProps> = ({ 
  cardBackgrounds,
  cardBackgroundPacks,
  unlockedWisdomCards, 
  unlockedCardBackgroundIds, 
  unlockedPackIds,
  onUnlockBackground,
  onUnlockPack,
  unlockedAchievementCards,
  unlockedActivityBackgroundIds,
  onUnlockActivityBackground,
  unlockedReflectionCards,
  onGenerateReflection,
  isLoadingReflection,
  reflectionError,
  bookmarkedHadiths,
  bookmarkedAyahs,
  hikmahPoints,
  managedUrlConfig
}) => {
  const [currentGalleryView, setCurrentGalleryView] = useState<GalleryView>('wisdom');
  const [selectedItemToDownload, setSelectedItemToDownload] = useState<UnlockedWisdomCard | UnlockedAchievementCard | ReflectionCard | BookmarkedHadith | BookmarkedAyah | null>(null);
  const [selectedBgForDownload, setSelectedBgForDownload] = useState<CardBackground>(() => cardBackgrounds[0] || INITIAL_CARD_BACKGROUNDS[0]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [galleryCaptureConfig, setGalleryCaptureConfig] = useState<TakeawayCaptureConfig>({ aspectRatio: 'auto', width: 360 });

  const getItemTypeForDownload = (item: UnlockedWisdomCard | UnlockedAchievementCard | ReflectionCard | BookmarkedHadith | BookmarkedAyah | null): 'wisdom' | 'achievement' | 'reflection' | 'hadith' | 'quran' | null => {
    if (!item) return null;
    if ('takeaway' in item) return 'wisdom';
    if ('activityType' in item) return 'achievement';
    if ('date' in item && 'content' in item) return 'reflection';
    if ('source' in item && 'content' in item) return 'hadith';
    if ('verse_key' in item) return 'quran';
    return null;
  };
  const itemTypeForDownload = getItemTypeForDownload(selectedItemToDownload);


  useEffect(() => {
    if (selectedItemToDownload) {
      // Use the dynamic live URL as the default, overridden by managed config if available.
      let qrUrlToEncode = window.location.origin + window.location.pathname;
      if (managedUrlConfig && managedUrlConfig.targetUrl && managedUrlConfig.targetUrl.trim() !== '') {
        qrUrlToEncode = managedUrlConfig.targetUrl;
      }
      QRCode.toDataURL(qrUrlToEncode, { width: 70, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#000000FF', light: '#FFFFFF00' }})
        .then(url => setQrCodeDataUrl(url))
        .catch(err => { console.error('Failed to generate QR code:', err); setQrCodeDataUrl(null); });
      
      setGalleryCaptureConfig({ aspectRatio: 'auto', width: 360 });
      
      const currentUnlockedBgs = itemTypeForDownload === 'achievement' ? unlockedActivityBackgroundIds : unlockedCardBackgroundIds;
      const defaultOrFirstUnlocked = cardBackgrounds.find(bg => currentUnlockedBgs.includes(bg.id)) || cardBackgrounds.find(bg => bg.cost === 0) || cardBackgrounds[0] || INITIAL_CARD_BACKGROUNDS[0];
      setSelectedBgForDownload(defaultOrFirstUnlocked);
    }
  }, [selectedItemToDownload, managedUrlConfig, itemTypeForDownload, unlockedCardBackgroundIds, unlockedActivityBackgroundIds, cardBackgrounds]);

  const handlePrepareDownload = (item: UnlockedWisdomCard | UnlockedAchievementCard | ReflectionCard | BookmarkedHadith | BookmarkedAyah) => {
    setSelectedItemToDownload(item);
  };

  const triggerDownload = (canvas: HTMLCanvasElement, filename: string) => { 
    const image = canvas.toDataURL('image/png'); const link = document.createElement('a');
    link.href = image; link.download = filename; document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
  };

  const handleDownloadCardAsPng = async () => {
    const node = cardRef.current;
    if (!node || !qrCodeDataUrl || !selectedItemToDownload || !itemTypeForDownload) return;
    try {
        const canvas = await html2canvas(node, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null, // Use transparent background
            scale: 2, // Increase resolution
        });
        triggerDownload(canvas, `NoorApp_${itemTypeForDownload}_${Date.now()}.png`);
    } catch (error) {
        console.error("Error generating image with html2canvas:", error);
        alert("Sorry, there was an error generating the image. Please try again.");
    }
    setSelectedItemToDownload(null);
  };
  
  let cardAttributionText = "- MyNoor App";
  if (managedUrlConfig?.slug && managedUrlConfig.slug.trim() !== '') {
      cardAttributionText += ` | ${MEMORABLE_URL_BASE_DISPLAY}/${managedUrlConfig.slug.trim()}`;
  }

  const renderCardContentForDownload = () => {
    if (!selectedItemToDownload || !itemTypeForDownload) return null;
    
    const textWrapperStyle = { color: 'var(--card-text-color, #1f2937)' };
    const detailTextClass = "text-sm mt-1";
    const attributionClass = "text-xs mt-2 opacity-90";

    switch(itemTypeForDownload) {
        case 'wisdom': {
            const wisdomCard = selectedItemToDownload as UnlockedWisdomCard;
            return (
                <div style={textWrapperStyle} className="text-center">
                    <div className="card-main-text text-base font-medium leading-snug">
                        <div className="[&_p]:text-center">
                            <MarkdownRenderer content={`“${wisdomCard.takeaway.text}”`} theme={'light'} />
                        </div>
                    </div>
                    <p className={`card-attribution ${attributionClass}`} style={{color: 'var(--card-attribution-color, #4b5563)'}}>{cardAttributionText}</p>
                </div>
            );
        }
        case 'achievement': {
            const achievementCard = selectedItemToDownload as UnlockedAchievementCard;
            return (
                <div className="flex flex-col items-center justify-center h-full text-center" style={textWrapperStyle}>
                    <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="text-xl font-bold">{achievementCard.activityTitle}</p>
                    <p className={detailTextClass}>{achievementCard.originalSuggestionText}</p>
                    <p className="text-2xl font-bold my-2">{achievementCard.score}/{achievementCard.maxScore}</p>
                    <p className={`card-attribution ${attributionClass}`} style={{color: 'var(--card-attribution-color, #4b5563)'}}>{cardAttributionText}</p>
                </div>
            );
        }
        case 'reflection': {
             const reflectionCard = selectedItemToDownload as ReflectionCard;
             return (
                 <div style={textWrapperStyle} className="text-center">
                    <p className={`card-attribution text-xs mb-2`} style={{color: 'var(--card-attribution-color, #4b5563)'}}>
                        Reflection for {new Date(reflectionCard.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    </p>
                    <div className="card-main-text text-sm leading-snug">
                       <div className="[&_p]:text-center">
                            <MarkdownRenderer content={reflectionCard.content} theme={'light'} />
                        </div>
                    </div>
                    <p className={`card-attribution ${attributionClass} mt-4`} style={{color: 'var(--card-attribution-color, #4b5563)'}}>{cardAttributionText}</p>
                 </div>
             );
        }
        case 'hadith': {
            const hadithCard = selectedItemToDownload as BookmarkedHadith;
            return (
                 <div className="text-center" style={textWrapperStyle}>
                    <h5 className="font-bold mb-2 text-lg">{hadithCard.title}</h5>
                    <div className="card-main-text text-sm leading-snug text-inherit max-w-full">
                       <div className="[&_p]:text-center">
                            <MarkdownRenderer content={hadithCard.content} theme={'light'} />
                       </div>
                    </div>
                    <p className="card-attribution text-xs italic mt-4 text-center w-full px-1" style={{color: 'var(--card-attribution-color, #4b5563)'}}>{hadithCard.source}</p>
                    <p className={`card-attribution ${attributionClass}`} style={{color: 'var(--card-attribution-color, #4b5563)'}}>{cardAttributionText}</p>
                 </div>
            );
        }
        case 'quran': {
            const ayahCard = selectedItemToDownload as BookmarkedAyah;
            return (
                 <div className="text-center" style={textWrapperStyle}>
                    <p className="font-bold mb-2 text-lg text-inherit font-mono" dir="rtl">{ayahCard.text_uthmani}</p>
                    <div className="card-main-text text-sm leading-snug text-inherit max-w-full italic">
                        <div className="[&_p]:text-center">
                           <MarkdownRenderer content={`“${ayahCard.translation}”`} theme={'light'} />
                        </div>
                    </div>
                    <p className="card-attribution text-sm font-semibold mt-4 text-center w-full px-1" style={{color: 'var(--card-attribution-color, #4b5563)'}}>Quran {ayahCard.verse_key}</p>
                    <p className={`card-attribution ${attributionClass}`} style={{color: 'var(--card-attribution-color, #4b5563)'}}>{cardAttributionText}</p>
                 </div>
            );
        }
    }
  };

  const renderWisdomCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {unlockedWisdomCards.map(card => (
        <div key={card.id} className="p-4 rounded-xl shadow-lg glass-secondary flex flex-col justify-between">
          <div className="flex-grow">
            <LightBulbIcon className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-sm text-theme-primary italic">“{card.takeaway.text}”</p>
          </div>
          <button onClick={() => handlePrepareDownload(card)} className="mt-4 w-full text-xs px-3 py-2 rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 btn-accent flex items-center justify-center space-x-2">
            <DownloadIcon className="w-4 h-4" />
            <span>Share Card</span>
          </button>
        </div>
      ))}
    </div>
  );
  
  const renderBookmarkedHadiths = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {bookmarkedHadiths.map(card => (
        <div key={card.id} className="p-4 rounded-xl shadow-lg glass-secondary flex flex-col justify-between">
          <div className="flex-grow">
            <BookmarkFilledIcon className="w-6 h-6 text-yellow-500 mb-2" />
            <p className="font-semibold text-sm text-theme-primary mb-1">{card.title}</p>
            <p className="text-sm text-theme-secondary italic line-clamp-3">“{card.content}”</p>
            <p className="text-xs text-right text-theme-secondary opacity-80 mt-2">{card.source}</p>
          </div>
          <button onClick={() => handlePrepareDownload(card)} className="mt-4 w-full text-xs px-3 py-2 rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 btn-accent flex items-center justify-center space-x-2">
            <DownloadIcon className="w-4 h-4" />
            <span>Share Card</span>
          </button>
        </div>
      ))}
    </div>
  );

  const renderBookmarkedAyahs = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {bookmarkedAyahs.map(card => (
            <div key={card.id} className="p-4 rounded-xl shadow-lg glass-secondary flex flex-col justify-between">
                <div className="flex-grow">
                    <BookOpenIcon className="w-6 h-6 text-cyan-500 mb-2" />
                    <p className="font-semibold text-sm text-theme-primary mb-1 font-mono text-right" dir="rtl">{card.text_uthmani}</p>
                    <p className="text-sm text-theme-secondary italic line-clamp-3 mt-2">“{card.translation}”</p>
                    <p className="text-xs text-right text-theme-secondary opacity-80 mt-2 font-semibold">Quran {card.verse_key}</p>
                </div>
                <button onClick={() => handlePrepareDownload(card)} className="mt-4 w-full text-xs px-3 py-2 rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 btn-accent flex items-center justify-center space-x-2">
                    <DownloadIcon className="w-4 h-4" />
                    <span>Share Ayah</span>
                </button>
            </div>
        ))}
    </div>
  );

  const renderAchievementCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {unlockedAchievementCards.map(card => (
        <div key={card.id} className="p-4 rounded-xl shadow-lg glass-secondary flex flex-col justify-between text-center">
          <div className="flex-grow">
            <TrophyIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-theme-primary">{card.activityTitle}</p>
            <p className="text-xs text-theme-secondary">{card.activityTopic}</p>
            <p className="text-xl font-bold text-theme-primary my-2">{card.score}/{card.maxScore}</p>
            <p className="text-xs text-purple-500 dark:text-purple-400 font-semibold">+{card.pointsEarned} Hikmah Points</p>
          </div>
          <button onClick={() => handlePrepareDownload(card)} className="mt-4 w-full text-xs px-3 py-2 rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 btn-accent flex items-center justify-center space-x-2">
            <DownloadIcon className="w-4 h-4" />
            <span>Share Achievement</span>
          </button>
        </div>
      ))}
    </div>
  );

  const renderReflectionCards = () => {
    const today = getTodayISOString();
    const hasTodayReflection = unlockedReflectionCards.some(r => r.date === today);

    return (
      <div>
        <div className="mb-6 p-4 rounded-xl glass-secondary text-center">
          <h3 className="text-lg font-semibold text-theme-primary">Daily Reflection</h3>
          <p className="text-sm text-theme-secondary mt-1 mb-3">Generate a unique reflection based on your day's journey with Noor.</p>
          {reflectionError && <p className="text-xs text-red-500 dark:text-red-400 mb-2">{reflectionError}</p>}
          <button
            onClick={() => onGenerateReflection(today)}
            disabled={isLoadingReflection || hasTodayReflection}
            className="w-full sm:w-auto text-sm px-6 py-2.5 rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 btn-accent flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingReflection ? <LoadingSpinner /> : <JournalIcon className="w-5 h-5" />}
            <span>{hasTodayReflection ? "Today's Reflection Generated" : "Generate Today's Reflection"}</span>
          </button>
        </div>
        {unlockedReflectionCards.length === 0 && !isLoadingReflection && (
          <p className="text-center text-theme-secondary italic">Your unlocked daily reflections will appear here.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {isLoadingReflection && (
            <div className="p-4 rounded-xl shadow-lg glass-secondary">
                <div className="space-y-3">
                    <div className="skeleton-loader h-4 w-1/3 mb-3"></div>
                    <div className="skeleton-loader h-4 w-full"></div>
                    <div className="skeleton-loader h-4 w-full mt-2"></div>
                    <div className="skeleton-loader h-4 w-2/3 mt-2"></div>
                </div>
            </div>
          )}
          {unlockedReflectionCards.map(card => (
            <div key={card.id} className="p-4 rounded-xl shadow-lg glass-secondary flex flex-col justify-between">
              <div className="flex-grow">
                <p className="text-xs font-semibold text-theme-secondary mb-2">{new Date(card.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                <div className="prose prose-sm dark:prose-invert max-w-none text-inherit"><MarkdownRenderer content={card.content} theme={'light'} /></div>
              </div>
              <button onClick={() => handlePrepareDownload(card)} className="mt-4 w-full text-xs px-3 py-2 rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 btn-accent flex items-center justify-center space-x-2">
                <DownloadIcon className="w-4 h-4" />
                <span>Share Reflection</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderStore = () => {
    const allUnlockedIds = [...unlockedCardBackgroundIds, ...unlockedActivityBackgroundIds];

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-semibold text-theme-primary mb-4">Background Packs</h3>
                {cardBackgroundPacks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {cardBackgroundPacks.map(pack => {
                            const isOwned = unlockedPackIds.includes(pack.id);
                            const unlockCount = pack.unlockCount || 0;
                            const isSoldOut = pack.limit !== null && unlockCount >= pack.limit;
                            const remaining = pack.limit !== null ? pack.limit - unlockCount : null;
                            return (
                                <div key={pack.id} className="p-4 rounded-xl shadow-lg glass-secondary flex flex-col">
                                    <img src={pack.coverImageUrl} alt={`${pack.name} cover`} className="w-full h-32 object-cover rounded-lg mb-3 shadow-md"/>
                                    <h4 className="font-semibold text-theme-primary">{pack.name}</h4>
                                    <p className="text-xs text-theme-secondary flex-grow mb-2">{pack.description}</p>
                                    <p className={`text-xs font-semibold mb-2 ${remaining !== null && remaining <= 10 && !isSoldOut ? 'text-red-500' : 'text-theme-secondary'}`}>
                                        {isSoldOut ? 'Sold Out' : (pack.limit === null ? 'Infinite' : `${remaining} of ${pack.limit} Left`)}
                                    </p>
                                    <div className="flex items-center space-x-1 mb-3">
                                        {pack.backgroundIds.slice(0, 5).map(bgId => {
                                            const bg = cardBackgrounds.find(b => b.id === bgId);
                                            return bg ? <div key={bg.id} className="w-6 h-6 rounded-full overflow-hidden border-2 border-white/20 dark:border-black/20"><CardBackgroundDisplay background={bg} /></div> : null;
                                        })}
                                        {pack.backgroundIds.length > 5 && <div className="text-xs text-theme-secondary ml-1">+{pack.backgroundIds.length - 5} more</div>}
                                    </div>
                                    <button onClick={() => !isOwned && !isSoldOut && onUnlockPack(pack.id)} disabled={isOwned || isSoldOut} className="w-full text-xs px-3 py-2 rounded-md btn-accent flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-default disabled:bg-gray-500 dark:disabled:bg-slate-600">
                                        {isOwned ? <span>Owned</span> : (isSoldOut ? <span>Sold Out</span> : <><SparklesIcon className="w-4 h-4"/><span>Unlock for {pack.cost}</span></>)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : <p className="text-center text-theme-secondary italic">No background packs available right now.</p>}
            </div>
             <div>
                <h3 className="text-2xl font-semibold text-theme-primary mb-4">Individual Backgrounds</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {cardBackgrounds.map(bg => {
                        const isOwned = allUnlockedIds.includes(bg.id);
                        const unlockCount = bg.unlockCount || 0;
                        const isSoldOut = bg.limit !== null && unlockCount >= bg.limit;
                        const remaining = bg.limit !== null ? bg.limit - unlockCount : null;
                        return (
                            <div key={bg.id} className="flex flex-col items-center">
                                <div className="w-full h-24 rounded-lg overflow-hidden shadow-md mb-2">
                                    <CardBackgroundDisplay background={bg}/>
                                </div>
                                <p className="text-sm font-medium text-theme-primary text-center truncate w-full" title={bg.name}>{bg.name}</p>
                                <p className={`text-xs text-center ${remaining !== null && remaining <= 10 && !isSoldOut ? 'text-red-500 font-bold' : 'text-theme-secondary'}`}>
                                    {isSoldOut ? 'Sold Out' : (bg.limit === null ? 'Infinite' : `Left: ${remaining}`)}
                                </p>
                                <button onClick={() => !isOwned && !isSoldOut && onUnlockBackground(bg.id)} disabled={isOwned || isSoldOut} className="w-full mt-1 text-xs px-2 py-1.5 rounded-md btn-accent flex items-center justify-center space-x-1.5 disabled:opacity-70 disabled:cursor-default disabled:bg-gray-500 dark:disabled:bg-slate-600">
                                    {isOwned ? <span>Owned</span> : (isSoldOut ? <span>Sold Out</span> : (bg.cost > 0 ? <><SparklesIcon className="w-3 h-3"/><span>{bg.cost}</span></> : <span>Free</span>)) }
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  };

  const galleryViews = [
    { id: 'wisdom', label: 'Wisdom Cards', icon: LightBulbIcon, count: unlockedWisdomCards.length },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon, count: unlockedAchievementCards.length },
    { id: 'reflections', label: 'Reflections', icon: JournalIcon, count: unlockedReflectionCards.length },
    { id: 'hadith', label: 'Hadith', icon: BookmarkFilledIcon, count: bookmarkedHadiths.length },
    { id: 'quran_bookmarks', label: 'Quran', icon: BookOpenIcon, count: bookmarkedAyahs.length },
    { id: 'store', label: 'Store', icon: SparklesIcon, count: cardBackgrounds.length + cardBackgroundPacks.length },
  ];

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-120px)] bg-slate-50/70 dark:bg-slate-900/70 custom-scrollbar overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gradient-accent">Hikmah Gallery</h2>
        <p className="text-theme-secondary mt-1">A collection of your unlocked wisdom, achievements, and reflections.</p>
        <div className="inline-flex items-center text-lg font-semibold text-purple-600 dark:text-purple-300 mt-3 bg-purple-100/50 dark:bg-purple-900/30 px-4 py-1.5 rounded-full shadow-inner">
          <SparklesIcon className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
          {hikmahPoints} Hikmah Points
        </div>
      </div>

      <div className="flex justify-center flex-wrap mb-6 border-b border-gray-300/50 dark:border-slate-700/50">
        {galleryViews.map(view => (
          <button
            key={view.id}
            onClick={() => setCurrentGalleryView(view.id as GalleryView)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200
              ${currentGalleryView === view.id
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-theme-secondary hover:text-theme-primary'
              }`}
          >
            <view.icon className="w-5 h-5" />
            <span>{view.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${currentGalleryView === view.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-200 dark:bg-slate-700'}`}>{view.count}</span>
          </button>
        ))}
      </div>

      <div className="animate-fadeIn">
        {currentGalleryView === 'wisdom' && (unlockedWisdomCards.length > 0 ? renderWisdomCards() : <p className="text-center text-theme-secondary italic">Your unlocked wisdom cards will appear here.</p>)}
        {currentGalleryView === 'achievements' && (unlockedAchievementCards.length > 0 ? renderAchievementCards() : <p className="text-center text-theme-secondary italic">Your unlocked achievements will appear here.</p>)}
        {currentGalleryView === 'reflections' && renderReflectionCards()}
        {currentGalleryView === 'hadith' && (bookmarkedHadiths.length > 0 ? renderBookmarkedHadiths() : <p className="text-center text-theme-secondary italic">Your bookmarked Hadiths will appear here.</p>)}
        {currentGalleryView === 'quran_bookmarks' && (bookmarkedAyahs.length > 0 ? renderBookmarkedAyahs() : <p className="text-center text-theme-secondary italic">Your bookmarked Quran ayahs will appear here.</p>)}
        {currentGalleryView === 'store' && renderStore()}
      </div>

      {selectedItemToDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 dark:bg-opacity-80 animate-fadeIn">
          <div className="p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar glass-primary flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex items-center justify-center p-2 bg-gray-200/50 dark:bg-slate-900/50 rounded-lg">
                <div 
                    ref={cardRef} 
                    className="relative text-black dark:text-slate-800 p-6 overflow-hidden flex flex-col justify-center items-center shadow-lg" 
                    style={{
                        width: `${galleryCaptureConfig.width}px`, 
                        aspectRatio: galleryCaptureConfig.aspectRatio === 'auto' ? undefined : galleryCaptureConfig.aspectRatio.replace(':', ' / '),
                        minHeight: galleryCaptureConfig.aspectRatio === 'auto' ? '180px' : undefined,
                        '--card-text-color': selectedBgForDownload.tier === 'Legendary' || selectedBgForDownload.tier === 'Epic' ? '#f8fafc' : '#1f2937',
                        '--card-attribution-color': selectedBgForDownload.tier === 'Legendary' || selectedBgForDownload.tier === 'Epic' ? '#cbd5e1' : '#4b5563',
                    } as React.CSSProperties}
                >
                    <div className="absolute inset-0 -z-10">
                        <CardBackgroundDisplay background={selectedBgForDownload} />
                    </div>
                    {renderCardContentForDownload()}
                    {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="absolute bottom-2 right-2 w-12 h-12 mix-blend-multiply opacity-80" />}
                </div>
            </div>
            <div className="w-full md:w-64 flex-shrink-0 space-y-4">
              <h3 className="text-lg font-semibold text-theme-primary">Share Options</h3>
              
              <div>
                <label className="text-sm font-medium text-theme-secondary">Aspect Ratio</label>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {aspectRatioOptions.map(opt => (
                    <button key={opt.value} onClick={() => setGalleryCaptureConfig({ aspectRatio: opt.value, width: opt.captureWidth })}
                            className={`p-2 rounded-md border text-xs flex justify-center items-center ${galleryCaptureConfig.aspectRatio === opt.value ? 'bg-blue-500/80 text-white' : 'bg-white/70 hover:bg-gray-100/70 dark:bg-slate-700/70 dark:hover:bg-slate-600/70'}`}>
                      <opt.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-theme-secondary">Background</label>
                <div className="mt-1 grid grid-cols-5 gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {cardBackgrounds.map(bg => {
                    const isUnlocked = (itemTypeForDownload === 'achievement' ? unlockedActivityBackgroundIds : unlockedCardBackgroundIds).includes(bg.id) || bg.cost === 0;
                    return (
                      <button key={bg.id} onClick={() => isUnlocked ? setSelectedBgForDownload(bg) : onUnlockBackground(bg.id)}
                              className={`h-12 w-full rounded-md relative overflow-hidden border-2 ${selectedBgForDownload.id === bg.id ? 'border-blue-500 ring-2 ring-blue-400' : 'border-transparent'}`}
                              title={isUnlocked ? bg.name : `${bg.name} (Locked - ${bg.cost} pts)`}>
                        <CardBackgroundDisplay background={bg} />
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs p-1">
                            <LockClosedIcon className="w-4 h-4" />
                            <span>{bg.cost}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button onClick={handleDownloadCardAsPng} className="w-full py-2.5 px-4 rounded-md text-sm font-medium btn-accent flex items-center justify-center space-x-2">
                    <DownloadIcon className="w-5 h-5"/>
                    <span>Download as PNG</span>
                </button>
                <button onClick={() => setSelectedItemToDownload(null)} className="w-full py-2 px-4 rounded-md text-sm font-medium border border-gray-300/50 dark:border-slate-600/50 text-theme-primary bg-white/80 dark:bg-slate-700/80 hover:bg-gray-100/80 dark:hover:bg-slate-600/80">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HikmahGallery;
