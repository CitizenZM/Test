import * as Phaser from 'phaser';

// Color palette - kid-friendly
const COLORS = {
  // Player colors
  skin: 0xFFD5B0,
  hair: 0x5C3A1E,
  shirt: 0x4A90E2,
  pants: 0x2C3E50,
  shoes: 0x1A1A2E,
  // Furniture colors
  wood: 0x8B6914,
  woodDark: 0x6B4F12,
  woodLight: 0xA67C00,
  metal: 0x8E8E8E,
  metalLight: 0xAAAAAA,
  screen: 0x00D4AA,
  screenDark: 0x009977,
  leafGreen: 0x4CAF50,
  leafDark: 0x388E3C,
  pot: 0xD2691E,
  cushion: 0xE74C3C,
  cushionLight: 0xFF6B6B,
  paper: 0xFFFDD0,
  bookRed: 0xC0392B,
  bookBlue: 0x2980B9,
  bookGreen: 0x27AE60,
  // Tile colors
  floor: 0xE8DCC8,
  floorAlt: 0xDED0BC,
  wall: 0x95A5A6,
  wallDark: 0x7F8C8D,
  // UI colors
  coinGold: 0xFFD700,
  coinDark: 0xDAA520,
  white: 0xFFFFFF,
  black: 0x000000,
  shadow: 0x333333,
};

export function generateSprites(scene: Phaser.Scene): void {
  generatePlayerSprites(scene);
  generateFurnitureSprites(scene);
  generateTileSprites(scene);
  generateUISprites(scene);
  generateParticleSprites(scene);
}

function generatePlayerSprites(scene: Phaser.Scene): void {
  // Generate 4-direction player sprites (32x32 each, 3 frames per direction)
  const directions = ['down', 'left', 'right', 'up'];

  directions.forEach((dir) => {
    const frames: Phaser.GameObjects.Graphics[] = [];
    for (let frame = 0; frame < 4; frame++) {
      const g = scene.add.graphics();
      drawPlayer(g, dir, frame);
      g.generateTexture(`player_${dir}_${frame}`, 32, 32);
      g.destroy();
    }
  });
}

function drawPlayer(g: Phaser.GameObjects.Graphics, dir: string, frame: number): void {
  const bobY = (frame === 1 || frame === 3) ? -1 : 0;
  const legOffset = frame === 1 ? 2 : frame === 3 ? -2 : 0;

  // Shadow
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(16, 30, 16, 6);

  // Body/shirt
  g.fillStyle(COLORS.shirt);
  g.fillRect(10, 14 + bobY, 12, 10);

  // Pants
  g.fillStyle(COLORS.pants);
  g.fillRect(10, 22 + bobY, 12, 4);

  // Legs
  g.fillStyle(COLORS.pants);
  g.fillRect(11 + legOffset, 26 + bobY, 4, 3);
  g.fillRect(17 - legOffset, 26 + bobY, 4, 3);

  // Shoes
  g.fillStyle(COLORS.shoes);
  g.fillRect(11 + legOffset, 28 + bobY, 4, 2);
  g.fillRect(17 - legOffset, 28 + bobY, 4, 2);

  // Arms
  g.fillStyle(COLORS.skin);
  if (dir === 'left') {
    g.fillRect(7, 15 + bobY, 3, 8);
    g.fillRect(20, 15 + bobY, 3, 7);
  } else if (dir === 'right') {
    g.fillRect(9, 15 + bobY, 3, 7);
    g.fillRect(22, 15 + bobY, 3, 8);
  } else {
    g.fillRect(7, 15 + bobY, 3, 8);
    g.fillRect(22, 15 + bobY, 3, 8);
  }

  // Head
  g.fillStyle(COLORS.skin);
  g.fillRoundedRect(10, 4 + bobY, 12, 12, 3);

  // Hair
  g.fillStyle(COLORS.hair);
  if (dir === 'up') {
    g.fillRoundedRect(9, 3 + bobY, 14, 7, 3);
  } else {
    g.fillRoundedRect(9, 3 + bobY, 14, 6, 3);
  }

  // Face (only when not facing up)
  if (dir !== 'up') {
    // Eyes
    g.fillStyle(COLORS.black);
    if (dir === 'down') {
      g.fillRect(13, 9 + bobY, 2, 2);
      g.fillRect(18, 9 + bobY, 2, 2);
      // Mouth
      g.fillStyle(0xE88B8B);
      g.fillRect(15, 13 + bobY, 3, 1);
    } else if (dir === 'left') {
      g.fillRect(11, 9 + bobY, 2, 2);
      g.fillRect(15, 9 + bobY, 2, 2);
      g.fillStyle(0xE88B8B);
      g.fillRect(12, 13 + bobY, 3, 1);
    } else {
      g.fillRect(15, 9 + bobY, 2, 2);
      g.fillRect(19, 9 + bobY, 2, 2);
      g.fillStyle(0xE88B8B);
      g.fillRect(17, 13 + bobY, 3, 1);
    }
  }
}

