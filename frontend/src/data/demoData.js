import shirt from '../assets/black-shirt.png';
import jeans from '../assets/jeans.png';


export const demoOutfits = [
  {
    id: 1,
    occasion: "Casual",
    is_favorite: false,
    created_at: "2024-01-15T10:30:00Z",
    clothes: [
      {
        id: 101,
        description: "Czarna koszulka",
        color: "Czarny",
        image_url: shirt
      },
      {
        id: 102,
        description: "Niebieskie jeansy",
        color: "Niebieski",
        image_url: jeans
      }
    ]
  }
];

export const demoClothes = [
  {
    id: 101,
    description: "Czarna koszulka",
    color: "Czarny",
    categories: ["Koszulki"],
    image_url: shirt
  },
  {
    id: 102,
    description: "Niebieskie jeansy",
    color: "Niebieski",
    categories: ["Spodnie"],
    image_url: jeans
  }
];
