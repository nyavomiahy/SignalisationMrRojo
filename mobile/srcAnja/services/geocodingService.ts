
export const getLocationName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Erreur de géocodage');
    }
    
    const data = await response.json();
    
    // Extraire le nom du lieu
    if (data.address) {
      // Essayer différents champs d'adresse
      return (
        data.address.road ||
        data.address.quarter ||
        data.address.suburb ||
        data.address.city_district ||
        data.address.city ||
        'Lieu non identifié'
      );
    }
    
    return 'Lieu non identifié';
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return 'Localisation inconnue';
  }
};

// Service pour rechercher un lieu par nom
export const searchLocation = async (query: string): Promise<Array<{
  lat: number;
  lng: number;
  display_name: string;
}>> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Erreur de recherche');
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name
    }));
  } catch (error) {
    console.error('Erreur de recherche:', error);
    return [];
  }
};