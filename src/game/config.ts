export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;

export const ROOM_COLS = 20;
export const ROOM_ROWS = 15;

export const PLAYER_SPEED = 120;

// Furniture catalog
export interface FurnitureItem {
  id: string;
  name: string;
  price: number;
  width: number;
  height: number;
  texture: string;
  description: string;
  category: 'work' | 'decor' | 'comfort';
  unlockLevel: number;
}

export const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: 'desk', name: 'Office Desk', price: 50, width: 64, height: 48, texture: 'furniture_desk', description: 'A desk to work at!', category: 'work', unlockLevel: 1 },
  { id: 'chair', name: 'Comfy Chair', price: 30, width: 32, height: 40, texture: 'furniture_chair', description: 'Take a seat!', category: 'comfort', unlockLevel: 1 },
  { id: 'plant', name: 'Office Plant', price: 40, width: 32, height: 48, texture: 'furniture_plant', description: 'A happy green friend', category: 'decor', unlockLevel: 1 },
  { id: 'bookshelf', name: 'Bookshelf', price: 80, width: 48, height: 64, texture: 'furniture_bookshelf', description: 'Full of knowledge!', category: 'decor', unlockLevel: 2 },
  { id: 'coffeetable', name: 'Coffee Table', price: 60, width: 48, height: 32, texture: 'furniture_coffeetable', description: 'Coffee time!', category: 'comfort', unlockLevel: 2 },
  { id: 'lamp', name: 'Floor Lamp', price: 45, width: 24, height: 48, texture: 'furniture_lamp', description: 'Bright idea!', category: 'decor', unlockLevel: 1 },
  { id: 'rug', name: 'Fancy Rug', price: 70, width: 64, height: 48, texture: 'furniture_rug', description: 'It ties the room together', category: 'decor', unlockLevel: 2 },
  { id: 'watercooler', name: 'Water Cooler', price: 90, width: 32, height: 48, texture: 'furniture_watercooler', description: 'Stay hydrated!', category: 'comfort', unlockLevel: 3 },
  { id: 'whiteboard', name: 'Whiteboard', price: 100, width: 64, height: 48, texture: 'furniture_whiteboard', description: 'Plan your ideas!', category: 'work', unlockLevel: 3 },
];

// Task rewards
export const TASK_DURATION = 3000; // ms
export const TASK_REWARD_COINS = 10;
export const TASK_COOLDOWN = 2000; // ms

// Level thresholds
export const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];

// Room layouts
export const OFFICE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1],
];

// 0 = floor, 1 = wall, 2 = door