function generateFurnitureSprites(scene: Phaser.Scene): void {
  // Desk (64x48)
  let g = scene.add.graphics();
  // Desktop surface
  g.fillStyle(COLORS.wood);
  g.fillRect(2, 8, 60, 20);
  g.fillStyle(COLORS.woodLight);
  g.fillRect(4, 10, 56, 3);
  // Legs
  g.fillStyle(COLORS.woodDark);
  g.fillRect(4, 28, 4, 18);
  g.fillRect(56, 28, 4, 18);
  // Monitor
  g.fillStyle(COLORS.metal);
  g.fillRect(24, 0, 16, 2);
  g.fillStyle(COLORS.screenDark);
  g.fillRect(18, 0, 28, 10);
  g.fillStyle(COLORS.screen);
  g.fillRect(20, 1, 24, 7);
  // Keyboard
  g.fillStyle(COLORS.metalLight);
  g.fillRect(20, 12, 20, 4);
  g.generateTexture('furniture_desk', 64, 48);
  g.destroy();

  // Chair (32x40)
  g = scene.add.graphics();
  // Seat
  g.fillStyle(COLORS.cushion);
  g.fillRect(4, 16, 24, 8);
  g.fillStyle(COLORS.cushionLight);
  g.fillRect(6, 17, 20, 4);
  // Back
  g.fillStyle(COLORS.cushion);
  g.fillRect(6, 2, 20, 16);
  g.fillStyle(COLORS.cushionLight);
  g.fillRect(8, 4, 16, 10);
  // Base/wheels
  g.fillStyle(COLORS.metal);
  g.fillRect(14, 24, 4, 10);
  g.fillRect(6, 34, 20, 3);
  // Wheels
  g.fillStyle(COLORS.metalLight);
  g.fillCircle(8, 36, 2);
  g.fillCircle(24, 36, 2);
  g.generateTexture('furniture_chair', 32, 40);
  g.destroy();

  // Plant (32x48)
  g = scene.add.graphics();
  // Pot
  g.fillStyle(COLORS.pot);
  g.fillRect(8, 28, 16, 18);
  g.fillRect(6, 26, 20, 4);
  // Soil
  g.fillStyle(0x3E2723);
  g.fillRect(9, 27, 14, 3);
  // Leaves
  g.fillStyle(COLORS.leafGreen);
  g.fillCircle(16, 18, 10);
  g.fillCircle(10, 14, 7);
  g.fillCircle(22, 14, 7);
  g.fillCircle(16, 8, 8);
  g.fillStyle(COLORS.leafDark);
  g.fillCircle(14, 12, 5);
  g.fillCircle(20, 16, 4);
  g.generateTexture('furniture_plant', 32, 48);
  g.destroy();

  // Bookshelf (48x64)
  g = scene.add.graphics();
  // Frame
  g.fillStyle(COLORS.wood);
  g.fillRect(0, 0, 48, 64);
  g.fillStyle(COLORS.woodDark);
  g.fillRect(2, 2, 44, 60);
  // Shelves
  g.fillStyle(COLORS.wood);
  g.fillRect(2, 20, 44, 3);
  g.fillRect(2, 40, 44, 3);
  // Books row 1
  g.fillStyle(COLORS.bookRed);
  g.fillRect(4, 4, 8, 16);
  g.fillStyle(COLORS.bookBlue);
  g.fillRect(13, 6, 7, 14);
  g.fillStyle(COLORS.bookGreen);
  g.fillRect(21, 3, 9, 17);
  g.fillStyle(0x8E44AD);
  g.fillRect(31, 5, 6, 15);
  g.fillStyle(COLORS.bookRed);
  g.fillRect(38, 4, 7, 16);
  // Books row 2
  g.fillStyle(COLORS.bookBlue);
  g.fillRect(4, 24, 10, 16);
  g.fillStyle(0xF39C12);
  g.fillRect(15, 26, 8, 14);
  g.fillStyle(COLORS.bookGreen);
  g.fillRect(24, 23, 7, 17);
  g.fillStyle(0xE74C3C);
  g.fillRect(32, 25, 12, 15);
  // Items row 3
  g.fillStyle(COLORS.coinGold);
  g.fillCircle(12, 50, 6);
  g.fillStyle(COLORS.leafGreen);
  g.fillCircle(32, 48, 8);
  g.fillStyle(COLORS.leafDark);
  g.fillCircle(34, 50, 5);
  g.generateTexture('furniture_bookshelf', 48, 64);
  g.destroy();

  // Coffee table (48x32)
  g = scene.add.graphics();
  g.fillStyle(COLORS.wood);
  g.fillRect(2, 6, 44, 14);
  g.fillStyle(COLORS.woodLight);
  g.fillRect(4, 8, 40, 4);
  g.fillStyle(COLORS.woodDark);
  g.fillRect(4, 20, 4, 10);
  g.fillRect(40, 20, 4, 10);
  // Coffee cup
  g.fillStyle(COLORS.white);
  g.fillRect(18, 2, 10, 8);
  g.fillStyle(0x6F4E37);
  g.fillRect(20, 3, 6, 5);
  g.generateTexture('furniture_coffeetable', 48, 32);
  g.destroy();

  // Lamp (24x48)
  g = scene.add.graphics();
  // Base
  g.fillStyle(COLORS.metal);
  g.fillRect(6, 40, 12, 6);
  // Pole
  g.fillRect(10, 12, 4, 30);
  // Shade
  g.fillStyle(0xF5E6CA);
  g.fillRect(2, 0, 20, 14);
  g.fillStyle(0xFFF3D4);
  g.fillRect(4, 2, 16, 10);
  // Light glow
  g.fillStyle(0xFFFF00, 0.3);
  g.fillCircle(12, 7, 8);
  g.generateTexture('furniture_lamp', 24, 48);
  g.destroy();

  // Rug (64x48)
  g = scene.add.graphics();
  g.fillStyle(0xE74C3C);
  g.fillRoundedRect(0, 0, 64, 48, 4);
  g.fillStyle(0xC0392B);
  g.fillRoundedRect(4, 4, 56, 40, 3);
  g.fillStyle(0xF39C12);
  g.fillRoundedRect(8, 8, 48, 32, 2);
  g.fillStyle(0xC0392B);
  g.fillRoundedRect(12, 12, 40, 24, 2);
  // Pattern
  g.fillStyle(0xF39C12);
  g.fillRect(28, 12, 8, 24);
  g.fillRect(12, 20, 40, 8);
  g.generateTexture('furniture_rug', 64, 48);
  g.destroy();

  // Water cooler (32x48)
  g = scene.add.graphics();
  // Stand
  g.fillStyle(COLORS.metal);
  g.fillRect(8, 24, 16, 22);
  g.fillRect(6, 44, 20, 4);
  // Body
  g.fillStyle(0xBBDEFB);
  g.fillRect(6, 12, 20, 14);
  g.fillStyle(0x90CAF9);
  g.fillRect(8, 14, 16, 10);
  // Water jug
  g.fillStyle(0x42A5F5);
  g.fillRect(10, 0, 12, 14);
  g.fillStyle(0x64B5F6);
  g.fillRect(12, 2, 8, 10);
  // Tap
  g.fillStyle(COLORS.metalLight);
  g.fillRect(14, 26, 4, 3);
  g.generateTexture('furniture_watercooler', 32, 48);
  g.destroy();

  // Whiteboard (64x48)
  g = scene.add.graphics();
  // Frame
  g.fillStyle(COLORS.metal);
  g.fillRect(0, 4, 64, 40);
  // Board
  g.fillStyle(COLORS.white);
  g.fillRect(3, 7, 58, 34);
  // Doodles on board
  g.lineStyle(2, 0x333333);
  g.strokeCircle(20, 20, 8);
  g.lineBetween(35, 14, 50, 14);
  g.lineBetween(35, 20, 55, 20);
  g.lineBetween(35, 26, 48, 26);
  // Markers tray
  g.fillStyle(COLORS.metalLight);
  g.fillRect(10, 42, 44, 5);
  g.fillStyle(0xFF0000);
  g.fillRect(15, 42, 4, 5);
  g.fillStyle(0x0000FF);
  g.fillRect(21, 42, 4, 5);
  g.fillStyle(0x00AA00);
  g.fillRect(27, 42, 4, 5);
  g.generateTexture('furniture_whiteboard', 64, 48);
  g.destroy();
}

