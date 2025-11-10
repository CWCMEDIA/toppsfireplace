// TypeScript declarations for Google Maps API
declare namespace google {
  namespace maps {
    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions)
        getPlace(): PlaceResult
        addListener(event: string, handler: () => void): void
      }
      
      interface AutocompleteOptions {
        types?: string[]
        componentRestrictions?: { country: string | string[] }
        fields?: string[]
      }
      
      interface PlaceResult {
        address_components?: AddressComponent[]
        formatted_address?: string
        geometry?: {
          location?: {
            lat(): number
            lng(): number
          }
        }
      }
      
      interface AddressComponent {
        long_name: string
        short_name: string
        types: string[]
      }
    }
  }
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};

