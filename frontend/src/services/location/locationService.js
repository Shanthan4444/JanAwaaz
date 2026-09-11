// Automatic Location Service for JanSetu Citizen Reporting
export const locationService = {
  getCurrentLocation: async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser.'));
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Resolve human readable location
          const resolvedLocation = {
            latitude: lat,
            longitude: lng,
            area: 'University Road',
            landmark: 'Near Gate 2 Entrance',
            address: `📍 Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (University Sector)`
          };

          // Try reverse geocoding via free OpenStreetMap Nominatim API if available
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const road = data.address.road || data.address.suburb || data.address.neighbourhood || 'University Road';
                const city = data.address.city || data.address.town || data.address.state_district || 'Telangana';
                resolvedLocation.area = road;
                resolvedLocation.landmark = data.display_name ? data.display_name.split(',')[0] : 'Near Gate 2 Entrance';
                resolvedLocation.address = `📍 ${road}, ${city}`;
              }
            }
          } catch (err) {
            console.warn('[LOCATION SERVICE WARN] Reverse geocode fallback used:', err.message);
          }

          resolve(resolvedLocation);
        },
        (error) => {
          console.warn('[LOCATION SERVICE ERROR]', error.message);
          reject(error);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }
};
