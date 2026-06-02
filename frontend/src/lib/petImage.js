// Maps a pet's animal to its base (no-accessory) image and Swedish label.
// Unknown or legacy values fall back to the raccoon so older accounts still render.

export const PET_BASE_IMAGES = {
  tvattbjorn: '/Racoon.png',
  katt:       '/items/cat/kitty_cat_base.png',
  igelkott:   '/items/hedgehog/hedgehog_base.png',
};

export const PET_LABELS = {
  tvattbjorn: 'Tvättbjörn',
  katt:       'Katt',
  igelkott:   'Igelkott',
};

export function petBaseImage(animal) {
  return PET_BASE_IMAGES[animal] ?? PET_BASE_IMAGES.tvattbjorn;
}

export function petLabel(animal) {
  return PET_LABELS[animal] ?? animal ?? 'Djur';
}
