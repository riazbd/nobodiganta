const IMAGES = {
  1: 'https://picsum.photos/seed/parliament/800/450',
  2: 'https://picsum.photos/seed/harvest/800/450',
  3: 'https://picsum.photos/seed/metro/800/450',
  4: 'https://picsum.photos/seed/protest/800/450',
  5: 'https://picsum.photos/seed/cricket/800/450',
  6: 'https://picsum.photos/seed/finance/800/450',
  7: 'https://picsum.photos/seed/technology/800/450',
  8: 'https://picsum.photos/seed/cinema/800/450',
  9: 'https://picsum.photos/seed/election/800/450',
  10:'https://picsum.photos/seed/food/800/450',
  11:'https://picsum.photos/seed/hospital/800/450',
  12:'https://picsum.photos/seed/pollution/800/450',
};

export function getNewsImage(id, width = 800, height = 450) {
  if (typeof id === 'string' && id.startsWith('http')) return id;
  return IMAGES[id] || `https://picsum.photos/seed/news${id}/${width}/${height}`;
}

export function getAvatarImage(seed) {
  if (typeof seed === 'string' && seed.startsWith('http')) return seed;
  return `https://picsum.photos/seed/avatar${seed || 'default'}/200/200`;
}

export function getGalleryImage(seed, width = 600, height = 400) {
  if (typeof seed === 'string' && seed.startsWith('http')) return seed;
  return `https://picsum.photos/seed/${seed || 'gallery'}/${width}/${height}`;
}
