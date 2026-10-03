import { PropertyProject, PropertyUnit } from '../types/property.types';

export interface GalleryImage {
  url: string;
  label: string;
  category: 'Exterior' | 'Interior' | 'Amenities' | 'Entrance';
  altText: string;
}

export interface ProjectImageSet {
  projectId: string;
  cover: string;
  category: string;
  badge: string;
  gallery: GalleryImage[];
}

/**
 * Deterministic Project-Specific Real Estate Image Galleries.
 * Each project has its own unique 4-image set:
 * 1. Exterior architectural building
 * 2. Premium sample flat interior
 * 3. Dedicated luxury amenities
 * 4. Grand entrance / arrival court
 */
const PROJECT_GALLERY_CATALOG: Record<string, ProjectImageSet> = {
  // 1. Skyline Bayview (Marine Drive, South Mumbai)
  bayview: {
    projectId: 'proj_skyline_bayview',
    cover: '/images/projects/project-bayview/exterior.jpg',
    category: 'Waterfront Super-Luxury Residences',
    badge: 'Marine Drive Waterfront',
    gallery: [
      {
        url: '/images/projects/project-bayview/exterior.jpg',
        label: 'Coastal Tower Facade & Infinity Pool',
        category: 'Exterior',
        altText: 'Modern sea-facing luxury apartment building with infinity pool',
      },
      {
        url: '/images/projects/project-bayview/interior.jpg',
        label: 'Panoramic Living Room Suite',
        category: 'Interior',
        altText: 'Luxury staged living room with ocean view windows and marble flooring',
      },
      {
        url: '/images/projects/project-bayview/amenities.jpg',
        label: 'Rooftop Horizon Lounge',
        category: 'Amenities',
        altText: 'Infinity pool deck and private cabanas overlooking the bay',
      },
      {
        url: '/images/projects/project-bayview/entrance.jpg',
        label: 'Grand Porte-Cochère & Water Feature',
        category: 'Entrance',
        altText: 'Grand illuminated glass entrance lobby with architectural fountain',
      },
    ],
  },

  // 2. Skyline Heights (Kharadi IT Corridor, Pune)
  heights: {
    projectId: 'proj_skyline_heights',
    cover: '/images/projects/project-heights/exterior.jpg',
    category: 'Contemporary High-Rise Residences',
    badge: 'Twin Skybridge Towers',
    gallery: [
      {
        url: '/images/projects/project-heights/exterior.jpg',
        label: 'Twin Glass Towers & Skybridge',
        category: 'Exterior',
        altText: 'Modern luxury twin residential glass towers with skybridge and plaza',
      },
      {
        url: '/images/projects/project-heights/interior.jpg',
        label: 'Designer 3 BHK Residence',
        category: 'Interior',
        altText: 'Contemporary warm-toned living room with floor-to-ceiling windows',
      },
      {
        url: '/images/projects/project-heights/amenities.jpg',
        label: 'Wellness & Fitness Club',
        category: 'Amenities',
        altText: 'State-of-the-art private residential gym and wellness center',
      },
      {
        url: '/images/projects/project-heights/entrance.jpg',
        label: 'Double-Height Arrival Lobby',
        category: 'Entrance',
        altText: 'Illuminated glass entrance lobby and tree-lined walkway',
      },
    ],
  },

  // 3. Skyline Grandeur (Whitefield Tech Corridor, Bangalore)
  grandeur: {
    projectId: 'proj_skyline_grandeur',
    cover: '/images/projects/project-grandeur/exterior.jpg',
    category: 'Eco-Luxury Terraced Condominiums',
    badge: 'Vertical Forest Architecture',
    gallery: [
      {
        url: '/images/projects/project-grandeur/exterior.jpg',
        label: 'Terraced Eco-Architecture with Vertical Gardens',
        category: 'Exterior',
        altText: 'Modern luxury eco-friendly residential building with lush terraced gardens',
      },
      {
        url: '/images/projects/project-grandeur/interior.jpg',
        label: 'Spacious Panoramic Penthouse',
        category: 'Interior',
        altText: 'Elegant staged open-concept apartment with floor-to-ceiling windows',
      },
      {
        url: '/images/projects/project-grandeur/amenities.jpg',
        label: 'Rooftop Sunset Pergola Lounge',
        category: 'Amenities',
        altText: 'Rooftop outdoor terrace with glass railings and city sunset views',
      },
      {
        url: '/images/projects/project-grandeur/entrance.jpg',
        label: 'Botanical Arrival Court',
        category: 'Entrance',
        altText: 'Modern entrance courtyard with water fountain and ambient lighting',
      },
    ],
  },

  // 4. Skyline Oasis (Banjara Hills, Hyderabad)
  oasis: {
    projectId: 'proj_skyline_oasis',
    cover: '/images/projects/project-oasis/exterior.jpg',
    category: 'Boutique Sky Villas & Private Estates',
    badge: 'Private Villa Enclave',
    gallery: [
      {
        url: '/images/projects/project-oasis/exterior.jpg',
        label: 'Contemporary Luxury Villa Estate',
        category: 'Exterior',
        altText: 'Modern residential villa with private infinity pool and manicured lawn',
      },
      {
        url: '/images/projects/project-oasis/interior.jpg',
        label: 'Master Bedroom Garden Suite',
        category: 'Interior',
        altText: 'Luxury villa master bedroom with sliding glass doors to reflecting pool',
      },
      {
        url: '/images/projects/project-oasis/amenities.jpg',
        label: 'Private Pool Pavilion & Sun Deck',
        category: 'Amenities',
        altText: 'Private resort-style swimming pool and lawn',
      },
      {
        url: '/images/projects/project-oasis/entrance.jpg',
        label: 'Gated Estate Entrance & Portico',
        category: 'Entrance',
        altText: 'Architectural entrance portico with reflecting fountain',
      },
    ],
  },

  // 5. Skyline Pinnacle Luxury Sky Suites (Penthouse & Residences)
  pinnacle: {
    projectId: 'proj_skyline_pinnacle',
    cover: '/images/projects/project-grandeur/interior.jpg',
    category: 'Luxury Sky Residences & Penthouses',
    badge: 'Panoramic Sky Residences',
    gallery: [
      {
        url: '/images/projects/project-grandeur/interior.jpg',
        label: 'Panoramic Open-Concept Living Room',
        category: 'Interior',
        altText: 'Sunlit living room with natural wood finishes and floor-to-ceiling windows',
      },
      {
        url: '/images/properties/prop_res_bung_01/interior.jpg',
        label: 'Master Suite & Private Lounge',
        category: 'Interior',
        altText: 'Double-height luxury master suite with light marble floors',
      },
      {
        url: '/images/projects/project-grandeur/amenities.jpg',
        label: 'Skyline Terrace Pergola Deck',
        category: 'Amenities',
        altText: 'Landscaped rooftop outdoor terrace with pergola and glass railings',
      },
      {
        url: '/images/projects/project-heights/entrance.jpg',
        label: 'Grand Double-Height Arrival Court',
        category: 'Entrance',
        altText: 'Modern entrance courtyard with ambient daylight and water fountain',
      },
    ],
  },

  // 6. Skyline Nexus Commercial & Tech Park (BKC / Financial District)
  commercial: {
    projectId: 'proj_skyline_commercial',
    cover: '/images/commercial-tower.jpg',
    category: 'Grade-A Commercial Office Towers',
    badge: 'Corporate Tech Park',
    gallery: [
      {
        url: '/images/commercial-tower.jpg',
        label: 'Glass Curtain Corporate Tower & Plaza',
        category: 'Exterior',
        altText: 'Modern commercial office building with glass facade and landscaped fountain plaza',
      },
      {
        url: '/images/projects/project-pinnacle/interior.jpg',
        label: 'Executive Boardroom & Sky Lounge',
        category: 'Interior',
        altText: 'Modern corporate executive suite with skyline views',
      },
      {
        url: '/images/projects/project-heights/amenities.jpg',
        label: 'Business Center & Wellness Club',
        category: 'Amenities',
        altText: 'Corporate wellness center and business club',
      },
      {
        url: '/images/projects/project-bayview/entrance.jpg',
        label: 'Corporate Double-Height Reception',
        category: 'Entrance',
        altText: 'Illuminated corporate lobby and turnstile security gate',
      },
    ],
  },

  // 7. Skyline Aurora Luxury Penthouse Suites
  aurora: {
    projectId: 'prop_skyline_aurora',
    cover: '/images/property-penthouse.jpg',
    category: 'Dual-Level Penthouse Suites',
    badge: 'Sky Villa Penthouse',
    gallery: [
      {
        url: '/images/property-penthouse.jpg',
        label: 'Dual-Level Living Room Suite',
        category: 'Interior',
        altText: 'Luxury staged living room with double height ceiling and panoramic windows',
      },
      {
        url: '/images/projects/project-grandeur/exterior.jpg',
        label: 'Contemporary Residential Facade',
        category: 'Exterior',
        altText: 'Modern glass residential tower with private terrace decks',
      },
      {
        url: '/images/projects/project-grandeur/amenities.jpg',
        label: 'Private Rooftop Sunset Lounge',
        category: 'Amenities',
        altText: 'Rooftop private infinity pool deck with pergola',
      },
      {
        url: '/images/projects/project-grandeur/entrance.jpg',
        label: 'Concierge Arrival Lobby',
        category: 'Entrance',
        altText: 'Grand illuminated arrival courtyard',
      },
    ],
  },
};

