import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/ui/Button';
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Trash2,
  Building2,
} from 'lucide-react';

export const CustomerWishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { savedProperties, removeSaved, clearWishlist, savedCount } = useWishlist();

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-[#242F42] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400">
              <Link to="/customer" className="hover:text-stone-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-stone-700 dark:text-slate-300">My Wishlist</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-slate-100">
                My Wishlist
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" />
                <span>{savedCount} {savedCount === 1 ? 'Saved Property' : 'Saved Properties'}</span>
              </span>
            </div>
          </div>

          {savedCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                    clearWishlist();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-stone-200 dark:border-[#242F42] transition-colors cursor-pointer"
              >
                Clear Wishlist
              </button>
              <Link
                to="/discovery"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold transition-colors shadow-xs"
              >
                Explore More
              </Link>
            </div>
          )}
        </div>

        {/* Wishlist Grid or Empty State */}
        {savedCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group text-left"
              >
                {/* Image Container */}
                <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-[#101622] relative">
                  <Link to={`/discovery/${prop.id}`}>
                    <img
                      src={prop.coverImage}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/classifications/apartment.jpg';
                      }}
                    />
                  </Link>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#141A24]/90 backdrop-blur-md text-[10px] font-bold text-stone-900 dark:text-slate-100 shadow-xs">
                      {prop.subtype}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold text-white shadow-xs">
                      {prop.availability}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeSaved(prop.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-[#141A24]/90 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 shadow-md transition-transform hover:scale-110 cursor-pointer"
                    title="Remove from Wishlist"
                    aria-label="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div>
                      <Link to={`/discovery/${prop.id}`}>
                        <h3 className="font-bold text-base text-stone-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer">
                          {prop.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">
                          {prop.location}, {prop.city}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-slate-100 font-sans tracking-tight">
                        {prop.priceLabel}
                      </span>
                    </div>

                    {prop.areaLabel && (
                      <div className="text-xs text-stone-600 dark:text-slate-300 font-medium">
                        {prop.areaLabel}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 dark:border-[#242F42] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => removeSaved(prop.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-50 dark:hover:bg-[#101622] transition-colors cursor-pointer"
                    >
                      Remove
                    </button>

                    <Link
                      to={`/discovery/${prop.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold transition-colors shadow-xs"
                    >
                      <span>View Property</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <Heart className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Save properties you love and find them here later. Click the heart icon on any property card to save it.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/discovery')}
                leftIcon={<Building2 className="w-4 h-4" />}
              >
                Explore Properties
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
