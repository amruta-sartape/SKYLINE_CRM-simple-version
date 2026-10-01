import {
  PropertyMainCategory,
  PropertySubtype,
  PropertyTypeMetadata,
  DiscoveryProperty,
} from '../types/discovery.types';
import { PropertyProject, PropertyUnit } from '../types/property.types';
import { getProjectImageSet } from './propertyImageMap';

export const PROPERTY_TYPES_CATALOG: PropertyTypeMetadata[] = [
  // Residential (7 types)
  {
    id: 'Apartment',
    label: 'Apartment',
    category: 'Residential',
    description: 'High-rise residential units with shared amenities & concierge',
    iconName: 'Building2',
    tag: 'High-Rise Living',
    image: '/images/classifications/apartment.jpg',
  },
  {
    id: 'Flat',
    label: 'Flat',
    category: 'Residential',
    description: 'Contemporary multi-family flats in urban residential blocks',
    iconName: 'Home',
    tag: 'Urban Homes',
    image: '/images/classifications/flat.jpg',
  },
  {
    id: 'Villa',
    label: 'Villa',
    category: 'Residential',
    description: 'Independent luxury homes with private lawns & pool decks',
    iconName: 'Palmtree',
    tag: 'Private Luxury',
    image: '/images/classifications/villa.jpg',
  },
  {
    id: 'Row House',
    label: 'Row House',
    category: 'Residential',
    description: 'Multi-level attached homes with dedicated parking & private gardens',
    iconName: 'Rows',
    tag: 'Community Enclave',
    image: '/images/classifications/row-house.jpg',
  },
  {
    id: 'Bungalow',
    label: 'Bungalow',
    category: 'Residential',
    description: 'Sprawling single or double-storey standalone estates',
    iconName: 'Landmark',
    tag: 'Estate Living',
    image: '/images/classifications/bungalow.jpg',
  },
  {
    id: 'Penthouse',
    label: 'Penthouse',
    category: 'Residential',
    description: 'Top-floor sky suites with panoramic horizon views & terraces',
    iconName: 'Sparkles',
    tag: 'Sky Luxury',
    image: '/images/classifications/penthouse.jpg',
  },
  {
    id: 'Studio',
    label: 'Studio',
    category: 'Residential',
    description: 'Smart compact living spaces optimized for urban professionals',
    iconName: 'Compass',
    tag: 'Compact Living',
    image: '/images/classifications/studio.jpg',
  },

  // Land (3 types)
  {
    id: 'Residential Plot',
    label: 'Residential Plot',
    category: 'Land',
    description: 'Clear-title NA freehold residential land parcels with road frontage',
    iconName: 'MapPin',
    tag: 'Build Custom',
    image: '/images/classifications/residential-plot.jpg',
  },
  {
    id: 'Commercial Plot',
    label: 'Commercial Plot',
    category: 'Land',
    description: 'High-FSI commercial zoned plots on major transit corridors',
    iconName: 'Maximize2',
    tag: 'High FSI Land',
    image: '/images/classifications/commercial-plot.jpg',
  },
  {
    id: 'Farm Land',
    label: 'Farm Land',
    category: 'Land',
    description: 'Scenic fertile agricultural & agro-tourism land with water access',
    iconName: 'Trees',
    tag: 'Agro & Retreat',
    image: '/images/classifications/farm-land.jpg',
  },

  // Commercial (5 types)
  {
    id: 'Office',
    label: 'Office',
    category: 'Commercial',
    description: 'Grade-A corporate office suites, IT parks & co-working floors',
    iconName: 'Briefcase',
    tag: 'Corporate Space',
    image: '/images/classifications/office.jpg',
  },
  {
    id: 'Shop / Retail',
    label: 'Shop / Retail',
    category: 'Commercial',
    description: 'High-footfall ground retail storefronts in shopping arcades',
    iconName: 'ShoppingBag',
    tag: 'High Footfall',
    image: '/images/classifications/shop.jpg',
  },
  {
    id: 'Showroom',
    label: 'Showroom',
    category: 'Commercial',
    description: 'Double-height glass-front retail flagship display spaces',
    iconName: 'Store',
    tag: 'Main Road Facing',
    image: '/images/classifications/showroom.jpg',
  },
  {
    id: 'Commercial Building',
    label: 'Commercial Building',
    category: 'Commercial',
    description: 'Standalone multi-storey commercial towers for single or multi-tenants',
    iconName: 'Building',
    tag: 'Standalone Tower',
    image: '/images/classifications/commercial-building.jpg',
  },
  {
    id: 'Warehouse',
    label: 'Warehouse',
    category: 'Commercial',
    description: 'Industrial grade logistics hubs with heavy loading bays & high clear height',
    iconName: 'Boxes',
    tag: 'Logistics Hub',
    image: '/images/classifications/warehouse.jpg',
  },

  // Projects (4 types)
  {
    id: 'Commercial Project',
    label: 'Commercial Project',
    category: 'Projects',
    description: 'Integrated business tech parks with retail hubs & conventions',
    iconName: 'Layers',
    tag: 'Business District',
    image: '/images/classifications/commercial-project.jpg',
  },
  {
    id: 'Mixed-use Project',
    label: 'Mixed-use Project',
    category: 'Projects',
    description: 'Vibrant developments combining residential, retail & office towers',
    iconName: 'Share2',
    tag: 'Live-Work-Play',
    image: '/images/classifications/mixed-use.jpg',
  },
  {
    id: 'Township',
    label: 'Township',
    category: 'Projects',
    description: 'Master-planned self-contained townships with schools & hospitals',
    iconName: 'Network',
    tag: 'Integrated Living',
    image: '/images/classifications/township.jpg',
  },
  {
    id: 'Gated Community',
    label: 'Gated Community',
    category: 'Projects',
    description: 'Exclusive multi-acre gated enclaves with private clubhouses',
    iconName: 'Shield',
    tag: 'Secure Enclave',
    image: '/images/classifications/gated-community.jpg',
  },
];

export const MAIN_CATEGORIES: Array<{
  id: PropertyMainCategory;
  label: string;
  countKey?: string;
}> = [
  { id: 'All', label: 'All Real Estate' },
  { id: 'Residential', label: 'Residential' },
  { id: 'Commercial', label: 'Commercial' },
  { id: 'Land', label: 'Plots & Land' },
  { id: 'Projects', label: 'Master Projects' },
];