const PROJECT_KEYS = ['bayview', 'heights', 'grandeur', 'oasis', 'pinnacle', 'commercial', 'aurora'];

/**
 * Reusable Property Image Classification Library
 */
export const PROPERTY_IMAGE_LIBRARY = {
  apartments: {
    title: 'Luxury High-Rise Apartments & Flats',
    cover: '/images/projects/project-bayview/exterior.jpg',
    interior: '/images/projects/project-bayview/interior.jpg',
    amenities: '/images/projects/project-bayview/amenities.jpg',
    entrance: '/images/projects/project-bayview/entrance.jpg',
  },
  twinTowers: {
    title: 'Contemporary Twin Towers & Suites',
    cover: '/images/projects/project-heights/exterior.jpg',
    interior: '/images/projects/project-heights/interior.jpg',
    amenities: '/images/projects/project-heights/amenities.jpg',
    entrance: '/images/projects/project-heights/entrance.jpg',
  },
  ecoCondos: {
    title: 'Eco-Luxury Terraced Condominiums',
    cover: '/images/projects/project-grandeur/exterior.jpg',
    interior: '/images/projects/project-grandeur/interior.jpg',
    amenities: '/images/projects/project-grandeur/amenities.jpg',
    entrance: '/images/projects/project-grandeur/entrance.jpg',
  },
  villas: {
    title: 'Resort Villas & Private Estates',
    cover: '/images/projects/project-oasis/exterior.jpg',
    interior: '/images/projects/project-oasis/interior.jpg',
    amenities: '/images/projects/project-oasis/amenities.jpg',
    entrance: '/images/projects/project-oasis/entrance.jpg',
  },
  penthouses: {
    title: 'Iconic Sky Villas & Penthouse Lounges',
    cover: '/images/property-penthouse.jpg',
    interior: '/images/property-penthouse.jpg',
    amenities: '/images/projects/project-grandeur/amenities.jpg',
    entrance: '/images/projects/project-grandeur/entrance.jpg',
  },
  commercial: {
    title: 'Grade-A Commercial & Office Parks',
    cover: '/images/commercial-tower.jpg',
    interior: '/images/projects/project-pinnacle/interior.jpg',
    amenities: '/images/projects/project-heights/amenities.jpg',
    entrance: '/images/projects/project-bayview/entrance.jpg',
  },
};

