import { PropertyProject, PropertyUnit } from '../types/property.types';

export interface PropertyImageMeta {
  imageUrl: string;
  category: string;
  badge: string;
  altText: string;
}

/**
 * Photorealistic image mapping registry for Real Estate Projects & Units.
 * Connects database project/unit records to realistic architectural photography
 * with fallback mechanisms without altering the database schema.
 */
const PROJECT_IMAGE_REGISTRY: Record<string, PropertyImageMeta> = {
  // Skyline Bayview / Mumbai Coastal
  proj_skyline_bayview: {
    imageUrl: '/images/property-pinnacle.jpg',
    category: 'Waterfront Luxury Residences',
    badge: 'Signature Tower',
    altText: 'Modern luxury residential building exterior with infinity pool at waterfront',
  },
  skb: {
    imageUrl: '/images/property-pinnacle.jpg',
    category: 'Waterfront Luxury Residences',
    badge: 'Signature Tower',
    altText: 'Modern luxury residential building exterior with infinity pool at waterfront',
  },

  // Skyline Heights / Pune IT Corridor
  proj_skyline_heights: {
    imageUrl: '/images/property-interior.jpg',
    category: 'Ultra-Luxury High-Rise',
    badge: 'Staged Living Suite',
    altText: 'Ultra-luxury modern apartment living room with panoramic glass windows',
  },
  skh: {
    imageUrl: '/images/property-interior.jpg',
    category: 'Ultra-Luxury High-Rise',
    badge: 'Staged Living Suite',
    altText: 'Ultra-luxury modern apartment living room with panoramic glass windows',
  },

  // Skyline Grandeur / Bangalore Tech Corridor
  proj_skyline_grandeur: {
    imageUrl: '/images/property-penthouse.jpg',
    category: 'Executive Penthouse & Suites',
    badge: 'Rooftop Sky Lounge',
    altText: 'Luxury penthouse outdoor terrace with panoramic skyline view at sunset',
  },
  skg: {
    imageUrl: '/images/property-penthouse.jpg',
    category: 'Executive Penthouse & Suites',
    badge: 'Rooftop Sky Lounge',
    altText: 'Luxury penthouse outdoor terrace with panoramic skyline view at sunset',
  },

  // Skyline Oasis / Hyderabad Enclave
  proj_skyline_oasis: {
    imageUrl: '/images/property-villa.jpg',
    category: 'Boutique Sky Villas & Enclave',
    badge: 'Exclusive Enclave',
    altText: 'Modern luxury residential villa estate with infinity pool and manicured lawn',
  },
  sko: {
    imageUrl: '/images/property-villa.jpg',
    category: 'Boutique Sky Villas & Enclave',
    badge: 'Exclusive Enclave',
    altText: 'Modern luxury residential villa estate with infinity pool and manicured lawn',
  },
};

const DEFAULT_IMAGES: PropertyImageMeta[] = [
  {
    imageUrl: '/images/property-pinnacle.jpg',
    category: 'Luxury Apartment Complex',
    badge: 'Modern Architecture',
    altText: 'Modern residential tower with swimming pool and landscaped gardens',
  },
  {
    imageUrl: '/images/property-interior.jpg',
    category: 'Premium Interior Flat',
    badge: 'Designer Interior',
    altText: 'High-end interior staged living room with city view',
  },
  {
    imageUrl: '/images/property-penthouse.jpg',
    category: 'Skyline Penthouse',
    badge: 'Panoramic Terrace',
    altText: 'Penthouse rooftop terrace with evening city views',
  },
  {
    imageUrl: '/images/property-villa.jpg',
    category: 'Residential Luxury Villa',
    badge: 'Private Estate',
    altText: 'Contemporary villa estate with pool and landscape',
  },
];

/**
 * Resolves a photorealistic real-estate image for a Project
 */
export function getProjectImage(project?: Partial<PropertyProject> | null, index = 0): PropertyImageMeta {
  if (project?.id && PROJECT_IMAGE_REGISTRY[project.id.toLowerCase()]) {
    return PROJECT_IMAGE_REGISTRY[project.id.toLowerCase()];
  }
  if (project?.code && PROJECT_IMAGE_REGISTRY[project.code.toLowerCase()]) {
    return PROJECT_IMAGE_REGISTRY[project.code.toLowerCase()];
  }
  if (project?.name) {
    const nameLower = project.name.toLowerCase();
    if (nameLower.includes('bayview') || nameLower.includes('coastal') || nameLower.includes('sea')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_bayview;
    }
    if (nameLower.includes('height') || nameLower.includes('tower') || nameLower.includes('imperial')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_heights;
    }
    if (nameLower.includes('grandeur') || nameLower.includes('penthouse') || nameLower.includes('pinnacle')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_grandeur;
    }
    if (nameLower.includes('oasis') || nameLower.includes('villa') || nameLower.includes('enclave') || nameLower.includes('green')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_oasis;
    }
  }
  return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
}

/**
 * Resolves a photorealistic real-estate image for an Inventory Unit
 */
export function getUnitImage(unit?: Partial<PropertyUnit> | null, index = 0): PropertyImageMeta {
  if (unit?.configuration) {
    const config = unit.configuration.toUpperCase();
    if (config.includes('4 BHK') || config.includes('PENTHOUSE') || config.includes('DUPLEX')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_grandeur;
    }
    if (config.includes('3 BHK')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_heights;
    }
    if (config.includes('2 BHK') || config.includes('1 BHK')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_bayview;
    }
    if (config.includes('VILLA') || config.includes('PLOT')) {
      return PROJECT_IMAGE_REGISTRY.proj_skyline_oasis;
    }
  }
  return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
}