export function formatPrice(val: number): string {
  if (val >= 10000000) {
    const cr = (val / 10000000).toFixed(2);
    return `₹${cr} Cr`;
  }
  if (val >= 100000) {
    const l = (val / 100000).toFixed(1);
    return `₹${l} L`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

export interface PricePreset {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
}

export const PRICE_PRESETS: PricePreset[] = [
  { id: 'all', label: 'All Budgets', min: null, max: null },
  { id: 'under-50l', label: 'Under ₹50 Lakh', min: 0, max: 5000000 },
  { id: '50l-1cr', label: '₹50 Lakh – ₹1 Crore', min: 5000000, max: 10000000 },
  { id: '1cr-3cr', label: '₹1 Crore – ₹3 Crore', min: 10000000, max: 30000000 },
  { id: '3cr-5cr', label: '₹3 Crore – ₹5 Crore', min: 30000000, max: 50000000 },
  { id: '5cr-10cr', label: '₹5 Crore – ₹10 Crore', min: 50000000, max: 100000000 },
  { id: 'above-10cr', label: 'Above ₹10 Crore', min: 100000000, max: null },
];

export interface AreaPreset {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
}

export const AREA_PRESETS: AreaPreset[] = [
  { id: 'all', label: 'All Sizes', min: null, max: null },
  { id: 'under-1000', label: 'Under 1,000 sq.ft', min: 0, max: 1000 },
  { id: '1000-2000', label: '1,000 – 2,000 sq.ft', min: 1000, max: 2000 },
  { id: '2000-3500', label: '2,000 – 3,500 sq.ft', min: 2000, max: 3500 },
  { id: '3500-5000', label: '3,500 – 5,000 sq.ft', min: 3500, max: 5000 },
  { id: 'above-5000', label: 'Above 5,000 sq.ft', min: 5000, max: null },
];

export const BHK_OPTIONS = [
  { id: '1 BHK', label: '1 BHK / Studio' },
  { id: '2 BHK', label: '2 BHK' },
  { id: '3 BHK', label: '3 BHK' },
  { id: '4 BHK', label: '4 BHK' },
  { id: '5 BHK+', label: '5 BHK+' },
];

export const AVAILABILITY_OPTIONS = [
  { id: 'All', label: 'All Availabilities' },
  { id: 'Ready to Move', label: 'Ready to Move' },
  { id: 'Under Construction', label: 'Under Construction' },
  { id: 'Immediate Possession', label: 'Immediate Possession' },
];

export const FURNISHING_OPTIONS = [
  { id: 'All', label: 'All Furnishing' },
  { id: 'Bare Shell', label: 'Bare Shell' },
  { id: 'Warm Shell', label: 'Warm Shell' },
  { id: 'Fully Furnished', label: 'Fully Furnished' },
  { id: 'Plug & Play', label: 'Plug & Play' },
];

export const ZONING_OPTIONS = [
  { id: 'All', label: 'All Zoning Types' },
  { id: 'Residential R-Zone', label: 'Residential R-Zone' },
  { id: 'Commercial High-FSI', label: 'Commercial High-FSI' },
  { id: 'Agricultural & Agro', label: 'Agricultural & Agro' },
];

export const FACING_OPTIONS = [
  { id: 'All', label: 'All Facings' },
  { id: 'East', label: 'East Facing / Vastu' },
  { id: 'North', label: 'North Facing' },
  { id: 'West', label: 'West Facing' },
  { id: 'South', label: 'South Facing' },
  { id: 'Corner', label: 'Corner / Road Facing' },
];

export const PARKING_OPTIONS = [
  { id: 'All', label: 'Any Parking' },
  { id: '1+', label: '1+ Car Parking' },
  { id: '2+', label: '2+ Car Parking' },
  { id: '3+', label: '3+ Cars / Portico' },
];

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured & Recommended' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'area-asc', label: 'Area: Low to High' },
  { id: 'area-desc', label: 'Area: High to Low' },
  { id: 'code-asc', label: 'Property Code / ID' },
];

export function getPropertyArea(p: DiscoveryProperty): number {
  if (p.residentialSpecs) {
    return p.residentialSpecs.carpetArea || p.residentialSpecs.builtUpArea || p.residentialSpecs.plotArea || 0;
  }
  if (p.commercialSpecs) {
    return p.commercialSpecs.commercialArea || 0;
  }
  if (p.landSpecs) {
    const text = p.landSpecs.plotArea || '';
    if (text.includes('Acre')) {
      const match = text.match(/([\d.]+)\s*Acre/i);
      if (match) return parseFloat(match[1]) * 43560;
    }
    const cleanNum = text.replace(/,/g, '').match(/\d+/);
    if (cleanNum) return parseInt(cleanNum[0], 10);
    return 0;
  }
  if (p.projectSpecs) {
    const text = p.projectSpecs.landParcel || '';
    if (text.includes('Acre')) {
      const match = text.match(/([\d.]+)\s*Acre/i);
      if (match) return parseFloat(match[1]) * 43560;
    }
    return 10000;
  }
  return 0;
}


/**
 * Builds a comprehensive list of customer discovery properties by merging
 * real database Project/Unit records and realistic typed catalog properties.
 * Every individual property has its own unique, non-overlapping image set.
 */
export function buildDiscoveryCatalog(
  dbProjects: PropertyProject[] = [],
  dbUnits: PropertyUnit[] = [],
  dbListings: any[] = []
): DiscoveryProperty[] {
  const items: DiscoveryProperty[] = [];

  // 0. Convert Admin-created DB Property Listings
  if (dbListings && dbListings.length > 0) {
    dbListings.forEach((l) => {
      if (l.is_active === 0 || l.status === 'Archived') return;

      const galleryImages =
        l.images && l.images.length > 0
          ? l.images.map((img: any) => ({
              url: img.url,
              label: img.label || l.title,
              category: img.category || 'Exterior',
              altText: img.alt_text || l.title,
            }))
          : l.cover_image
          ? [
              {
                url: l.cover_image,
                label: l.title,
                category: 'Exterior',
                altText: l.title,
              },
            ]
          : [];

      const cover =
        l.cover_image || galleryImages[0]?.url || '/images/classifications/apartment.jpg';

      const specs = l.specs_data || {};

      const propItem: DiscoveryProperty = {
        id: l.id,
        title: l.title,
        code: l.code,
        mainCategory: l.main_category,
        subtype: l.subtype,
        location: l.location,
        city: l.city,
        state: l.state || 'Maharashtra',
        developer: l.developer || 'Skyline Realty Group',
        price: Number(l.price),
        priceLabel: l.price_label || formatPrice(Number(l.price)),
        pricePerSqft: l.price_per_sqft || Math.round(Number(l.price) / 1200),
        availability: l.availability || 'Available',
        status: (l.status as any) || 'Active',
        images: {
          cover,
          gallery:
            galleryImages.length > 0
              ? galleryImages
              : [{ url: cover, label: l.title, category: 'Exterior', altText: l.title }],
        },
        highlights: Array.isArray(l.highlights)
          ? l.highlights
          : typeof l.highlights === 'string'
          ? JSON.parse(l.highlights)
          : [],
        description: l.description || `${l.title} in prime ${l.location}, ${l.city}.`,
        featured: true,
        residentialSpecs: specs.residentialSpecs || (l.main_category === 'Residential' ? specs : undefined),
        landSpecs: specs.landSpecs || (l.main_category === 'Land' ? specs : undefined),
        commercialSpecs: specs.commercialSpecs || (l.main_category === 'Commercial' ? specs : undefined),
        projectSpecs: specs.projectSpecs || (l.main_category === 'Projects' ? specs : undefined),
      };

      items.push(propItem);
    });
  }


  // 1. Convert real database projects into premier discovery properties
  // (Ensures each project from Phase 3 has a dedicated, unique 4-image set)
  if (dbProjects.length > 0) {
    dbProjects.forEach((proj, idx) => {
      const projectUnits = dbUnits.filter((u) => u.project_id === proj.id);
      const minPrice = projectUnits.length > 0 ? Math.min(...projectUnits.map((u) => u.price)) : 16500000;
      const maxPrice = projectUnits.length > 0 ? Math.max(...projectUnits.map((u) => u.price)) : 38000000;
      const availableUnitsCount = projectUnits.filter((u) => u.availability_status === 'Available').length;

      const name = proj.name.toLowerCase();
      let subtype: PropertySubtype = 'Apartment';
      let mainCategory: Exclude<PropertyMainCategory, 'All'> = 'Residential';

      if (name.includes('oasis') || name.includes('villa')) {
        subtype = 'Villa';
      } else if (name.includes('pinnacle')) {
        subtype = 'Penthouse';
      } else if (name.includes('heights') || name.includes('grandeur')) {
        subtype = 'Flat';
      }

      const imgSet = getProjectImageSet(proj, idx);

      const propItem: DiscoveryProperty = {
        id: `prop_proj_${proj.id}`,
        title: proj.name,
        code: proj.code,
        mainCategory,
        subtype,
        location: proj.location,
        city: proj.city,
        state: proj.state,
        developer: proj.developer,
        price: minPrice,
        priceLabel: minPrice === maxPrice ? formatPrice(minPrice) : `From ${formatPrice(minPrice)}`,
        pricePerSqft: Math.round(minPrice / 1250),
        availability: availableUnitsCount > 0 ? `${availableUnitsCount} Units Ready` : 'Ready to Move',
        status: proj.status,
        images: {
          cover: imgSet.cover,
          gallery: imgSet.gallery,
        },
        highlights: [
          `${proj.total_wings || 4} Residential Wings`,
          `${proj.total_units || 48} Luxury Units`,
          'Concierge & 5-Star Amenities',
          'RERA Approved Development',
        ],
        description:
          proj.description ||
          `Iconic architectural residential development by ${proj.developer} situated in prime ${proj.location}, ${proj.city}. Featuring luxury residences, lifestyle clubhouses, and world-class landscaping.`,
        featured: true,
        linkedProjectId: proj.id,
        residentialSpecs: {
          bhk: subtype === 'Villa' ? '4 & 5 BHK Sky Villas' : subtype === 'Penthouse' ? '4 BHK Duplex Penthouse' : '2 & 3 BHK Luxury Residences',
          bedrooms: subtype === 'Villa' ? 5 : subtype === 'Penthouse' ? 4 : 3,
          bathrooms: subtype === 'Villa' ? 6 : subtype === 'Penthouse' ? 5 : 3,
          carpetArea: subtype === 'Villa' ? 3400 : subtype === 'Penthouse' ? 2850 : 1350,
          builtUpArea: subtype === 'Villa' ? 4200 : subtype === 'Penthouse' ? 3600 : 1750,
          plotArea: subtype === 'Villa' ? 4500 : undefined,
          floor: subtype === 'Penthouse' ? 'Top Levels (27-28)' : '14th Floor',
          totalFloors: 28,
          parking: '2 Covered Basement Slots',
          societyOrProject: proj.name,
          facing: 'East Facing Vastu',
          terraceArea: subtype === 'Penthouse' ? 580 : undefined,
        },
      };

      items.push(propItem);
    });
  }

  // 2. Add realistic, high-grade typed discovery properties for all remaining classifications
  // (Ensuring every single property subtype in the catalog has authentic, type-specific cards with unique images)
  const supplementalProperties: DiscoveryProperty[] = [
    // --- RESIDENTIAL SUBTYPES ---
    {
      id: 'prop_res_row_01',
      title: 'Skyline Palms 3 BHK Luxury Row House',
      code: 'SKP-RH-04',
      mainCategory: 'Residential',
      subtype: 'Row House',
      location: 'Koregaon Park Annexe',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Lifestyle Homes',
      price: 26500000,
      priceLabel: '₹2.65 Cr',
      pricePerSqft: 11520,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_res_row_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_res_row_01/cover.jpg',
            label: 'Private Garden Row House Facade',
            category: 'Exterior',
            altText: 'Modern multi-level row house with private lawn and parking',
          },
          {
            url: '/images/properties/prop_res_row_01/living.jpg',
            label: 'Open-Concept Living & Dining',
            category: 'Interior',
            altText: 'Spacious sunlit living room opening to backyard garden',
          },
          {
            url: '/images/properties/prop_res_row_01/amenities.jpg',
            label: 'Clubhouse & Tennis Court',
            category: 'Amenities',
            altText: 'Exclusive community clubhouse and landscaped grounds',
          },
          {
            url: '/images/properties/prop_res_row_01/entrance.jpg',
            label: 'Gated Boulevard Entrance',
            category: 'Entrance',
            altText: 'Gated entrance with paved driveway and landscape',
          },
        ],
      },
      highlights: [
        '3 BHK Triplex Design',
        '2,300 sq.ft Built-Up Area',
        '450 sq.ft Private Back Lawn',
        '2 Covered Car Parking Bays',
      ],
      description:
        'Architectural multi-tier 3 BHK row house with private landscaped lawn, private rooftop pergola terrace, and covered carports inside a gated society.',
      featured: true,
      residentialSpecs: {
        bhk: '3 BHK Triplex',
        bedrooms: 3,
        bathrooms: 4,
        carpetArea: 1950,
        builtUpArea: 2300,
        plotArea: 1650,
        floor: 'G + 2 Floors',
        totalFloors: 3,
        parking: '2 Dedicated Covered Carports',
        societyOrProject: 'Skyline Palms Enclave',
        facing: 'North-East Facing',
        terraceArea: 320,
      },
    },
    {
      id: 'prop_res_bung_01',
      title: 'Skyline Royal Crest 5 BHK Independent Bungalow',
      code: 'SKR-BG-01',
      mainCategory: 'Residential',
      subtype: 'Bungalow',
      location: 'Jubilee Hills Road No. 36',
      city: 'Hyderabad',
      state: 'Telangana',
      developer: 'Skyline Estates Private Ltd',
      price: 89000000,
      priceLabel: '₹8.90 Cr',
      pricePerSqft: 15340,
      availability: 'Immediate Possession',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_res_bung_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_res_bung_01/cover.jpg',
            label: 'Bungalow Front Elevation & Lawns',
            category: 'Exterior',
            altText: 'Expansive private bungalow estate with manicured trees and circular driveway',
          },
          {
            url: '/images/properties/prop_res_bung_01/interior.jpg',
            label: 'Grand Double-Height Foyer',
            category: 'Interior',
            altText: 'Double-height living pavilion with imported marble floors',
          },
          {
            url: '/images/properties/prop_res_bung_01/terrace.jpg',
            label: 'Private Sky Pavilion & Deck',
            category: 'Amenities',
            altText: 'Private outdoor lounge terrace overlooking lush estate grounds',
          },
          {
            url: '/images/properties/prop_res_bung_01/entrance.jpg',
            label: 'Grand Estate Portico',
            category: 'Entrance',
            altText: 'Private estate grand arrival gate and water feature',
          },
        ],
      },
      highlights: [
        '5 BHK Palatial Bungalow',
        '5,800 sq.ft Built-up Area',
        '6,200 sq.ft Freehold Plot',
        'Private Swimming Pool & Home Theater',
      ],
      description:
        'Standalone luxury 5 BHK bungalow estate in prime Jubilee Hills. Features a private swimming pool, landscaped lawn, dedicated staff quarters, and 4-car parking portico.',
      featured: true,
      residentialSpecs: {
        bhk: '5 BHK Luxury Estate',
        bedrooms: 5,
        bathrooms: 6,
        carpetArea: 4850,
        builtUpArea: 5800,
        plotArea: 6200,
        floor: 'G + 1 Standalone',
        totalFloors: 2,
        parking: '4 Car Private Portico',
        societyOrProject: 'Skyline Royal Crest',
        facing: 'East Facing Vastu',
        terraceArea: 850,
      },
    },
    {
      id: 'prop_res_studio_01',
      title: 'Skyline SkyLoft Designer 1 BHK Studio Apartment',
      code: 'SK-LOFT-402',
      mainCategory: 'Residential',
      subtype: 'Studio',
      location: 'Indiranagar 100 ft Road',
      city: 'Bangalore',
      state: 'Karnataka',
      developer: 'Skyline Lifestyle Homes',
      price: 6800000,
      priceLabel: '₹68.0 L',
      pricePerSqft: 12360,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_res_studio_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_res_studio_01/cover.jpg',
            label: 'Open Plan Studio Loft',
            category: 'Interior',
            altText: 'Modern sunlit compact studio apartment with hardwood floors and city views',
          },
          {
            url: '/images/properties/prop_res_studio_01/interior.jpg',
            label: 'Integrated Kitchenette & Bar',
            category: 'Interior',
            altText: 'Sleek modular kitchenette with built-in appliances',
          },
          {
            url: '/images/properties/prop_res_studio_01/amenities.jpg',
            label: 'Rooftop Coworking & Cafe',
            category: 'Amenities',
            altText: 'Rooftop lounge, cafe, and high-speed Wi-Fi co-working pods',
          },
          {
            url: '/images/properties/prop_res_studio_01/entrance.jpg',
            label: 'Smart Keyless Building Entrance',
            category: 'Entrance',
            altText: 'Contemporary entrance lobby with smart digital access',
          },
        ],
      },
      highlights: [
        '550 sq.ft Smart Studio Loft',
        'Fully Furnished Modular Setup',
        'High Rental Yield 6.2%',
        'Smart Home Automation Included',
      ],
      description:
        'Designer boutique studio apartment in the heart of Indiranagar. Ideal for tech entrepreneurs, young professionals, and high-yield real estate investors.',
      featured: false,
      residentialSpecs: {
        bhk: 'Studio 1 RK',
        bedrooms: 1,
        bathrooms: 1,
        carpetArea: 420,
        builtUpArea: 550,
        floor: '4th Floor',
        totalFloors: 8,
        parking: '1 Two-Wheeler + 1 Optional Car Bay',
        societyOrProject: 'Skyline SkyLoft Boutique',
        facing: 'North Facing',
      },
    },

    // --- LAND & PLOT SUBTYPES ---
    {
      id: 'prop_land_res_01',
      title: 'Skyline Meadow Plots — Premium Residential Plot',
      code: 'SKM-PL-12',
      mainCategory: 'Land',
      subtype: 'Residential Plot',
      location: 'Devanahalli Airport Corridor',
      city: 'Bangalore',
      state: 'Karnataka',
      developer: 'Skyline Land & Infra Corp',
      price: 9800000,
      priceLabel: '₹98.0 L',
      pricePerSqft: 4083,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_land_res_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_land_res_01/cover.jpg',
            label: 'Demarcated Sector Plot & Paved Boulevard',
            category: 'Exterior',
            altText: 'Paved wide sector roads with underground cabling and street lights',
          },
          {
            url: '/images/properties/prop_land_res_01/context.jpg',
            label: 'Lush Green Surrounding Enclave',
            category: 'Exterior',
            altText: 'Scenic green landscape surrounding the plotted development',
          },
          {
            url: '/images/properties/prop_land_res_01/entrance.jpg',
            label: 'Grand Gated Archway & Security',
            category: 'Entrance',
            altText: '24/7 guarded boom barrier entrance gate with surveillance',
          },
        ],
      },
      highlights: [
        '2,400 sq.ft (40 x 60 ft) Clear Title',
        'East Facing Corner Plot',
        '40 ft Wide Sector Asphalt Road',
        'BMRDA & RERA Approved',
      ],
      description:
        'Prime 2,400 sq.ft residential plot in an upscale gated layout. 100% clear title with underground electricity, stormwater drains, water pipeline, and clubhouse access.',
      landSpecs: {
        plotArea: '2,400 sq.ft (266.6 sq.yd)',
        dimensions: '40 ft x 60 ft',
        roadWidth: '40 ft Wide Sector Road',
        facing: 'East Facing Corner',
        zoning: 'Residential R-Zone (100% Freehold)',
        roadAccess: 'Asphalt Paved Road with Avenue Trees',
        utilities: 'Underground Power, Water Connection & Fiber-Optic Ready',
      },
    },
    {
      id: 'prop_land_comm_01',
      title: 'Skyline Apex Commercial Development Plot',
      code: 'SK-CPL-02',
      mainCategory: 'Land',
      subtype: 'Commercial Plot',
      location: 'Hinjawadi Phase 1 Highway',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Commercial Properties',
      price: 45000000,
      priceLabel: '₹4.50 Cr',
      pricePerSqft: 7500,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_land_comm_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_land_comm_01/cover.jpg',
            label: 'Commercial Highway Frontage Plot',
            category: 'Exterior',
            altText: 'Prime commercial development land plot facing multi-lane arterial road',
          },
          {
            url: '/images/properties/prop_land_comm_01/skyline.jpg',
            label: 'Urban Skyline Backdrop',
            category: 'Exterior',
            altText: 'City skyline and IT park towers in immediate vicinity',
          },
          {
            url: '/images/properties/prop_land_comm_01/corridor.jpg',
            label: 'Adjoining Tech Corridor Towers',
            category: 'Exterior',
            altText: 'Adjacent modern glass tech park towers along the business corridor',
          },
        ],
      },
      highlights: [
        '6,000 sq.ft Commercial Freehold',
        '60 ft Highway Road Frontage',
        'High FSI 2.5 Approved',
        'Ideal for Showroom / Office Building',
      ],
      description:
        'High-visibility commercial plot directly facing the Hinjawadi IT highway. Approved for commercial development with high FSI up to G+6 floors.',
      landSpecs: {
        plotArea: '6,000 sq.ft (666 sq.yd)',
        dimensions: '60 ft Frontage x 100 ft Depth',
        roadWidth: '80 ft Main Arterial Highway',
        facing: 'North-East Road Facing',
        zoning: 'Commercial High-FSI Zone',
        roadAccess: 'Direct Highway Access with Service Lane',
        utilities: 'High-Tension Power Line & Municipal Water Supply',
      },
    },
    {
      id: 'prop_land_farm_01',
      title: 'Skyline Green Meadows Agro Farm Estate',
      code: 'SK-FARM-05',
      mainCategory: 'Land',
      subtype: 'Farm Land',
      location: 'Lonavala Foothills (Pawna Valley)',
      city: 'Lonavala',
      state: 'Maharashtra',
      developer: 'Skyline Agro Real Estate',
      price: 18500000,
      priceLabel: '₹1.85 Cr',
      pricePerSqft: 170,
      availability: 'Immediate Possession',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_land_farm_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_land_farm_01/cover.jpg',
            label: 'Scenic Mountain Valley Farm Parcel',
            category: 'Exterior',
            altText: 'Fertile green agricultural farmland with mountain backdrop',
          },
          {
            url: '/images/properties/prop_land_farm_01/landscape.jpg',
            label: 'Surveyed Boundary & Country Road',
            category: 'Exterior',
            altText: 'Wide agricultural access road with boundary fencing',
          },
          {
            url: '/images/properties/prop_land_farm_01/lake.jpg',
            label: 'Nearby Lake & Natural Stream',
            category: 'Exterior',
            altText: 'Scenic natural lake and green hillside panorama',
          },
        ],
      },
      highlights: [
        '2.5 Acres Fertile Organic Farmland',
        'Private Perennial Stream & Borewell',
        '30 ft Tar Road Access to Boundary',
        'Clear Title 7/12 Extract',
      ],
      description:
        'Panoramic 2.5-acre agricultural farm land surrounded by lush green hills. Perfect for luxury organic farmhouses, weekend retreats, or agro-horticulture projects.',
      landSpecs: {
        plotArea: '2.5 Acres (1,08,900 sq.ft)',
        dimensions: 'Irregular Valley Contour (Approx 320 ft x 340 ft)',
        roadWidth: '30 ft Village Tar Road',
        facing: 'South-West Mountain Facing',
        zoning: 'Agricultural & Agro-Tourism Permitted',
        roadAccess: 'Direct Tar Road Connectivity from Expressway',
        utilities: 'Perennial Natural Spring, Borewell & 3-Phase Agro Electricity',
      },
    },

    // --- COMMERCIAL SUBTYPES ---
    {
      id: 'prop_comm_off_01',
      title: 'Skyline Nexus Grade-A Executive Office Suite',
      code: 'SK-OFF-802',
      mainCategory: 'Commercial',
      subtype: 'Office',
      location: 'Bandra Kurla Complex (BKC)',
      city: 'Mumbai',
      state: 'Maharashtra',
      developer: 'Skyline Commercial Properties',
      price: 52000000,
      priceLabel: '₹5.20 Cr',
      pricePerSqft: 28100,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_comm_off_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_comm_off_01/cover.jpg',
            label: 'Corporate Tech Tower Glass Facade',
            category: 'Exterior',
            altText: 'Modern commercial office building with glass facade and plaza',
          },
          {
            url: '/images/properties/prop_comm_off_01/lounge.jpg',
            label: 'Executive Boardroom & Sky Lounge',
            category: 'Interior',
            altText: 'Modern corporate executive suite with skyline views',
          },
          {
            url: '/images/properties/prop_comm_off_01/tower.jpg',
            label: 'Crown Glass Tower Elevation',
            category: 'Exterior',
            altText: 'Illuminated glass crown skyscraper elevation in evening lighting',
          },
          {
            url: '/images/properties/prop_comm_off_01/entrance.jpg',
            label: 'Double-Height Corporate Lobby',
            category: 'Entrance',
            altText: 'Illuminated corporate lobby and turnstile security gate',
          },
        ],
      },
      highlights: [
        '1,850 sq.ft Fully Furnished Carpet',
        'Floor 8 with City Skyline View',
        'Plug & Play (26 Desks + 2 Cabins + Boardroom)',
        '3 Reserved Basement Car Parking Slots',
      ],
      description:
        'Grade-A corporate office suite in prime BKC financial center. Features 100% DG power backup, central HVAC, double-glazed soundproof glass facade, and high-speed elevators.',
      featured: true,
      commercialSpecs: {
        commercialArea: 1850,
        floor: '8th Floor (Tower Alpha)',
        building: 'Skyline Nexus Tech Park',
        frontage: 'Double-Glazed Panoramic Glass Elevation',
        ceilingHeight: '11.5 ft Clear Finished Ceiling',
        furnishing: 'Fully Furnished',
        parking: '3 Reserved Covered Basement Slots',
      },
    },
    {
      id: 'prop_comm_shop_01',
      title: 'Skyline Galleria Ground High-Street Retail Shop',
      code: 'SK-SH-G14',
      mainCategory: 'Commercial',
      subtype: 'Shop / Retail',
      location: 'MG Road Promenade',
      city: 'Bangalore',
      state: 'Karnataka',
      developer: 'Skyline Commercial Properties',
      price: 21000000,
      priceLabel: '₹2.10 Cr',
      pricePerSqft: 32300,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_comm_shop_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_comm_shop_01/cover.jpg',
            label: 'Retail Arcade Boulevard Front',
            category: 'Exterior',
            altText: 'High footfall ground floor luxury boutique shop storefront',
          },
          {
            url: '/images/properties/prop_comm_shop_01/interior.jpg',
            label: 'Interior Display & Cashier Counter',
            category: 'Interior',
            altText: 'Fitted retail boutique interior with illuminated display shelves',
          },
          {
            url: '/images/properties/prop_comm_shop_01/promenade.jpg',
            label: 'Pedestrian Shopping Plaza',
            category: 'Exterior',
            altText: 'Lively pedestrian shopping promenade with fountains and cafes',
          },
        ],
      },
      highlights: [
        '650 sq.ft Ground Floor Carpet',
        '22 ft Wide Full Glass Display Frontage',
        'High Footfall Shopping Boulevard',
        'Dedicated Customer Valet & Basement Parking',
      ],
      description:
        'High-visibility ground floor retail shop on prime commercial promenade. Ideal for luxury boutiques, apparel flagships, electronics, or specialty cafes.',
      commercialSpecs: {
        commercialArea: 650,
        floor: 'Ground Floor (Main Arcade)',
        building: 'Skyline Galleria High-Street',
        frontage: '22 ft Wide Floor-to-Ceiling Glass Display',
        ceilingHeight: '14 ft High Clear Ceiling (Mezzanine Feasible)',
        furnishing: 'Warm Shell',
        parking: 'Ample Visitor & Basement Customer Parking',
      },
    },
    {
      id: 'prop_comm_show_01',
      title: 'Skyline Boulevard Prime Highway Automobile Showroom',
      code: 'SK-SHW-01',
      mainCategory: 'Commercial',
      subtype: 'Showroom',
      location: 'S.G. Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      developer: 'Skyline Commercial Properties',
      price: 95000000,
      priceLabel: '₹9.50 Cr',
      pricePerSqft: 22600,
      availability: 'Immediate Possession',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_comm_show_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_comm_show_01/cover.jpg',
            label: 'Highway Facing Showroom Glass Facade',
            category: 'Exterior',
            altText: 'Double height commercial showroom with structural glazing and customer parking',
          },
          {
            url: '/images/properties/prop_comm_show_01/exterior.jpg',
            label: 'Corporate Tower Complex View',
            category: 'Exterior',
            altText: 'Modern commercial tower backdrop and illuminated facade',
          },
          {
            url: '/images/properties/prop_comm_show_01/lounge.jpg',
            label: 'Customer VIP Delivery Lounge',
            category: 'Interior',
            altText: 'VIP hospitality lounge and negotiation suite',
          },
        ],
      },
      highlights: [
        '4,200 sq.ft Double-Height Carpet',
        '55 ft Road Frontage on Main S.G. Highway',
        'Ground + Mezzanine Floor Structure',
        '10 Dedicated Front Customer Parking Bays',
      ],
      description:
        'Iconic double-height showroom with 55-foot uninterrupted glass frontage facing S.G. Highway. Ideal for automobile flagships, luxury furniture, or jewelry brands.',
      commercialSpecs: {
        commercialArea: 4200,
        floor: 'Ground (3,000 sq.ft) + Mezzanine (1,200 sq.ft)',
        building: 'Skyline Boulevard Commercial Center',
        frontage: '55 ft Structural Glazing Frontage',
        ceilingHeight: '22 ft Double-Height Clear Ceiling',
        furnishing: 'Bare Shell',
        parking: '10 Dedicated Surface Parking Bays + Basement',
      },
    },
    {
      id: 'prop_comm_bldg_01',
      title: 'Skyline Apex Standalone 12-Story Commercial Tower',
      code: 'SK-BLDG-01',
      mainCategory: 'Commercial',
      subtype: 'Commercial Building',
      location: 'Financial District, Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      developer: 'Skyline Commercial Properties',
      price: 240000000,
      priceLabel: '₹24.0 Cr',
      pricePerSqft: 18500,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_comm_bldg_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_comm_bldg_01/cover.jpg',
            label: '12-Story Glass Commercial Tower',
            category: 'Exterior',
            altText: 'Standalone modern commercial glass tower with illuminated crown',
          },
          {
            url: '/images/properties/prop_comm_bldg_01/lobby.jpg',
            label: 'Grand Triple-Height Entrance Foyer',
            category: 'Entrance',
            altText: 'Grand illuminated corporate entrance lobby and concierge',
          },
          {
            url: '/images/properties/prop_comm_bldg_01/lounge.jpg',
            label: 'Executive Penthouse Boardroom',
            category: 'Interior',
            altText: 'Rooftop boardroom suite overlooking the financial district skyline',
          },
        ],
      },
      highlights: [
        '1,30,000 sq.ft Total Commercial Space',
        'G+12 Floors with 3 Basements',
        'Single Corporate Tenant / Subdivisible',
        'LEED Gold Certified Green Building',
      ],
      description:
        'Standalone Grade-A 12-story commercial corporate headquarters building in Gachibowli. Features 3 basement parking levels (250 cars), high-efficiency central HVAC, and 4 high-speed elevators.',
      featured: true,
      commercialSpecs: {
        commercialArea: 130000,
        floor: 'Entire Building (G + 12 Floors)',
        building: 'Skyline Apex Corporate Tower',
        frontage: '100 ft Four-Side Open Glass Facade',
        ceilingHeight: '12 ft Floor-to-Floor Height',
        furnishing: 'Warm Shell',
        parking: '250 Basement Dedicated Parking Bays',
      },
    },
    {
      id: 'prop_comm_ware_01',
      title: 'Skyline Logistics Hub Grade-A Industrial Warehouse',
      code: 'SK-LOG-WH03',
      mainCategory: 'Commercial',
      subtype: 'Warehouse',
      location: 'Chakan Industrial Zone (Phase 2)',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Logistics & Industrial Infrastructure',
      price: 82000000,
      priceLabel: '₹8.20 Cr',
      pricePerSqft: 4430,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_comm_ware_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_comm_ware_01/cover.jpg',
            label: 'Industrial Logistics Hub & Docks',
            category: 'Exterior',
            altText: 'Modern industrial warehouse building with multiple hydraulic loading bays',
          },
          {
            url: '/images/properties/prop_comm_ware_01/yard.jpg',
            label: 'Asphalt Truck Court & Trailer Apron',
            category: 'Exterior',
            altText: 'Wide paved trailer turning court and container storage yard',
          },
          {
            url: '/images/properties/prop_comm_ware_01/office.jpg',
            label: 'Attached Two-Story Admin Office',
            category: 'Interior',
            altText: 'Air-conditioned logistics control room and admin office block',
          },
        ],
      },
      highlights: [
        '18,500 sq.ft Clear-Span PEB Structure',
        '32 ft Eaves Clear Height',
        '4 Hydraulic Dock Levelers',
        'Laser Screed Flooring (6 Ton/sq.m Load)',
      ],
      description:
        'State-of-the-art Grade-A industrial logistics warehouse in Chakan auto-hub. Features 4 hydraulic loading docks, ESFR fire sprinkler system, and 60ft container maneuvering apron.',
      commercialSpecs: {
        commercialArea: 18500,
        floor: 'Single Level Ground (PEB Shed)',
        building: 'Skyline Logistics Park (Block C)',
        frontage: '120 ft Wide Truck Ingress & Egress',
        ceilingHeight: '32 ft Eaves Height (38 ft Ridge)',
        loadingDocks: '4 Heavy Vehicle Docks with Hydraulic Levelers',
        furnishing: 'Plug & Play',
        parking: 'Dedicated Trailer Parking & Turning Radius',
      },
    },

    // --- MASTER PROJECTS SUBTYPES ---
    {
      id: 'prop_proj_comm_01',
      title: 'Skyline Horizon 25-Acre Integrated Tech Campus',
      code: 'SK-TPK-01',
      mainCategory: 'Projects',
      subtype: 'Commercial Project',
      location: 'HITEC City Phase 2',
      city: 'Hyderabad',
      state: 'Telangana',
      developer: 'Skyline Mega Infrastructure Ltd',
      price: 120000000,
      priceLabel: 'From ₹12.0 Cr',
      pricePerSqft: 14200,
      availability: 'Under Construction',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_proj_comm_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_proj_comm_01/cover.jpg',
            label: 'Tech Park Master Towers & Plaza',
            category: 'Exterior',
            altText: 'Corporate tech park towers surrounded by landscaped pedestrian boulevards',
          },
          {
            url: '/images/properties/prop_proj_comm_01/plaza.jpg',
            label: 'Central Water Plaza & Food Court',
            category: 'Amenities',
            altText: 'Central amphitheater, fountain plaza, and retail promenade',
          },
          {
            url: '/images/properties/prop_proj_comm_01/tower.jpg',
            label: 'Tower 1 Signature Facade',
            category: 'Exterior',
            altText: 'Glass curtain corporate office tower with evening architectural illumination',
          },
        ],
      },
      highlights: [
        '25 Acres Integrated IT / ITeS Tech Park',
        '2.5 Million sq.ft Commercial Space across 4 Towers',
        'Convention Center, Food Court & Crèche',
        'Metro Line Direct Pedestrian Skywalk',
      ],
      description:
        'Premier 25-acre international tech campus in HITEC City. Designed for global MNCs, research centers, and tech unicorns with world-class campus amenities.',
      featured: true,
      projectSpecs: {
        landParcel: '25 Acres Commercial Campus',
        totalWings: 4,
        totalUnits: 64,
        availableUnits: 18,
        phase: 'Phase 1 Ready / Phase 2 Q4 2027',
        configurations: 'Warm Shell & Fully Managed Office Floors (15,000 - 65,000 sq.ft)',
      },
    },
    {
      id: 'prop_proj_mixed_01',
      title: 'Skyline Urban Centre 15-Acre Mixed-Use Promenade',
      code: 'SK-MXD-01',
      mainCategory: 'Projects',
      subtype: 'Mixed-use Project',
      location: 'Senapati Bapat Road',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Mega Infrastructure Ltd',
      price: 15500000,
      priceLabel: 'From ₹1.55 Cr',
      pricePerSqft: 12400,
      availability: 'Under Construction',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_proj_mixed_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_proj_mixed_01/cover.jpg',
            label: 'Mixed-Use Towers & Retail Promenade',
            category: 'Exterior',
            altText: 'Luxury residential towers above a vibrant illuminated retail shopping arcade',
          },
          {
            url: '/images/properties/prop_proj_mixed_01/promenade.jpg',
            label: 'High-Street Retail Boutique Arcade',
            category: 'Exterior',
            altText: 'Pedestrian shopping avenue with luxury boutiques and cafes',
          },
          {
            url: '/images/properties/prop_proj_mixed_01/tower.jpg',
            label: 'Twin Residential High-Rise Towers',
            category: 'Exterior',
            altText: 'Contemporary residential glass towers with skybridge',
          },
        ],
      },
      highlights: [
        '15 Acres Live-Work-Play Destination',
        'Residential Suites, Boutique Offices & Luxury Retail',
        'Open-Air Amphitheater & F&B Promenade',
        'Direct Access from Arterial Ring Road',
      ],
      description:
        'A vibrant 15-acre urban lifestyle destination blending luxury residences, Grade-A boutique offices, high-street retail, and gourmet dining around a central water fountain plaza.',
      featured: true,
      projectSpecs: {
        landParcel: '15 Acres Mixed-Use Urban District',
        totalWings: 6,
        totalUnits: 450,
        availableUnits: 85,
        phase: 'Phase 1 Delivery 2026',
        configurations: '2, 3 BHK Residences, Boutique Offices & Retail Shops',
      },
    },
    {
      id: 'prop_proj_town_01',
      title: 'Skyline Green Valley 60-Acre Integrated Township',
      code: 'SK-TWN-01',
      mainCategory: 'Projects',
      subtype: 'Township',
      location: 'Wakad-Hinjawadi Expressway',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Mega Infrastructure Ltd',
      price: 8500000,
      priceLabel: 'From ₹85.0 L',
      pricePerSqft: 8200,
      availability: 'Under Construction',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_proj_town_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_proj_town_01/cover.jpg',
            label: 'Township Central Lake & Towers Aerial',
            category: 'Exterior',
            altText: 'Mega master-planned residential towers around central lake and green parks',
          },
          {
            url: '/images/properties/prop_proj_town_01/park.jpg',
            label: 'Lush 10-Acre Botanical Central Park',
            category: 'Exterior',
            altText: 'Lush green parklands, jogging trails, and organic orchards',
          },
          {
            url: '/images/properties/prop_proj_town_01/club.jpg',
            label: 'Township Olympic Sports Arena & Club',
            category: 'Amenities',
            altText: 'Clubhouse, Olympic swimming pool, tennis courts, and fitness center',
          },
        ],
      },
      highlights: [
        '60 Acres Integrated Smart Township',
        '1, 2 & 3 BHK High-Rise Residences',
        'ICSE School, Hospital & Retail Mall Inside',
        '80% Open Green Space & Central Lake',
      ],
      description:
        'Pune’s premier 60-acre integrated smart township. Complete with international school, multi-specialty healthcare, high-street retail, 10-acre central sports arena, and 8 luxury towers.',
      featured: true,
      projectSpecs: {
        landParcel: '60 Acres Master Development',
        totalWings: 12,
        totalUnits: 1450,
        availableUnits: 320,
        phase: 'Phase 1 & Phase 2 Delivery 2027',
        configurations: '1, 2, 3 BHK Flats & Penthouse Suites',
      },
    },
    {
      id: 'prop_proj_gate_01',
      title: 'Skyline Sanctuary Gated Eco-Luxury Enclave',
      code: 'SK-GAT-02',
      mainCategory: 'Projects',
      subtype: 'Gated Community',
      location: 'Sarjapur Road Green Belt',
      city: 'Bangalore',
      state: 'Karnataka',
      developer: 'Skyline Lifestyle Homes',
      price: 18500000,
      priceLabel: 'From ₹1.85 Cr',
      pricePerSqft: 9800,
      availability: 'Ready to Move',
      status: 'Active',
      images: {
        cover: '/images/properties/prop_proj_gate_01/cover.jpg',
        gallery: [
          {
            url: '/images/properties/prop_proj_gate_01/cover.jpg',
            label: 'Gated Community Grand Guarded Entrance',
            category: 'Entrance',
            altText: 'Exclusive gated community entrance with palm boulevard and security gate',
          },
          {
            url: '/images/properties/prop_proj_gate_01/villa.jpg',
            label: 'Private Luxury Villa Enclave',
            category: 'Exterior',
            altText: 'Private villa residences with swimming pools and landscaped lawns',
          },
          {
            url: '/images/properties/prop_proj_gate_01/avenue.jpg',
            label: 'Tree-Lined Paved Community Avenues',
            category: 'Exterior',
            altText: 'Paved avenue roads with pedestrian walkways and manicured hedges',
          },
        ],
      },
      highlights: [
        '18 Acres Private Gated Community',
        '3 & 4 BHK Designer Villas & Sky Condos',
        '50,000 sq.ft 5-Star Resort Clubhouse',
        '3-Tier Biometric Security & App Entry',
      ],
      description:
        'An exclusive 18-acre biophilic gated community with 120 boutique villas and 4 low-density residential towers. Features an infinity lake, organic orchards, and 50,000 sq.ft resort clubhouse.',
      featured: true,
      projectSpecs: {
        landParcel: '18 Acres Private Enclave',
        totalWings: 4,
        totalUnits: 180,
        availableUnits: 42,
        phase: 'Ready for Fit-outs',
        configurations: '3 & 4 BHK Luxury Villas & Sky Suites',
      },
    },
  ];

  // Merge database items first, then supplement with typed real estate properties
  return [...items, ...supplementalProperties];
}