function generateTileSprites(scene: Phaser.Scene): void {
  // Floor tile
  let g = scene.add.graphics();
  g.fillStyle(COLORS.floor);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(COLORS.floorAlt);
  g.fillRect(0, 0, 16, 16);
  g.fillRect(16, 16, 16, 16);
  g.lineStyle(1, 0xD4C8B4, 0.5);
  g.strokeRect(0, 0, 32, 32);
  g.generateTexture('tile_floor', 32, 32);
  g.destroy();

  // Wall tile
  g = scene.add.graphics();
  g.fillStyle(COLORS.wall);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(COLORS.wallDark);
  g.fillRect(0, 28, 32, 4);
  g.lineStyle(1, 0xAABBBB, 0.3);
  g.strokeRect(0, 0, 32, 32);
  // Brick pattern
  g.lineStyle(1, 0x8899A0, 0.3);
  g.lineBetween(16, 0, 16, 14);
  g.lineBetween(0, 14, 32, 14);
  g.lineBetween(8, 14, 8, 28);
  g.lineBetween(24, 14, 24, 28);
  g.generateTexture('tile_wall', 32, 32);
  g.destroy();

  // Door
  g = scene.add.graphics();
  g.fillStyle(0x8B4513);
  g.fillRect(2, 0, 28, 32);
  g.fillStyle(0xA0522D);
  g.fillRect(4, 2, 24, 28);
  g.fillStyle(COLORS.coinGold);
  g.fillCircle(23, 16, 2);
  g.generateTexture('tile_door', 32, 32);
  g.destroy();
}

