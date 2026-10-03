import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { CustomerAuthGateModal } from '../components/auth/CustomerAuthGateModal';
import { wishlistService } from '../services/wishlist.service';

export interface WishlistProperty {
  id: string;
  code?: string;
  title: string;
  subtype: string;
  mainCategory?: string;
  location: string;
  city: string;
  state?: string;
  price: number;
  priceLabel: string;
  pricePerSqft?: number;
  areaLabel?: string;
  area?: number;
  availability: string;
  status?: string;
  developer?: string;
  highlights?: string[];
  coverImage: string;
  savedAt: string;
}

interface WishlistContextType {
  savedProperties: WishlistProperty[];
  savedCount: number;
  isLoading: boolean;
  isSaved: (propertyId: string) => boolean;
  toggleSave: (property: any) => Promise<void>;
  removeSaved: (propertyId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  openAuthGate: (property?: any, action?: 'wishlist' | 'visit' | 'enquiry') => void;
  closeAuthGate: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [savedProperties, setSavedProperties] = useState<WishlistProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [authGateState, setAuthGateState] = useState<{
    isOpen: boolean;
    property: any | null;
    actionType: 'wishlist' | 'visit' | 'enquiry';
  }>({
    isOpen: false,
    property: null,
    actionType: 'wishlist',
  });

  const prevUserIdRef = useRef<string | null>(null);

  // Sync with MongoDB whenever authenticated user changes
  useEffect(() => {
    let isMounted = true;

    async function loadWishlistFromMongoDB() {
      if (!user) {
        if (isMounted) setSavedProperties([]);
        prevUserIdRef.current = null;
        return;
      }

      try {
        setIsLoading(true);
        const serverItems = await wishlistService.getWishlist();

        // Check if there was a pending wishlist item in sessionStorage to auto-persist
        const pendingStr = sessionStorage.getItem('skyline_pending_wishlist');
        if (pendingStr) {
          try {
            const pendingProperty = JSON.parse(pendingStr);
            const propertyId = pendingProperty.id || pendingProperty.code || pendingProperty.title;
            const cleanId = String(propertyId).toLowerCase().trim();

            const alreadySaved = serverItems.some(
              (p) =>
                p.id.toLowerCase() === cleanId ||
                (p.code && p.code.toLowerCase() === cleanId) ||
                p.title.toLowerCase() === cleanId
            );

            if (!alreadySaved) {
              const toggleResult = await wishlistService.toggleSave(pendingProperty);
              if (toggleResult.saved && toggleResult.item) {
                serverItems.unshift(toggleResult.item);
                showToast({
                  variant: 'success',
                  title: 'Wishlist Restored ❤️',
                  message: `${pendingProperty.title || 'Property'} saved to your account.`,
                });
              }
            }

            sessionStorage.removeItem('skyline_pending_wishlist');
          } catch (err) {
            console.error('Failed to parse or restore pending wishlist:', err);
          }
        }

        if (isMounted) {
          setSavedProperties(serverItems);
        }
      } catch (err) {
        console.error('Failed to load wishlist from MongoDB:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (user?.id !== prevUserIdRef.current) {
      prevUserIdRef.current = user?.id || null;
      loadWishlistFromMongoDB();
    }

    return () => {
      isMounted = false;
    };
  }, [user, showToast]);

  const openAuthGate = useCallback((property?: any, action: 'wishlist' | 'visit' | 'enquiry' = 'wishlist') => {
    setAuthGateState({
      isOpen: true,
      property: property || null,
      actionType: action,
    });
  }, []);

  const closeAuthGate = useCallback(() => {
    setAuthGateState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const isSaved = useCallback(
    (propertyId: string): boolean => {
      if (!propertyId) return false;
      const cleanId = String(propertyId).toLowerCase().trim();
      return savedProperties.some(
        (p) =>
          p.id.toLowerCase() === cleanId ||
          (p.code && p.code.toLowerCase() === cleanId) ||
          p.title.toLowerCase() === cleanId
      );
    },
    [savedProperties]
  );

  const toggleSave = useCallback(
    async (property: any) => {
      if (!property) return;

      // If user is not authenticated, show Auth Gate modal & stash in sessionStorage
      if (!user) {
        sessionStorage.setItem('skyline_pending_wishlist', JSON.stringify(property));
        openAuthGate(property, 'wishlist');
        return;
      }

      const propertyId = property.id || property.code || property.title;
      const cleanId = String(propertyId).toLowerCase().trim();

      const existingIndex = savedProperties.findIndex(
        (p) =>
          p.id.toLowerCase() === cleanId ||
          (p.code && p.code.toLowerCase() === cleanId) ||
          p.title.toLowerCase() === cleanId
      );

      try {
        const result = await wishlistService.toggleSave(property);
        if (result.saved) {
          // Added to MongoDB
          const coverImg =
            property.images?.cover ||
            property.cover_image ||
            property.coverImage ||
            (property.subtype === 'Penthouse'
              ? '/images/classifications/penthouse.jpg'
              : property.subtype === 'Villa'
              ? '/images/classifications/villa.jpg'
              : '/images/classifications/apartment.jpg');

          const newItem: WishlistProperty = result.item || {
            id: property.id || property.code || `prop_${Date.now()}`,
            code: property.code,
            title: property.title || property.name || 'Prime Real Estate Property',
            subtype: property.subtype || 'Apartment',
            mainCategory: property.mainCategory || 'Residential',
            location: property.location || 'Prime Corridor',
            city: property.city || 'Mumbai',
            state: property.state || 'Maharashtra',
            price: property.price || 0,
            priceLabel:
              property.priceLabel ||
              property.price_formatted ||
              (property.price ? `₹${(property.price / 10000000).toFixed(2)} Cr` : 'Price on Request'),
            pricePerSqft: property.pricePerSqft,
            areaLabel: property.areaLabel || (property.carpetArea ? `${property.carpetArea} sq.ft` : undefined),
            area: property.carpetArea || property.area,
            availability: property.availability || property.availability_status || 'Available',
            status: property.status || 'Active',
            developer: property.developer || 'Skyline Realty Group',
            highlights: property.highlights || [],
            coverImage: coverImg,
            savedAt: new Date().toISOString(),
          };

          setSavedProperties((prev) => [newItem, ...prev.filter((p) => p.id.toLowerCase() !== cleanId)]);
          showToast({
            variant: 'success',
            title: 'Added to Wishlist ❤️',
            message: `${newItem.title} saved to your account.`,
          });
        } else {
          // Removed from MongoDB
          setSavedProperties((prev) => prev.filter((_, i) => i !== existingIndex));
          showToast({
            variant: 'info',
            title: 'Removed from Wishlist',
            message: `${property.title || 'Property'} removed from your saved collection.`,
          });
        }
      } catch (err: any) {
        showToast({
          variant: 'error',
          title: 'Wishlist Error',
          message: err.message || 'Failed to update wishlist on server.',
        });
      }
    },
    [user, savedProperties, showToast, openAuthGate]
  );

  const removeSaved = useCallback(
    async (propertyId: string) => {
      const cleanId = String(propertyId).toLowerCase().trim();
      const item = savedProperties.find(
        (p) =>
          p.id.toLowerCase() === cleanId ||
          (p.code && p.code.toLowerCase() === cleanId) ||
          p.title.toLowerCase() === cleanId
      );

      setSavedProperties((prev) =>
        prev.filter(
          (p) =>
            p.id.toLowerCase() !== cleanId &&
            (!p.code || p.code.toLowerCase() !== cleanId) &&
            p.title.toLowerCase() !== cleanId
        )
      );

      try {
        await wishlistService.removeSaved(propertyId);
        if (item) {
          showToast({
            variant: 'info',
            title: 'Removed from Wishlist',
            message: `${item.title} removed from your saved properties.`,
          });
        }
      } catch (err: any) {
        console.error('Failed to remove saved property on MongoDB:', err);
      }
    },
    [savedProperties, showToast]
  );

  const clearWishlist = useCallback(async () => {
    setSavedProperties([]);
    try {
      await wishlistService.clearWishlist();
      showToast({
        variant: 'info',
        title: 'Wishlist Cleared',
        message: 'Your saved properties collection is now empty.',
      });
    } catch (err: any) {
      console.error('Failed to clear wishlist on MongoDB:', err);
    }
  }, [showToast]);

  return (
    <WishlistContext.Provider
      value={{
        savedProperties,
        savedCount: savedProperties.length,
        isLoading,
        isSaved,
        toggleSave,
        removeSaved,
        clearWishlist,
        openAuthGate,
        closeAuthGate,
      }}
    >
      {children}
      <CustomerAuthGateModal
        isOpen={authGateState.isOpen}
        onClose={closeAuthGate}
        property={authGateState.property}
        actionType={authGateState.actionType}
      />
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
