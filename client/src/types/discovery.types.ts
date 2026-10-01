import { UnitAvailability, ProjectStatus } from './property.types';

export type PropertyMainCategory = 'All' | 'Residential' | 'Land' | 'Commercial' | 'Projects';

export type PropertySubtype =
  // Residential
  | 'Apartment'
  | 'Flat'
  | 'Villa'
  | 'Row House'
  | 'Bungalow'
  | 'Penthouse'
  | 'Studio'
  // Land
  | 'Residential Plot'
  | 'Commercial Plot'
  | 'Farm Land'
  // Commercial
  | 'Office'
  | 'Shop / Retail'
  | 'Showroom'
  | 'Commercial Building'
  | 'Warehouse'
  // Projects
  | 'Commercial Project'
  | 'Mixed-use Project'
  | 'Township'
  | 'Gated Community';

export interface PropertyTypeMetadata {
  id: PropertySubtype;
  label: string;
  category: Exclude<PropertyMainCategory, 'All'>;
  description: string;
  iconName: string;
  tag: string;
  image: string;
}

export interface ResidentialSpecs {
  bhk: string;
  bedrooms: number;
  bathrooms: number;
  carpetArea: number; // in sq.ft
  builtUpArea?: number;
  plotArea?: number;
  floor?: number | string;
  totalFloors?: number;
  parking: string;
  societyOrProject?: string;
  facing?: string;
  terraceArea?: number;
}

export interface LandSpecs {
  plotArea: string; // e.g. "2,400 sq.ft (266 sq.yd)" or "2.5 Acres"
  dimensions?: string; // e.g. "40 ft x 60 ft"
  roadWidth?: string; // e.g. "40 ft Sector Road"
  facing?: string; // e.g. "East Facing Corner"
  zoning?: string; // e.g. "Residential R-Zone" | "Commercial" | "Agricultural"
  roadAccess?: string; // e.g. "30 ft Tar Road Frontage"
  utilities?: string; // e.g. "Borewell Water & 3-Phase Power"
}

export interface CommercialSpecs {
  commercialArea: number; // in sq.ft
  floor?: string;
  building?: string;
  frontage?: string; // e.g. "35 ft Glass Frontage"
  ceilingHeight?: string; // e.g. "14 ft Clear Height"
  loadingDocks?: string; // e.g. "2 Heavy Vehicle Docks"
  furnishing?: 'Warm Shell' | 'Bare Shell' | 'Fully Furnished' | 'Plug & Play';
  parking: string;
}

export interface ProjectSpecs {
  landParcel?: string; // e.g. "25 Acres"
  totalWings?: number;
  totalUnits?: number;
  availableUnits?: number;
  phase?: string;
  configurations?: string; // e.g. "2, 3 & 4 BHK Luxury Residences"
}

export interface DiscoveryProperty {
  id: string;
  title: string;
  code: string;
  mainCategory: Exclude<PropertyMainCategory, 'All'>;
  subtype: PropertySubtype;
  location: string;
  city: string;
  state: string;
  developer: string;
  price: number;
  priceLabel: string;
  pricePerSqft?: number;
  availability: UnitAvailability | 'Ready to Move' | 'Under Construction' | 'Immediate Possession' | string;
  status: ProjectStatus;
  images: {
    cover: string;
    gallery: Array<{
      url: string;
      label: string;
      category: 'Exterior' | 'Interior' | 'Amenities' | 'Entrance' | 'Plan';
      altText: string;
    }>;
  };
  highlights: string[];
  description: string;
  featured?: boolean;
  // Specific Specifications (mutually exclusive display rules)
  residentialSpecs?: ResidentialSpecs;
  landSpecs?: LandSpecs;
  commercialSpecs?: CommercialSpecs;
  projectSpecs?: ProjectSpecs;
  // Link to existing DB records
  linkedProjectId?: string;
  linkedUnitId?: string;
}

export interface DiscoveryFilters {
  query: string;
  category: PropertyMainCategory;
  subtype: PropertySubtype | null;
  city: string;
  pricePreset: string;
  minPrice: number | null;
  maxPrice: number | null;
  areaPreset: string;
  minArea: number | null;
  maxArea: number | null;
  availability: string;
  bhk: string[];
  parking: string;
  furnishing: string;
  zoning: string;
  facing: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'code-asc';
}

