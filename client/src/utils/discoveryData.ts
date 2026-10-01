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
  },
  {
    id: 'Flat',
    label: 'Flat',
    category: 'Residential',
    description: 'Contemporary multi-family flats in urban residential blocks',
    iconName: 'Home',
    tag: 'Urban Homes',
  },
  {
    id: 'Villa',
    label: 'Villa',
    category: 'Residential',
    description: 'Independent luxury homes with private lawns & pool decks',
    iconName: 'Palmtree',
    tag: 'Private Luxury',
  },
  {
    id: 'Row House',
    label: 'Row House',
    category: 'Residential',
    description: 'Multi-level attached homes with dedicated parking & private gardens',
    iconName: 'Rows',
    tag: 'Community Enclave',
  },
  {
    id: 'Bungalow',
    label: 'Bungalow',
    category: 'Residential',
    description: 'Sprawling single or double-storey standalone estates',
    iconName: 'Landmark',
    tag: 'Estate Living',
  },
  {
    id: 'Penthouse',
    label: 'Penthouse',
    category: 'Residential',
    description: 'Top-floor sky suites with panoramic horizon views & terraces',
    iconName: 'Sparkles',
    tag: 'Sky Luxury',
  },
  {
    id: 'Studio',
    label: 'Studio',
    category: 'Residential',
    description: 'Smart compact living spaces optimized for urban professionals',
    iconName: 'Compass',
    tag: 'Compact Living',
  },

  // Land (3 types)
  {
    id: 'Residential Plot',
    label: 'Residential Plot',
    category: 'Land',
    description: 'Clear-title NA freehold residential land parcels with road frontage',
    iconName: 'MapPin',
    tag: 'Build Custom',
  },
  {
    id: 'Commercial Plot',
    label: 'Commercial Plot',
    category: 'Land',
    description: 'High-FSI commercial zoned plots on major transit corridors',
    iconName: 'Maximize2',
    tag: 'High FSI Land',
  },
  {
    id: 'Farm Land',
    label: 'Farm Land',
    category: 'Land',
    description: 'Scenic fertile agricultural & agro-tourism land with water access',
    iconName: 'Trees',
    tag: 'Agro & Retreat',
  },

  // Commercial (5 types)
  {
    id: 'Office',
    label: 'Office',
    category: 'Commercial',
    description: 'Grade-A corporate office suites, IT parks & co-working floors',
    iconName: 'Briefcase',
    tag: 'Corporate Space',
  },
  {
    id: 'Shop / Retail',
    label: 'Shop / Retail',
    category: 'Commercial',
    description: 'High-footfall ground retail storefronts in shopping arcades',
    iconName: 'ShoppingBag',
    tag: 'High Footfall',
  },
  {
    id: 'Showroom',
    label: 'Showroom',
    category: 'Commercial',
    description: 'Double-height glass-front retail flagship display spaces',
    iconName: 'Store',
    tag: 'Main Road Facing',
  },
  {
    id: 'Commercial Building',
    label: 'Commercial Building',
    category: 'Commercial',
    description: 'Standalone multi-storey commercial towers for single or multi-tenants',
    iconName: 'Building',
    tag: 'Standalone Tower',
  },
  {
    id: 'Warehouse',
    label: 'Warehouse',
    category: 'Commercial',
    description: 'Industrial grade logistics hubs with heavy loading bays & high clear height',
    iconName: 'Boxes',
    tag: 'Logistics Hub',
  },

  // Projects (4 types)
  {
    id: 'Commercial Project',
    label: 'Commercial Project',
    category: 'Projects',
    description: 'Integrated business tech parks with retail hubs & conventions',
    iconName: 'Layers',
    tag: 'Business District',
  },
  {
    id: 'Mixed-use Project',
    label: 'Mixed-use Project',
    category: 'Projects',
    description: 'Vibrant developments combining residential, retail & office towers',
    iconName: 'Share2',
    tag: 'Live-Work-Play',
  },
  {
    id: 'Township',
    label: 'Township',
    category: 'Projects',
    description: 'Master-planned self-contained townships with schools & hospitals',
    iconName: 'Network',
    tag: 'Integrated Living',
  },
  {
    id: 'Gated Community',
    label: 'Gated Community',
    category: 'Projects',
    description: 'Exclusive multi-acre gated enclaves with private clubhouses',
    iconName: 'Shield',
    tag: 'Secure Enclave',
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

/**
 * Builds a comprehensive list of customer discovery properties by merging
 * real database Project/Unit records and realistic typed catalog properties.
 */
export function buildDiscoveryCatalog(
  dbProjects: PropertyProject[] = [],
  dbUnits: PropertyUnit[] = []
): DiscoveryProperty[] {
  const items: DiscoveryProperty[] = [];

  // 1. Convert real database units into rich discovery properties
  dbUnits.forEach((unit, idx) => {
    const parentProject = dbProjects.find((p) => p.id === unit.project_id);
    const projectName = parentProject?.name || unit.project_name || 'Skyline Bayview Heights';
    const location = parentProject?.location || 'Marine Drive';
    const city = parentProject?.city || unit.project_city || 'Mumbai';
    const developer = parentProject?.developer || 'Skyline Infrastructure Group';

    const config = (unit.configuration || '2 BHK').toUpperCase();
    let subtype: PropertySubtype = 'Apartment';
    let mainCategory: Exclude<PropertyMainCategory, 'All'> = 'Residential';

    if (config.includes('PENTHOUSE')) {
      subtype = 'Penthouse';
    } else if (config.includes('VILLA')) {
      subtype = 'Villa';
    } else if (config.includes('STUDIO')) {
      subtype = 'Studio';
    } else if (config.includes('FLAT') || config.includes('1 BHK')) {
      subtype = 'Flat';
    } else if (config.includes('OFFICE')) {
      subtype = 'Office';
      mainCategory = 'Commercial';
    }

    const imgSet = getProjectImageSet(parentProject, idx);

    const priceSqft = unit.carpet_area > 0 ? Math.round(unit.price / unit.carpet_area) : undefined;

    const discProp: DiscoveryProperty = {
      id: `prop_unit_${unit.id}`,
      title: `${unit.configuration} Unit ${unit.unit_number} at ${projectName}`,
      code: unit.unit_number,
      mainCategory,
      subtype,
      location,
      city,
      state: parentProject?.state || 'Maharashtra',
      developer,
      price: unit.price,
      priceLabel: formatPrice(unit.price),
      pricePerSqft: priceSqft,
      availability: unit.availability_status,
      status: parentProject?.status || 'Active',
      images: {
        cover: imgSet.cover,
        gallery: imgSet.gallery,
      },
      highlights: [
        `${unit.carpet_area} sq.ft Carpet Area`,
        `Floor ${unit.floor} of ${parentProject?.total_wings ? parentProject.total_wings * 10 : 24}`,
        `${unit.parking_type} Parking`,
        unit.facing ? `${unit.facing} Facing` : 'Vastu Compliant',
      ],
      description:
        unit.description ||
        `Exquisitely designed ${unit.configuration} home in ${projectName}, ${location}, ${city}. Featuring panoramic views, premium finishes, and world-class residential amenities.`,
      featured: idx < 3,
      linkedProjectId: parentProject?.id,
      linkedUnitId: unit.id,
      residentialSpecs: {
        bhk: unit.configuration,
        bedrooms: parseInt(unit.configuration) || 2,
        bathrooms: (parseInt(unit.configuration) || 2) + (unit.configuration.includes('4') ? 1 : 0),
        carpetArea: unit.carpet_area || 1150,
        builtUpArea: unit.built_up_area || Math.round((unit.carpet_area || 1150) * 1.3),
        floor: unit.floor || 8,
        totalFloors: 28,
        parking: unit.parking_type === 'Included' ? '1 Covered Carport' : 'Optional Stack Parking',
        societyOrProject: projectName,
        facing: unit.facing || 'East Facing',
        terraceArea: subtype === 'Penthouse' ? 450 : undefined,
      },
    };

    items.push(discProp);
  });

  // 2. Add realistic, high-grade typed discovery properties for remaining subtypes
  // (Ensuring every single property subtype in the catalog has authentic, type-specific cards)
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
        cover: '/images/projects/project-oasis/exterior.jpg',
        gallery: [
          {
            url: '/images/projects/project-oasis/exterior.jpg',
            label: 'Private Garden Row House Facade',
            category: 'Exterior',
            altText: 'Modern multi-level row house with private lawn and parking',
          },
          {
            url: '/images/projects/project-oasis/interior.jpg',
            label: 'Open-Concept Living & Dining',
            category: 'Interior',
            altText: 'Spacious sunlit living room opening to backyard garden',
          },
          {
            url: '/images/projects/project-heights/amenities.jpg',
            label: 'Clubhouse & Tennis Court',
            category: 'Amenities',
            altText: 'Exclusive community clubhouse and landscaped grounds',
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
        cover: '/images/property-villa.jpg',
        gallery: [
          {
            url: '/images/property-villa.jpg',
            label: 'Bungalow Front Elevation & Lawns',
            category: 'Exterior',
            altText: 'Expansive private bungalow estate with manicured trees and circular driveway',
          },
          {
            url: '/images/projects/project-oasis/interior.jpg',
            label: 'Grand Double-Height Foyer',
            category: 'Interior',
            altText: 'Double-height living pavilion with imported marble floors',
          },
          {
            url: '/images/projects/project-oasis/amenities.jpg',
            label: 'Private Heated Plunge Pool',
            category: 'Amenities',
            altText: 'Private swimming pool and poolside gazebo',
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
        cover: '/images/projects/project-oasis/exterior.jpg',
        gallery: [
          {
            url: '/images/projects/project-oasis/exterior.jpg',
            label: 'Gated Plot Enclave & Paved Boulevard',
            category: 'Exterior',
            altText: 'Paved wide sector roads with underground cabling and street lights',
          },
          {
            url: '/images/projects/project-bayview/entrance.jpg',
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
      id: 'prop_land_com_01',
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
        cover: '/images/commercial-tower.jpg',
        gallery: [
          {
            url: '/images/commercial-tower.jpg',
            label: 'Commercial Corridor Frontage',
            category: 'Exterior',
            altText: 'Prime commercial plot location facing multi-lane highway',
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
        cover: '/images/property-villa.jpg',
        gallery: [
          {
            url: '/images/property-villa.jpg',
            label: 'Scenic Mountain Valley Farm Parcel',
            category: 'Exterior',
            altText: 'Fertile green agricultural farmland with mountain backdrop',
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
      id: 'prop_com_off_01',
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
        cover: '/images/commercial-tower.jpg',
        gallery: [
          {
            url: '/images/commercial-tower.jpg',
            label: 'Corporate Tech Tower Glass Facade',
            category: 'Exterior',
            altText: 'Modern commercial office building with glass facade and plaza',
          },
          {
            url: '/images/projects/project-pinnacle/interior.jpg',
            label: 'Fitted Executive Workspace',
            category: 'Interior',
            altText: 'Modern corporate executive suite with skyline views',
          },
          {
            url: '/images/projects/project-bayview/entrance.jpg',
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
      id: 'prop_com_shop_01',
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
        cover: '/images/commercial-tower.jpg',
        gallery: [
          {
            url: '/images/commercial-tower.jpg',
            label: 'Retail Arcade Boulevard Front',
            category: 'Exterior',
            altText: 'High footfall ground floor retail plaza with pedestrian walkways',
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
      id: 'prop_com_show_01',
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
        cover: '/images/commercial-tower.jpg',
        gallery: [
          {
            url: '/images/commercial-tower.jpg',
            label: 'Highway Facing Showroom Glass Facade',
            category: 'Exterior',
            altText: 'Double height commercial showroom with clear structural glazing',
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
      id: 'prop_com_ware_01',
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
        cover: '/images/commercial-tower.jpg',
        gallery: [
          {
            url: '/images/commercial-tower.jpg',
            label: 'Industrial Logistics Park & Truck Apron',
            category: 'Exterior',
            altText: 'Modern industrial PEB warehouse building with loading docks',
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
        cover: '/images/projects/project-grandeur/exterior.jpg',
        gallery: [
          {
            url: '/images/projects/project-grandeur/exterior.jpg',
            label: 'Township Master Aerial & Towers',
            category: 'Exterior',
            altText: 'Mega master-planned residential towers surrounded by green parks',
          },
          {
            url: '/images/projects/project-heights/amenities.jpg',
            label: 'Central Clubhouse & Sports Complex',
            category: 'Amenities',
            altText: 'Township central sports complex, Olympic pool, and gardens',
          },
        ],
      },
      highlights: [
        '60 Acres Integrated Smart Township',
        '1, 2 & 3 BHK High-Rise Residences',
        'ICSE School, Hospital & Retail Mall Inside',
        '80% Open Green Space & Central Park',
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
        cover: '/images/projects/project-oasis/exterior.jpg',
        gallery: [
          {
            url: '/images/projects/project-oasis/exterior.jpg',
            label: 'Gated Enclave Boulevard & Villas',
            category: 'Exterior',
            altText: 'Lush gated villa community with palm avenues and water bodies',
          },
          {
            url: '/images/projects/project-oasis/interior.jpg',
            label: 'Sample Designer Villa Lounge',
            category: 'Interior',
            altText: 'Sunlit designer living room overlooking private reflection pool',
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
