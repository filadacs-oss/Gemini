
export interface MapLocation {
  id: string;
  name: string;
  type: 'shop' | 'park' | 'landmark' | 'street';
  x: number;
  y: number;
  description: string;
  era: 'ancient' | 'modern' | 'future';
}

export const mapLocations: MapLocation[] = [
  // Berlin - Modern (2026)
  { id: 'b1', name: 'Alexanderplatz', type: 'landmark', x: 4.0, y: -2.0, description: 'Central square in Berlin.', era: 'modern' },
  { id: 'b2', name: 'Tiergarten', type: 'park', x: 3.5, y: -1.8, description: 'Large urban park.', era: 'modern' },
  { id: 'b3', name: 'The Alchemist\'s Brew', type: 'shop', x: 4.1, y: -2.1, description: 'A coffee shop for the magically inclined.', era: 'modern' },
  { id: 'b4', name: 'Unter den Linden', type: 'street', x: 3.8, y: -2.0, description: 'Historic boulevard.', era: 'modern' },
  { id: 'b5', name: 'Silver Bullet Armory', type: 'shop', x: 4.3, y: -1.9, description: 'Specialized equipment for hunters.', era: 'modern' },
  { id: 'b6', name: 'The Cursed Library', type: 'shop', x: 3.9, y: -2.3, description: 'Ancient scrolls and forbidden knowledge.', era: 'modern' },
  { id: 'b7', name: 'Shadow Park', type: 'park', x: 4.5, y: -1.5, description: 'A park where shadows move on their own.', era: 'modern' },

  // Berlin - Ancient (1726)
  { id: 'ba1', name: 'Royal Hunting Grounds', type: 'park', x: 3.5, y: -1.8, description: 'Untamed forest used by the Prussian kings.', era: 'ancient' },
  { id: 'ba2', name: 'The Blacksmith\'s Forge', type: 'shop', x: 4.0, y: -2.0, description: 'Where cold iron is hammered.', era: 'ancient' },
  { id: 'ba3', name: 'Witch-Hunter Gallows', type: 'landmark', x: 4.2, y: -2.2, description: 'A grim reminder of the past.', era: 'ancient' },
  { id: 'ba4', name: 'Muddy Path to Spandau', type: 'street', x: 3.7, y: -1.9, description: 'A treacherous road.', era: 'ancient' },
  { id: 'ba5', name: 'The Hermit\'s Cave', type: 'shop', x: 3.2, y: -1.5, description: 'Potions and herbs.', era: 'ancient' },

  // Berlin - Future (2326)
  { id: 'bf1', name: 'Neo-Berlin Spire', type: 'landmark', x: 4.0, y: -2.0, description: 'A massive arcology reaching the clouds.', era: 'future' },
  { id: 'bf2', name: 'Holographic Garden', type: 'park', x: 3.5, y: -1.8, description: 'Digital flora that reacts to magic.', era: 'future' },
  { id: 'bf3', name: 'Cyber-Coven Hub', type: 'shop', x: 4.1, y: -2.1, description: 'Where tech meets the arcane.', era: 'future' },
  { id: 'bf4', name: 'Mag-Lev Skyway', type: 'street', x: 3.8, y: -2.0, description: 'High-speed transport for spirits.', era: 'future' },
  { id: 'bf5', name: 'The Neural Link', type: 'shop', x: 4.4, y: -2.4, description: 'Direct brain-to-magic interfaces.', era: 'future' },

  // Mystic Falls - Modern (2026)
  { id: 'm1', name: 'Mystic Grill', type: 'shop', x: 1.0, y: 1.5, description: 'The local hangout spot.', era: 'modern' },
  { id: 'm2', name: 'Founders Park', type: 'park', x: 1.2, y: 1.3, description: 'Site of many historical events.', era: 'modern' },
  { id: 'm3', name: 'Salvatore Boarding House', type: 'landmark', x: 0.8, y: 1.8, description: 'Historic home of the Salvatores.', era: 'modern' },
  { id: 'm4', name: 'Main Street', type: 'street', x: 1.1, y: 1.4, description: 'The heart of the town.', era: 'modern' },

  // New Orleans - Modern (2026)
  { id: 'n1', name: 'Rousseau\'s', type: 'shop', x: -1.5, y: -1.5, description: 'A bar in the French Quarter.', era: 'modern' },
  { id: 'n2', name: 'Lafayette Cemetery', type: 'landmark', x: -1.8, y: -1.8, description: 'Resting place of many witches.', era: 'modern' },
  { id: 'n3', name: 'The Bayou', type: 'park', x: -2.5, y: -3.0, description: 'Home of the Crescent wolves.', era: 'modern' },
  { id: 'n4', name: 'Bourbon Street', type: 'street', x: -1.6, y: -1.4, description: 'The lively center of the Quarter.', era: 'modern' },
];
