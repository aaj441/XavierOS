/**
 * Google Maps Integration Service
 * Discovers US-based businesses for Lucy WCAG prospecting
 */

export interface BusinessSearchParams {
  keyword: string;
  location: string;
  radius?: number;
  maxResults?: number;
  minRating?: number;
  requireWebsite?: boolean;
}

export interface BusinessDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  businessStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  types: string[];
  latitude: number;
  longitude: number;
}

export class GoogleMapsService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search for businesses using Google Places API (New)
   */
  async searchBusinesses(params: BusinessSearchParams): Promise<BusinessDetails[]> {
    const url = 'https://places.googleapis.com/v1/places:searchText';

    const locationCoords = await this.geocodeLocation(params.location);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.businessStatus,places.rating,places.userRatingCount,places.types,places.location',
      },
      body: JSON.stringify({
        textQuery: `${params.keyword} in ${params.location}`,
        maxResultCount: params.maxResults || 50,
        locationBias: {
          circle: {
            center: locationCoords,
            radius: params.radius || 50000,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Get detailed info for each place (includes website)
    const detailedPlaces = await Promise.all(
      (data.places || []).map((place: any) => this.getPlaceDetails(place.id))
    );

    // Filter based on criteria
    return detailedPlaces.filter((place) => {
      if (params.requireWebsite && !place.website) return false;
      if (params.minRating && (!place.rating || place.rating < params.minRating)) return false;
      if (place.businessStatus !== 'OPERATIONAL') return false;
      return true;
    });
  }

  /**
   * Get detailed information for a specific place
   */
  async getPlaceDetails(placeId: string): Promise<BusinessDetails> {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,businessStatus,rating,userRatingCount,types,location',
      },
    });

    if (!response.ok) {
      throw new Error(`Place Details API error: ${response.statusText}`);
    }

    const place = await response.json();

    return {
      placeId: place.id,
      name: place.displayName?.text || '',
      formattedAddress: place.formattedAddress || '',
      phoneNumber: place.nationalPhoneNumber,
      website: place.websiteUri,
      rating: place.rating,
      userRatingsTotal: place.userRatingCount,
      businessStatus: place.businessStatus || 'OPERATIONAL',
      types: place.types || [],
      latitude: place.location?.latitude || 0,
      longitude: place.location?.longitude || 0,
    };
  }

  /**
   * Convert location string to coordinates
   */
  async geocodeLocation(location: string): Promise<{ lat: number; lng: number }> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length === 0) {
      throw new Error(`Could not geocode location: ${location}`);
    }

    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };
  }

  /**
   * Lucy-specific: Discover qualified leads
   */
  async discoverLeads(
    vertical: string,
    location: string,
    maxLeads: number = 50
  ): Promise<BusinessDetails[]> {
    return this.searchBusinesses({
      keyword: vertical,
      location,
      maxResults: maxLeads * 2, // Over-fetch for filtering
      minRating: 3.0,
      requireWebsite: true,
    });
  }
}