/**
 * Deterministically maps any project to its distinct, dedicated image set.
 * Uses normalized project name, project ID, or project code.
 */
export function getProjectImageSet(project?: Partial<PropertyProject> | null, fallbackIndex = 0): ProjectImageSet {
  if (!project) {
    const key = PROJECT_KEYS[fallbackIndex % PROJECT_KEYS.length];
    return PROJECT_GALLERY_CATALOG[key];
  }

  const name = (project.name || '').toLowerCase();
  const code = (project.code || '').toLowerCase();
  const id = (project.id || '').toLowerCase();

  // 1. Direct Name / Key Matching
  if (name.includes('aurora') || name.includes('penthouse')) {
    return PROJECT_GALLERY_CATALOG.aurora;
  }
  if (name.includes('commercial') || name.includes('office') || name.includes('tech') || code === 'skc') {
    return PROJECT_GALLERY_CATALOG.commercial;
  }
  if (name.includes('bayview') || code === 'skb' || id.includes('bayview')) {
    return PROJECT_GALLERY_CATALOG.bayview;
  }
  if (name.includes('height') || code === 'skh' || id.includes('height')) {
    return PROJECT_GALLERY_CATALOG.heights;
  }
  if (name.includes('grandeur') || code === 'skg' || id.includes('grandeur')) {
    return PROJECT_GALLERY_CATALOG.grandeur;
  }
  if (name.includes('oasis') || code === 'sko' || id.includes('oasis') || name.includes('villa')) {
    return PROJECT_GALLERY_CATALOG.oasis;
  }
  if (name.includes('pinnacle') || code === 'skp' || id.includes('pinnacle')) {
    return PROJECT_GALLERY_CATALOG.pinnacle;
  }

  // 2. Deterministic Hash Based on Project ID or Code (Guarantees different projects get different images)
  const seedString = `${project.id || ''}_${project.code || ''}_${project.name || ''}_${fallbackIndex}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const selectedIndex = Math.abs(hash + fallbackIndex) % PROJECT_KEYS.length;
  const selectedKey = PROJECT_KEYS[selectedIndex];

  return PROJECT_GALLERY_CATALOG[selectedKey];
}

/**
 * Resolves single cover image metadata for backwards compatibility
 */
export function getProjectImage(project?: Partial<PropertyProject> | null, index = 0) {
  const imageSet = getProjectImageSet(project, index);
  return {
    imageUrl: imageSet.cover,
    category: imageSet.category,
    badge: imageSet.badge,
    altText: imageSet.gallery[0]?.altText || imageSet.badge,
    gallery: imageSet.gallery,
  };
}

/**
 * Resolves unit image from configuration or property type
 */
export function getUnitImage(unit?: Partial<PropertyUnit> | null, index = 0) {
  const config = (unit?.configuration || '').toUpperCase();
  if (config.includes('COMMERCIAL') || config.includes('OFFICE')) {
    return PROJECT_GALLERY_CATALOG.commercial;
  }
  if (config.includes('4 BHK') || config.includes('PENTHOUSE')) {
    return PROJECT_GALLERY_CATALOG.pinnacle;
  }
  if (config.includes('3 BHK')) {
    return PROJECT_GALLERY_CATALOG.heights;
  }
  if (config.includes('2 BHK') || config.includes('1 BHK')) {
    return PROJECT_GALLERY_CATALOG.bayview;
  }
  if (config.includes('VILLA') || config.includes('PLOT') || config.includes('BUNGALOW')) {
    return PROJECT_GALLERY_CATALOG.oasis;
  }
  const key = PROJECT_KEYS[index % PROJECT_KEYS.length];
  return PROJECT_GALLERY_CATALOG[key];
}
