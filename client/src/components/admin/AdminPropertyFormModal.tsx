import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  PropertyMainCategory,
  PropertySubtype,
} from '../../types/discovery.types';
import {
  PROPERTY_TYPES_CATALOG,
  formatPrice,
} from '../../utils/discoveryData';
import {
  propertyListingService,
  PropertyListingDTO,
  PropertyImageRecord,
  UploadImageInput,
} from '../../services/propertyListing.service';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Sparkles,
  Maximize2,
  FileText,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface StagedPropertyImage {
  id: string; // unique temporary id
  file: File;
  previewUrl: string;
  base64Data: string;
  category: string;
  isCover: boolean;
  label: string;
}

interface AdminPropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSuccess: () => void;
}

export const AdminPropertyFormModal: React.FC<AdminPropertyFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const isEdit = Boolean(initialData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [category, setCategory] = useState<PropertyMainCategory>(
    initialData?.main_category || 'Residential'
  );
  const [subtype, setSubtype] = useState<PropertySubtype>(
    initialData?.subtype || 'Apartment'
  );

  // Common Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [city, setCity] = useState(initialData?.city || 'Pune');
  const [state, setState] = useState(initialData?.state || 'Maharashtra');
  const [developer, setDeveloper] = useState(initialData?.developer || 'Skyline Realty Group');
  const [availability, setAvailability] = useState(initialData?.availability || 'Available');
  const [status, setStatus] = useState(initialData?.status || 'Active');
  const [description, setDescription] = useState(initialData?.description || '');
  const [highlightsInput, setHighlightsInput] = useState<string>(
    initialData?.highlights
      ? Array.isArray(initialData.highlights)
        ? initialData.highlights.join(', ')
        : initialData.highlights
      : ''
  );

  // Address Details
  const [unitNumber, setUnitNumber] = useState(initialData?.address_details?.unitNumber || '');
  const [buildingName, setBuildingName] = useState(initialData?.address_details?.building || '');
  const [wing, setWing] = useState(initialData?.address_details?.wing || '');
  const [road, setRoad] = useState(initialData?.address_details?.road || '');
  const [pinCode, setPinCode] = useState(initialData?.address_details?.pinCode || '');

  // Type-Specific Spec Fields
  const specs = initialData?.specs_data || {};
  const resSpecs = specs.residentialSpecs || specs;
  const landSpecs = specs.landSpecs || specs;
  const commSpecs = specs.commercialSpecs || specs;
  const projSpecs = specs.projectSpecs || specs;

  // Residential
  const [bhk, setBhk] = useState(resSpecs?.bhk || '3 BHK');
  const [bedrooms, setBedrooms] = useState<string>(resSpecs?.bedrooms ? String(resSpecs.bedrooms) : '3');
  const [bathrooms, setBathrooms] = useState<string>(resSpecs?.bathrooms ? String(resSpecs.bathrooms) : '3');
  const [carpetArea, setCarpetArea] = useState<string>(resSpecs?.carpetArea ? String(resSpecs.carpetArea) : '1350');
  const [builtUpArea, setBuiltUpArea] = useState<string>(resSpecs?.builtUpArea ? String(resSpecs.builtUpArea) : '1750');
  const [plotArea, setPlotArea] = useState<string>(resSpecs?.plotArea ? String(resSpecs.plotArea) : '');
  const [floor, setFloor] = useState<string>(resSpecs?.floor ? String(resSpecs.floor) : '7');
  const [totalFloors, setTotalFloors] = useState<string>(resSpecs?.totalFloors ? String(resSpecs.totalFloors) : '24');
  const [parking, setParking] = useState(resSpecs?.parking || '1 Covered Basement Bay');
  const [facing, setFacing] = useState(resSpecs?.facing || landSpecs?.facing || 'East Facing Vastu');
  const [terraceArea, setTerraceArea] = useState<string>(resSpecs?.terraceArea ? String(resSpecs.terraceArea) : '');

  // Land / Plots
  const [landPlotArea, setLandPlotArea] = useState(landSpecs?.plotArea || '2,400 sq.ft (40 x 60 ft)');
  const [dimensions, setDimensions] = useState(landSpecs?.dimensions || '40 ft x 60 ft');
  const [roadWidth, setRoadWidth] = useState(landSpecs?.roadWidth || '40 ft Wide Sector Road');
  const [zoning, setZoning] = useState(landSpecs?.zoning || 'Residential R-Zone (100% Freehold)');
  const [roadAccess, setRoadAccess] = useState(landSpecs?.roadAccess || 'Paved Asphalt Road');
  const [utilities, setUtilities] = useState(landSpecs?.utilities || 'Underground Power & Water Line');

  // Commercial
  const [commercialArea, setCommercialArea] = useState<string>(commSpecs?.commercialArea ? String(commSpecs.commercialArea) : '2500');
  const [commFloor, setCommFloor] = useState(commSpecs?.floor || '4th Floor');
  const [commBuilding, setCommBuilding] = useState(commSpecs?.building || 'Skyline Business Tower');
  const [furnishing, setFurnishing] = useState(commSpecs?.furnishing || 'Warm Shell');
  const [ceilingHeight, setCeilingHeight] = useState(commSpecs?.ceilingHeight || '12 ft Clear Height');
  const [loadingDocks, setLoadingDocks] = useState(commSpecs?.loadingDocks || '');

  // Projects
  const [landParcel, setLandParcel] = useState(projSpecs?.landParcel || '20 Acres');
  const [totalWings, setTotalWings] = useState<string>(projSpecs?.totalWings ? String(projSpecs.totalWings) : '6');
  const [totalUnits, setTotalUnits] = useState<string>(projSpecs?.totalUnits ? String(projSpecs.totalUnits) : '450');
  const [availableUnits, setAvailableUnits] = useState<string>(projSpecs?.availableUnits ? String(projSpecs.availableUnits) : '85');
  const [phase, setPhase] = useState(projSpecs?.phase || 'Phase 1 Ready for Possession');
  const [configurations, setConfigurations] = useState(projSpecs?.configurations || '2, 3 & 4 BHK Luxury Residences');

  // Image Upload & Gallery State
  const [existingImages, setExistingImages] = useState<PropertyImageRecord[]>([]);
  const [stagedImages, setStagedImages] = useState<StagedPropertyImage[]>([]);
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<string>('Exterior');
  const [selectedCoverKey, setSelectedCoverKey] = useState<string>(''); // image id or temp id
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or initialize state when opening modal or changing initialData
  useEffect(() => {
    if (initialData && isOpen) {
      setCategory(initialData.main_category || 'Residential');
      setSubtype(initialData.subtype || 'Apartment');
      setTitle(initialData.title || '');
      setCode(initialData.code || '');
      setPrice(initialData.price ? String(initialData.price) : '');
      setLocation(initialData.location || '');
      setCity(initialData.city || 'Pune');
      setState(initialData.state || 'Maharashtra');
      setDeveloper(initialData.developer || 'Skyline Realty Group');
      setAvailability(initialData.availability || 'Available');
      setStatus(initialData.status || 'Active');
      setDescription(initialData.description || '');
      setHighlightsInput(
        initialData.highlights
          ? Array.isArray(initialData.highlights)
            ? initialData.highlights.join(', ')
            : initialData.highlights
          : ''
      );

      const addr = initialData.address_details || {};
      setUnitNumber(addr.unitNumber || '');
      setBuildingName(addr.building || '');
      setWing(addr.wing || '');
      setRoad(addr.road || '');
      setPinCode(addr.pinCode || '');

      const sp = initialData.specs_data || {};
      const r = sp.residentialSpecs || sp;
      const l = sp.landSpecs || sp;
      const c = sp.commercialSpecs || sp;
      const p = sp.projectSpecs || sp;

      setBhk(r?.bhk || '3 BHK');
      setBedrooms(r?.bedrooms ? String(r.bedrooms) : '3');
      setBathrooms(r?.bathrooms ? String(r.bathrooms) : '3');
      setCarpetArea(r?.carpetArea ? String(r.carpetArea) : '1350');
      setBuiltUpArea(r?.builtUpArea ? String(r.builtUpArea) : '1750');
      setPlotArea(r?.plotArea ? String(r.plotArea) : '');
      setFloor(r?.floor ? String(r.floor) : '7');
      setTotalFloors(r?.totalFloors ? String(r.totalFloors) : '24');
      setParking(r?.parking || c?.parking || '1 Covered Basement Bay');
      setFacing(r?.facing || l?.facing || 'East Facing Vastu');
      setTerraceArea(r?.terraceArea ? String(r.terraceArea) : '');

      setLandPlotArea(l?.plotArea || '2,400 sq.ft (40 x 60 ft)');
      setDimensions(l?.dimensions || '40 ft x 60 ft');
      setRoadWidth(l?.roadWidth || '40 ft Wide Sector Road');
      setZoning(l?.zoning || 'Residential R-Zone (100% Freehold)');
      setRoadAccess(l?.roadAccess || 'Paved Asphalt Road');
      setUtilities(l?.utilities || 'Underground Power & Water Line');

      setCommercialArea(c?.commercialArea ? String(c.commercialArea) : '2500');
      setCommFloor(c?.floor || '4th Floor');
      setCommBuilding(c?.building || 'Skyline Business Tower');
      setFurnishing(c?.furnishing || 'Warm Shell');
      setCeilingHeight(c?.ceilingHeight || '12 ft Clear Height');
      setLoadingDocks(c?.loadingDocks || '');

      setLandParcel(p?.landParcel || '20 Acres');
      setTotalWings(p?.totalWings ? String(p.totalWings) : '6');
      setTotalUnits(p?.totalUnits ? String(p.totalUnits) : '450');
      setAvailableUnits(p?.availableUnits ? String(p.availableUnits) : '85');
      setPhase(p?.phase || 'Phase 1 Ready for Possession');
      setConfigurations(p?.configurations || '2, 3 & 4 BHK Luxury Residences');

      const imgs: PropertyImageRecord[] = initialData.images || [];
      setExistingImages(imgs);
      const cover = imgs.find((img) => img.is_cover === 1 || img.url === initialData.cover_image) || imgs[0];
      setSelectedCoverKey(cover ? cover.id : '');
    } else if (isOpen && !initialData) {
      // Clean slate for new creation
      setCategory('Residential');
      setSubtype('Apartment');
      setTitle('');
      setCode('');
      setPrice('');
      setLocation('');
      setCity('Pune');
      setState('Maharashtra');
      setDeveloper('Skyline Realty Group');
      setAvailability('Available');
      setStatus('Active');
      setDescription('');
      setHighlightsInput('');
      setUnitNumber('');
      setBuildingName('');
      setWing('');
      setRoad('');
      setPinCode('');
      setExistingImages([]);
      setSelectedCoverKey('');
    }
    setStagedImages([]);
    setDeletedImageIds([]);
    setErrors({});
  }, [initialData, isOpen]);

  // When category changes, update available subtypes
  const filteredSubtypes = PROPERTY_TYPES_CATALOG.filter((t) =>
    category === 'All' ? true : t.category === category
  );

  useEffect(() => {
    if (!filteredSubtypes.some((t) => t.id === subtype)) {
      if (filteredSubtypes.length > 0) {
        setSubtype(filteredSubtypes[0].id);
      }
    }
  }, [category]);

  // File Upload Handlers
  const handleFilesAdded = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        showToast({
          variant: 'error',
          message: `File "${file.name}" is unsupported. Please upload JPG, PNG, or WEBP images.`,
        });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          variant: 'error',
          message: `File "${file.name}" exceeds the 10MB limit.`,
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    try {
      const newStaged: StagedPropertyImage[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);

        newStaged.push({
          id: tempId,
          file,
          previewUrl,
          base64Data: base64,
          category: selectedUploadCategory,
          isCover: false,
          label: `${title || 'Property'} - ${selectedUploadCategory}`,
        });
      }

      setStagedImages((prev) => {
        const combined = [...prev, ...newStaged];
        // If there's currently no cover selected across existing and staged, make the first one cover
        if (!selectedCoverKey && existingImages.length === 0 && combined.length > 0) {
          combined[0].isCover = true;
          setSelectedCoverKey(combined[0].id);
        }
        return combined;
      });

      showToast({
        variant: 'success',
        message: `${newStaged.length} image(s) added to property.`,
      });
    } catch (err: any) {
      showToast({
        variant: 'error',
        message: 'Failed to process selected images.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleSelectCover = (key: string) => {
    setSelectedCoverKey(key);
    setStagedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === key,
      }))
    );
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_cover: img.id === key ? 1 : 0,
      }))
    );
  };

  const handleRemoveStaged = (tempId: string) => {
    setStagedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== tempId);
      if (selectedCoverKey === tempId) {
        if (existingImages.length > 0) {
          setSelectedCoverKey(existingImages[0].id);
          setExistingImages((curr) =>
            curr.map((img, idx) => ({ ...img, is_cover: idx === 0 ? 1 : 0 }))
          );
        } else if (filtered.length > 0) {
          filtered[0].isCover = true;
          setSelectedCoverKey(filtered[0].id);
        } else {
          setSelectedCoverKey('');
        }
      }
      return filtered;
    });
  };

  const handleRemoveExisting = (imgId: string) => {
    setExistingImages((prev) => {
      const filtered = prev.filter((img) => img.id !== imgId);
      if (selectedCoverKey === imgId) {
        if (filtered.length > 0) {
          setSelectedCoverKey(filtered[0].id);
          filtered[0].is_cover = 1;
        } else if (stagedImages.length > 0) {
          setSelectedCoverKey(stagedImages[0].id);
          setStagedImages((curr) =>
            curr.map((s, idx) => ({ ...s, isCover: idx === 0 }))
          );
        } else {
          setSelectedCoverKey('');
        }
      }
      return filtered;
    });
    setDeletedImageIds((prev) => [...prev, imgId]);
  };

  const handleStagedCategoryChange = (tempId: string, newCat: string) => {
    setStagedImages((prev) =>
      prev.map((img) => (img.id === tempId ? { ...img, category: newCat } : img))
    );
  };

  const totalImagesCount = existingImages.length + stagedImages.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Property Title is required.';
    if (!price || Number(price) <= 0) newErrors.price = 'Valid numeric price is required.';
    if (!location.trim()) newErrors.location = 'Location / Area is required.';
    if (!city.trim()) newErrors.city = 'City is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast({
        variant: 'error',
        message: 'Please fill in all required property fields.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const numPrice = Number(price);
      const highlightsArray = highlightsInput
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean);

      // Build type-specific specifications package
      let specsPackage: Record<string, any> = {};

      if (category === 'Residential') {
        specsPackage = {
          residentialSpecs: {
            bhk,
            bedrooms: Number(bedrooms) || 3,
            bathrooms: Number(bathrooms) || 3,
            carpetArea: Number(carpetArea) || 1200,
            builtUpArea: Number(builtUpArea) || 1500,
            plotArea: plotArea ? Number(plotArea) : undefined,
            floor: floor || '1st Floor',
            totalFloors: Number(totalFloors) || 10,
            parking,
            facing,
            societyOrProject: buildingName || title,
            terraceArea: terraceArea ? Number(terraceArea) : undefined,
          },
        };
      } else if (category === 'Land') {
        specsPackage = {
          landSpecs: {
            plotArea: landPlotArea,
            dimensions,
            roadWidth,
            facing,
            zoning,
            roadAccess,
            utilities,
          },
        };
      } else if (category === 'Commercial') {
        specsPackage = {
          commercialSpecs: {
            commercialArea: Number(commercialArea) || 1500,
            floor: commFloor,
            building: commBuilding || buildingName,
            furnishing,
            ceilingHeight,
            loadingDocks: loadingDocks || undefined,
            parking,
          },
        };
      } else if (category === 'Projects') {
        specsPackage = {
          projectSpecs: {
            landParcel,
            totalWings: Number(totalWings) || 4,
            totalUnits: Number(totalUnits) || 100,
            availableUnits: Number(availableUnits) || 20,
            phase,
            configurations,
          },
        };
      }

      const addressDetails = {
        unitNumber,
        building: buildingName,
        wing,
        floor,
        road,
        locality: location,
        city,
        state,
        pinCode,
      };

      const payload: PropertyListingDTO = {
        title: title.trim(),
        code: code.trim() || undefined,
        main_category: category,
        subtype,
        price: numPrice,
        price_label: formatPrice(numPrice),
        price_per_sqft: Math.round(numPrice / (Number(carpetArea) || Number(commercialArea) || 1200)),
        location: location.trim(),
        city: city.trim(),
        state: state.trim(),
        developer: developer.trim(),
        availability,
        status,
        description: description.trim(),
        highlights: highlightsArray,
        address_details: addressDetails,
        specs_data: specsPackage,
      };

      let propertyId = initialData?.id;

      if (isEdit && propertyId) {
        await propertyListingService.update(propertyId, payload);
      } else {
        const created = await propertyListingService.create(payload);
        propertyId = created.id;
      }

      // 1. Delete removed existing images if in edit mode
      if (isEdit && propertyId && deletedImageIds.length > 0) {
        for (const delId of deletedImageIds) {
          try {
            await propertyListingService.deleteImage(propertyId, delId);
          } catch (delErr) {
            console.warn('Failed to delete image:', delId, delErr);
          }
        }
      }

      // 2. Upload staged files if any
      if (propertyId && stagedImages.length > 0) {
        const uploadPayload: UploadImageInput[] = stagedImages.map((s) => ({
          filename: s.file.name,
          contentType: s.file.type,
          base64Data: s.base64Data,
          label: `${title.trim()} - ${s.category}`,
          category: s.category,
          isCover: s.id === selectedCoverKey,
        }));
        await propertyListingService.uploadImages(propertyId, uploadPayload);
      }

      // 3. If an existing image was designated as Cover and no staged file took over cover
      const stagedIsCover = stagedImages.some((s) => s.id === selectedCoverKey);
      if (isEdit && propertyId && !stagedIsCover && selectedCoverKey) {
        try {
          await propertyListingService.setCover(propertyId, selectedCoverKey);
        } catch (coverErr) {
          console.warn('Failed to set cover image:', coverErr);
        }
      }

      showToast({
        variant: 'success',
        message: isEdit
          ? `Property "${title}" updated successfully!`
          : `Property "${title}" created successfully with ${stagedImages.length} image(s)!`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast({
        variant: 'error',
        message: err.message || 'Failed to save property.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Property: ${initialData?.title}` : 'Add New Real Estate Property'}
      description="Create or modify verified property catalog records with authentic media & parameters."
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="text-xs font-bold shadow-md shadow-brand-600/30 bg-gradient-to-r from-brand-600 to-blue-600 border-0"
          >
            {isEdit ? 'Save Changes' : 'Create Property'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-left text-xs">
        {/* 1. Category & Property Classification Picker */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Select Classification Category</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Residential', 'Land', 'Commercial', 'Projects'] as PropertyMainCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Subtype:</span>
            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value as PropertySubtype)}
              className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {filteredSubtypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({t.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Common Core Information */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>Property Information</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Property Title *</span>
              <input
                type="text"
                placeholder="e.g. Skyline Palms 3 BHK Luxury Row House"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.title && <p className="text-[10px] text-red-500 font-medium">{errors.title}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Property Code</span>
              <input
                type="text"
                placeholder="e.g. SKP-RH-04 (Auto-generated if empty)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Price (INR ₹) *</span>
              <input
                type="number"
                placeholder="e.g. 26500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
              {price && Number(price) > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">{formatPrice(Number(price))}</p>
              )}
              {errors.price && <p className="text-[10px] text-red-500 font-medium">{errors.price}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Location / Locality *</span>
              <input
                type="text"
                placeholder="e.g. Koregaon Park Annexe"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.location && <p className="text-[10px] text-red-500 font-medium">{errors.location}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">City *</span>
              <input
                type="text"
                placeholder="e.g. Pune"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Developer</span>
              <input
                type="text"
                placeholder="e.g. Skyline Realty Group"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Availability</span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Available">Available</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Immediate Possession">Immediate Possession</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Highlights (Comma Separated)</span>
              <input
                type="text"
                placeholder="e.g. 3 BHK Triplex Design, 450 sq.ft Private Back Lawn, 2 Covered Parking Bays"
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Description</span>
              <textarea
                rows={3}
                placeholder="Provide a detailed professional real-estate overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Dynamic Type-Specific Specifications */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Type-Specific Parameters ({subtype})</span>
          </label>

          {/* DYNAMIC CASE: RESIDENTIAL */}
          {category === 'Residential' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">BHK Layout</span>
                <input
                  type="text"
                  placeholder="e.g. 3 BHK Triplex"
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Carpet Area (sq.ft)</span>
                <input
                  type="number"
                  placeholder="e.g. 1950"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Built-Up Area (sq.ft)</span>
                <input
                  type="number"
                  placeholder="e.g. 2300"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Bedrooms</span>
                <input
                  type="number"
                  placeholder="3"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Bathrooms</span>
                <input
                  type="number"
                  placeholder="4"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Parking Slots</span>
                <input
                  type="text"
                  placeholder="e.g. 2 Dedicated Covered Bays"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Floor Level</span>
                <input
                  type="text"
                  placeholder="e.g. G + 2 Floors"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Orientation / Facing</span>
                <input
                  type="text"
                  placeholder="e.g. East Facing Vastu"
                  value={facing}
                  onChange={(e) => setFacing(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* DYNAMIC CASE: LAND & PLOTS */}
          {category === 'Land' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Plot Area</span>
                <input
                  type="text"
                  placeholder="e.g. 2,400 sq.ft (266 sq.yd) or 2.5 Acres"
                  value={landPlotArea}
                  onChange={(e) => setLandPlotArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Dimensions</span>
                <input
                  type="text"
                  placeholder="e.g. 40 ft x 60 ft"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Road Width</span>
                <input
                  type="text"
                  placeholder="e.g. 40 ft Sector Road"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Land Zoning</span>
                <input
                  type="text"
                  placeholder="e.g. Residential R-Zone"
                  value={zoning}
                  onChange={(e) => setZoning(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Facing Orientation</span>
                <input
                  type="text"
                  placeholder="e.g. East Facing Corner"
                  value={facing}
                  onChange={(e) => setFacing(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Utilities</span>
                <input
                  type="text"
                  placeholder="e.g. Underground Power & Water Line"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* DYNAMIC CASE: COMMERCIAL */}
          {category === 'Commercial' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Commercial Area (sq.ft)</span>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={commercialArea}
                  onChange={(e) => setCommercialArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Building / Level</span>
                <input
                  type="text"
                  placeholder="e.g. 4th Floor (Tower Alpha)"
                  value={commFloor}
                  onChange={(e) => setCommFloor(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Fitout Furnishing</span>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                >
                  <option value="Bare Shell">Bare Shell</option>
                  <option value="Warm Shell">Warm Shell</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Plug & Play">Plug & Play</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Clear Height</span>
                <input
                  type="text"
                  placeholder="e.g. 12 ft Clear Height"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Parking Slots</span>
                <input
                  type="text"
                  placeholder="e.g. 4 Reserved Basement Bays"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* DYNAMIC CASE: MASTER PROJECTS */}
          {category === 'Projects' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Master Land Parcel</span>
                <input
                  type="text"
                  placeholder="e.g. 25 Acres Tech Park"
                  value={landParcel}
                  onChange={(e) => setLandParcel(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Total Wings / Towers</span>
                <input
                  type="number"
                  placeholder="e.g. 6"
                  value={totalWings}
                  onChange={(e) => setTotalWings(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Total Units</span>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Layout Configurations</span>
                <input
                  type="text"
                  placeholder="e.g. 2, 3 & 4 BHK Luxury Residences"
                  value={configurations}
                  onChange={(e) => setConfigurations(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Complete Address Details */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Complete Real Estate Address</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Unit / Flat / Shop No</span>
              <input
                type="text"
                placeholder="e.g. Villa 04 or Unit 402"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Building / Complex</span>
              <input
                type="text"
                placeholder="e.g. Skyline Palms Enclave"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Road / Street</span>
              <input
                type="text"
                placeholder="e.g. 100 ft Main Boulevard"
                value={road}
                onChange={(e) => setRoad(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">PIN Code</span>
              <input
                type="text"
                placeholder="e.g. 411001"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* 5. PROPERTY IMAGES & MEDIA UPLOAD */}
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
            <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Property Images & Media</span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                ({totalImagesCount} image{totalImagesCount !== 1 ? 's' : ''})
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Category for Upload:</span>
              <select
                value={selectedUploadCategory}
                onChange={(e) => setSelectedUploadCategory(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Exterior">Exterior</option>
                <option value="Interior">Interior</option>
                <option value="Amenities">Amenities</option>
                <option value="Entrance">Entrance</option>
                <option value="Plan">Floor Plan</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-brand-400 dark:hover:border-slate-700'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                Click to Upload or Drag & Drop Property Images
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Supports JPG, PNG, WEBP up to 10MB per file. First image automatically defaults as Cover.
              </p>
            </div>
          </div>

          {/* Images Grid Showcase */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-brand-500 dark:text-brand-400" />
                <span>Current & Staged Photos</span>
              </span>
              <span className="text-[9px] text-amber-600 dark:text-amber-300 font-mono">
                ★ Cover Photo has Gold border and is shown on Discovery cards
              </span>
            </div>

            {totalImagesCount === 0 ? (
              <div className="p-6 text-center bg-white/60 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">No property photos attached yet</p>
                <p className="text-[10px]">Add high-resolution exterior and interior photos to showcase this property on the Discovery page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 1. Existing Database Images */}
                {existingImages.map((img) => {
                  const isCover = img.id === selectedCoverKey || (img.is_cover === 1 && !selectedCoverKey);
                  return (
                    <div
                      key={img.id}
                      className={`relative rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-900 flex flex-col justify-between group shadow-xs transition-all ${
                        isCover
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={img.url}
                          alt={img.alt_text || img.label}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Top Badge */}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                          {isCover ? (
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase shadow-xs flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Cover
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold">
                              {img.category}
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(img.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded bg-black/75 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Footer */}
                      <div className="p-2 flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-950 text-[10px]">
                        <span className="truncate text-slate-700 dark:text-slate-300 font-medium max-w-[100px]">
                          {img.label || img.category}
                        </span>

                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSelectCover(img.id)}
                            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
                          >
                            Make Cover
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 2. Staged New Images */}
                {stagedImages.map((staged) => {
                  const isCover = staged.id === selectedCoverKey || staged.isCover;
                  return (
                    <div
                      key={staged.id}
                      className={`relative rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-900 flex flex-col justify-between group shadow-xs transition-all ${
                        isCover
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={staged.previewUrl}
                          alt={staged.label}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                          {isCover ? (
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase shadow-xs flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Cover
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold">
                              {staged.category}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold text-[8px] uppercase">
                            New
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveStaged(staged.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded bg-black/75 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Remove staged photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Footer */}
                      <div className="p-2 flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-950 text-[10px]">
                        <select
                          value={staged.category}
                          onChange={(e) => handleStagedCategoryChange(staged.id, e.target.value)}
                          className="text-[9px] font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded px-1 py-0.5 focus:outline-none"
                        >
                          <option value="Exterior">Exterior</option>
                          <option value="Interior">Interior</option>
                          <option value="Amenities">Amenities</option>
                          <option value="Entrance">Entrance</option>
                          <option value="Plan">Plan</option>
                        </select>

                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSelectCover(staged.id)}
                            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
                          >
                            Make Cover
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
