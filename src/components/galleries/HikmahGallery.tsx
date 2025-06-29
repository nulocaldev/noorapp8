
import React, { useState } from 'react';
import { UnlockedWisdomCard } from '../../types';
import HeartIcon from '../icons/HeartIcon';

interface HikmahGalleryProps {
  wisdomCards: UnlockedWisdomCard[];
  onShare?: (card: UnlockedWisdomCard) => void;
  onFavorite?: (cardId: string) => void;
  favorites?: string[];
}

export const HikmahGallery: React.FC<HikmahGalleryProps> = ({
  wisdomCards,
  onShare,
  onFavorite,
  favorites = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...Array.from(new Set(wisdomCards.map(card => card.category)))];

  const filteredCards = wisdomCards.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hikmah Gallery</h1>
        <p className="text-gray-600">
          Your collection of Islamic wisdom and insights
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search wisdom cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No wisdom cards match your filters'
              : 'No wisdom cards yet. Start chatting to collect wisdom!'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {card.title}
                  </h3>
                  {onFavorite && (
                    <button
                      onClick={() => onFavorite(card.id)}
                      className={`
                        p-1 rounded-full transition-colors
                        ${favorites.includes(card.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-400 hover:text-red-500'
                        }
                      `}
                    >
                      <HeartIcon size={20} />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {card.content}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {card.category}
                  </span>
                  <span>
                    {new Date(card.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {onShare && (
                  <button
                    onClick={() => onShare(card)}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    Share Wisdom
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HikmahGallery;
