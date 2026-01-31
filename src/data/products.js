// Product catalog data - hardcoded as requested
export const products = [
  // --- Woodslices ---
  {
    id: 1,
    category: 'woodslices',
    title: 'Woodslice Size 15cm',
    price: 260,
    image: '/images/woodslices/wood-15.jpg',
    description: 'Perfect for small desks.'
  },
  {
    id: 2,
    category: 'woodslices',
    title: 'Woodslice Size 20cm',
    price: 350,
    image: '/images/woodslices/wood-20.jpg',
    description: 'Best seller for couples.'
  },
  {
    id: 3,
    category: 'woodslices',
    title: 'Woodslice Size 25cm',
    price: 420,
    image: '/images/woodslices/wood-25.jpg',
    description: 'Great for detailed art.'
  },
  {
    id: 4,
    category: 'woodslices',
    title: 'Woodslice Size 30cm',
    price: 500,
    image: '/images/woodslices/wood-30.jpg',
    description: 'The masterpiece size.'
  },

  // --- Frames ---
  {
    id: 5,
    category: 'frames',
    title: 'Frame 10x15',
    price: 200,
    image: '/images/frames/frame-1.jpg'
  },
  {
    id: 6,
    category: 'frames',
    title: 'Frame 20x30',
    price: 370,
    image: '/images/frames/frame-large.jpg'
  },

  // --- Medals ---
  {
    id: 7,
    category: 'medals',
    title: 'Handmade Medal (Small)',
    price: 120,
    image: '/images/medals/medal-small.jpg'
  },
  {
    id: 8,
    category: 'medals',
    title: 'Handmade Medal (Big)',
    price: 150,
    image: '/images/medals/medal-big.jpg'
  },

  // --- Covers ---
  {
    id: 9,
    category: 'covers',
    title: 'Android Cover',
    price: 250,
    image: '/images/covers/android.jpg'
  },
  {
    id: 10,
    category: 'covers',
    title: 'iPhone Cover',
    price: 300,
    image: '/images/covers/iphone.jpg'
  }
];

// Helper functions
export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

export const getAllCategories = () => {
  return ['woodslices', 'frames', 'medals', 'covers'];
};

export const getCategoryDisplayName = (category) => {
  const names = {
    woodslices: 'Wood Slices',
    frames: 'Frames',
    medals: 'Medals',
    covers: 'Phone Covers'
  };
  return names[category] || category;
};