function generateUISprites(scene: Phaser.Scene): void {
  // Coin icon
  let g = scene.add.graphics();
  g.fillStyle(COLORS.coinGold);
  g.fillCircle(12, 12, 10);
  g.fillStyle(COLORS.coinDark);
  g.fillCircle(12, 12, 7);
  g.fillStyle(COLORS.coinGold);
  g.fillCircle(12, 12, 5);
  // Dollar sign
  g.fillStyle(COLORS.coinDark);
  g.fillRect(11, 7, 2, 10);
  g.fillRect(9, 9, 6, 2);
  g.fillRect(9, 14, 6, 2);
  g.generateTexture('ui_coin', 24, 24);
  g.destroy();

  // Star icon
  g = scene.add.graphics();
  g.fillStyle(COLORS.coinGold);
  // Simple star shape
  g.fillTriangle(12, 0, 15, 9, 24, 9);
  g.fillTriangle(17, 15, 24, 9, 20, 22);
  g.fillTriangle(12, 18, 17, 15, 20, 22);
  g.fillTriangle(4, 22, 7, 15, 12, 18);
  g.fillTriangle(0, 9, 7, 15, 9, 9);
  g.fillTriangle(7, 15, 9, 9, 15, 9);
  g.fillTriangle(7, 15, 15, 9, 17, 15);
  g.fillTriangle(7, 15, 17, 15, 12, 18);
  g.generateTexture('ui_star', 24, 24);
  g.destroy();

  // Task indicator (exclamation mark)
  g = scene.add.graphics();
  g.fillStyle(0xFFFF00);
  g.fillCircle(12, 12, 12);
  g.fillStyle(0x000000);
  g.fillRect(10, 4, 4, 12);
  g.fillRect(10, 18, 4, 4);
  g.generateTexture('ui_task_indicator', 24, 24);
  g.destroy();

  // Button background
  g = scene.add.graphics();
  g.fillStyle(0x4A90E2);
  g.fillRoundedRect(0, 0, 160, 48, 8);
  g.fillStyle(0x5BA0F2);
  g.fillRoundedRect(2, 2, 156, 22, 6);
  g.generateTexture('ui_button', 160, 48);
  g.destroy();

  // Button hover
  g = scene.add.graphics();
  g.fillStyle(0x5BA0F2);
  g.fillRoundedRect(0, 0, 160, 48, 8);
  g.fillStyle(0x6BB0FF);
  g.fillRoundedRect(2, 2, 156, 22, 6);
  g.generateTexture('ui_button_hover', 160, 48);
  g.destroy();

  // Shop panel background
  g = scene.add.graphics();
  g.fillStyle(0x000000, 0.7);
  g.fillRoundedRect(0, 0, 400, 500, 12);
  g.fillStyle(0x2C3E50);
  g.fillRoundedRect(4, 4, 392, 492, 10);
  g.fillStyle(0x34495E);
  g.fillRoundedRect(8, 8, 384, 484, 8);
  g.generateTexture('ui_panel', 400, 500);
  g.destroy();

  // Shop item slot
  g = scene.add.graphics();
  g.fillStyle(0x4A5568);
  g.fillRoundedRect(0, 0, 80, 80, 6);
  g.fillStyle(0x5A6578);
  g.fillRoundedRect(2, 2, 76, 76, 5);
  g.generateTexture('ui_item_slot', 80, 80);
  g.destroy();

  // Progress bar background
  g = scene.add.graphics();
  g.fillStyle(0x333333);
  g.fillRoundedRect(0, 0, 100, 12, 4);
  g.generateTexture('ui_progress_bg', 100, 12);
  g.destroy();

  // Progress bar fill
  g = scene.add.graphics();
  g.fillStyle(0x4CAF50);
  g.fillRoundedRect(0, 0, 96, 8, 3);
  g.generateTexture('ui_progress_fill', 96, 8);
  g.destroy();

  // Interaction prompt (E key)
  g = scene.add.graphics();
  g.fillStyle(0x000000, 0.8);
  g.fillRoundedRect(0, 0, 80, 28, 6);
  g.fillStyle(0xFFFFFF);
  g.fillRoundedRect(2, 2, 24, 24, 4);
  g.fillStyle(0x000000);
  g.fillRect(8, 8, 12, 3);
  g.fillRect(8, 8, 3, 12);
  g.fillRect(8, 14, 8, 3);
  g.fillRect(8, 17, 3, 3);
  g.fillRect(8, 17, 12, 3);
  g.generateTexture('ui_interact_prompt', 80, 28);
  g.destroy();
}

function generateParticleSprites(scene: Phaser.Scene): void {
  // Coin particle
  let g = scene.add.graphics();
  g.fillStyle(COLORS.coinGold);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle_coin', 8, 8);
  g.destroy();

  // Star particle
  g = scene.add.graphics();
  g.fillStyle(COLORS.coinGold);
  g.fillRect(2, 0, 4, 8);
  g.fillRect(0, 2, 8, 4);
  g.generateTexture('particle_star', 8, 8);
  g.destroy();

  // Sparkle
  g = scene.add.graphics();
  g.fillStyle(0xFFFFFF);
  g.fillRect(3, 0, 2, 8);
  g.fillRect(0, 3, 8, 2);
  g.generateTexture('particle_sparkle', 8, 8);
  g.destroy();
}
