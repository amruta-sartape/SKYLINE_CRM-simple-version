import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Heart, CalendarCheck, PhoneCall, Sparkles, MapPin } from 'lucide-react';

export interface CustomerAuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: {
    id: string;
    title: string;
    code?: string;
    subtype?: string;
    city?: string;
    location?: string;
    priceLabel?: string;
    price_formatted?: string;
    coverImage?: string;
    cover_image?: string;
    images?: { cover?: string };
  } | null;
  actionType?: 'wishlist' | 'visit' | 'enquiry';
}

export const CustomerAuthGateModal: React.FC<CustomerAuthGateModalProps> = ({
  isOpen,
  onClose,
  property,
  actionType = 'wishlist',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleSignIn = () => {
    if (property) {
      sessionStorage.setItem('skyline_pending_wishlist', JSON.stringify(property));
      sessionStorage.setItem(
        'skyline_pending_intent',
        JSON.stringify({
          action: actionType,
          property,
          returnTo: location.pathname,
        })
      );
    }
    onClose();
    navigate('/customer/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => {
    if (property) {
      sessionStorage.setItem('skyline_pending_wishlist', JSON.stringify(property));
      sessionStorage.setItem(
        'skyline_pending_intent',
        JSON.stringify({
          action: actionType,
          property,
          returnTo: location.pathname,
        })
      );
    }
    onClose();
    navigate('/customer/register', { state: { from: location.pathname } });
  };

  const getTitle = () => {
    switch (actionType) {
      case 'visit':
        return 'Sign In to Schedule Site Visit';
      case 'enquiry':
        return 'Sign In to Submit Enquiry';
      case 'wishlist':
      default:
        return 'Save this Property to Wishlist';
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case 'visit':
        return 'Create a client account to coordinate private viewings and guided on-site tours with verified advisors.';
      case 'enquiry':
        return 'Connect directly with our dedicated real estate specialists for floor plans and official developer pricing.';
      case 'wishlist':
      default:
        return 'Create a free customer account to bookmark properties, track pricing updates, and access your saved collection on any device.';
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'visit':
        return <CalendarCheck className="w-5 h-5 text-amber-500" />;
      case 'enquiry':
        return <PhoneCall className="w-5 h-5 text-blue-500" />;
      case 'wishlist':
      default:
        return <Heart className="w-5 h-5 text-rose-500 fill-current" />;
    }
  };

  const coverImg =
    property?.images?.cover ||
    property?.coverImage ||
    property?.cover_image ||
    '/images/classifications/apartment.jpg';

  const priceFormatted = property?.priceLabel || property?.price_formatted || 'Price on Request';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      description="Join Skyline Real Estate Customer Portal"
      maxWidth="md"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full pt-2 border-t border-stone-100 dark:border-[#242F42]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs text-stone-600 dark:text-slate-300 border-stone-200 dark:border-slate-700"
          >
            Continue Browsing
          </Button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegister}
              className="flex-1 sm:flex-none text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              Create Free Account
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSignIn}
              className="flex-1 sm:flex-none text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 border-0 shadow-xs"
            >
              Sign In
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-left">
        {/* Property preview card if property context is available */}
        {property && (
          <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/90 dark:border-[#242F42]">
            <img
              src={coverImg}
              alt={property.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {property.subtype || 'Property'}
                </span>
                {property.code && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-stone-200 dark:bg-slate-800 text-stone-600 dark:text-slate-400">
                    {property.code}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-slate-100 truncate">
                {property.title}
              </h4>
              {(property.location || property.city) && (
                <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-slate-400 truncate mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                  <span className="truncate">
                    {property.location ? `${property.location}, ` : ''}
                    {property.city || ''}
                  </span>
                </div>
              )}
              <div className="text-xs font-extrabold text-stone-900 dark:text-amber-300 font-sans mt-0.5">
                {priceFormatted}
              </div>
            </div>
          </div>
        )}

        {/* Benefits & Action Explanation */}
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-[#141A24] border border-amber-200 dark:border-amber-800/60 shrink-0 shadow-2xs">
            {getActionIcon()}
          </div>
          <div className="space-y-1 text-xs">
            <h5 className="font-bold text-stone-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{actionType === 'wishlist' ? 'Personal Real Estate Wishlist' : 'Verified Client Experience'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </h5>
            <p className="text-stone-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {getDescription()}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-stone-500 dark:text-slate-400">
          Already registered? Click <strong className="text-stone-800 dark:text-slate-200 font-semibold">Sign In</strong> to instantly sync this property to your account.
        </p>
      </div>
    </Modal>
  );
};
