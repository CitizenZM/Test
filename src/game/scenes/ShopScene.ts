import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FURNITURE_CATALOG, FurnitureItem } from '../config';
import GameStateManager from '../managers/GameStateManager';
import AudioManager from '../managers/AudioManager';

export default class ShopScene extends Phaser.Scene {
  private gameState!: GameStateManager;
  private audio!: AudioManager;
  private selectedItem: FurnitureItem | null = null;
  private coinText!: Phaser.GameObjects.Text;
  private inventoryText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private buyButton!: Phaser.GameObjects.Container;
  private placeButton!: Phaser.GameObjects.Container;
  private itemSlots: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    this.gameState = GameStateManager.getInstance();
    this.audio = AudioManager.getInstance();

    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);

    // Panel background
    const panelX = GAME_WIDTH / 2 - 250;
    const panelY = 30;
    const panelW = 500;
    const panelH = 540;

    const panel = this.add.graphics();
    panel.fillStyle(0x2C3E50);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panel.fillStyle(0x34495E);
    panel.fillRoundedRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 10);

    // Title
    this.add.text(GAME_WIDTH / 2, panelY + 30, 'FURNITURE SHOP', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#F5A623',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Coin display
    this.add.image(panelX + 30, panelY + 65, 'ui_coin');
    this.coinText = this.add.text(panelX + 50, panelY + 65, `${this.gameState.getState().coins}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FFD700',
    }).setOrigin(0, 0.5);

    // Level display
    this.add.text(panelX + panelW - 30, panelY + 65, `Level ${this.gameState.getState().level}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(1, 0.5);

    // Inventory count
    const state = this.gameState.getState();
    this.inventoryText = this.add.text(GAME_WIDTH / 2, panelY + 65, `Inventory: ${state.furnitureInventory.length} items`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#88aacc',
    }).setOrigin(0.5);

    // Item grid
    this.createItemGrid(panelX + 20, panelY + 90);

    // Description area
    const descBg = this.add.graphics();
    descBg.fillStyle(0x1a1a2e, 0.8);
    descBg.fillRoundedRect(panelX + 20, panelY + 380, panelW - 40, 70, 6);

    this.descText = this.add.text(panelX + 35, panelY + 395, 'Select an item to see details', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc',
      wordWrap: { width: panelW - 70 },
    });

    // Buy button
    this.buyButton = this.createButton(GAME_WIDTH / 2 - 80, panelY + 475, 'BUY', '#4CAF50', () => {
      this.buySelectedItem();
    });

    // Place button
    this.placeButton = this.createButton(GAME_WIDTH / 2 + 80, panelY + 475, 'PLACE', '#2196F3', () => {
      this.placeSelectedItem();
    });
    this.placeButton.setVisible(false);

    // Close button
    const closeBtn = this.add.text(panelX + panelW - 20, panelY + 12, 'X', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      this.audio.playClickSound();
      this.closeShop();
    });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff6666'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff4444'));

    // ESC to close
    if (this.input.keyboard) {
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
        this.closeShop();
      });
    }
  }

  private createItemGrid(startX: number, startY: number): void {
    const cols = 5;
    const slotSize = 85;
    const gap = 6;
    const state = this.gameState.getState();

    FURNITURE_CATALOG.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (slotSize + gap) + slotSize / 2;
      const y = startY + row * (slotSize + gap + 20) + slotSize / 2;

      const isUnlocked = state.level >= item.unlockLevel;
      const owned = state.furnitureInventory.filter(id => id === item.id).length;

      // Slot background
      const slotBg = this.add.graphics();
      slotBg.fillStyle(isUnlocked ? 0x4A5568 : 0x333333);
      slotBg.fillRoundedRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize, 6);

      // Item image
      const img = this.add.image(0, -8, item.texture);
      const scale = Math.min(60 / item.width, 50 / item.height);
      img.setScale(scale);
      if (!isUnlocked) img.setTint(0x555555);

      // Price text
      const priceText = this.add.text(0, slotSize / 2 - 8, isUnlocked ? `${item.price}` : `Lv${item.unlockLevel}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: isUnlocked ? (state.coins >= item.price ? '#FFD700' : '#FF6666') : '#888888',
      }).setOrigin(0.5);

      // Name
      const nameText = this.add.text(0, slotSize / 2 + 8, item.name, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#cccccc',
      }).setOrigin(0.5);

      // Owned count
      let ownedBadge: Phaser.GameObjects.Text | null = null;
      if (owned > 0) {
        ownedBadge = this.add.text(slotSize / 2 - 5, -slotSize / 2 + 5, `${owned}`, {
          fontFamily: 'Arial Black',
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#4CAF50',
          padding: { x: 4, y: 2 },
        }).setOrigin(1, 0);
      }

      const container = this.add.container(x, y, [slotBg, img, priceText, nameText]);
      if (ownedBadge) container.add(ownedBadge);

      if (isUnlocked) {
        container.setSize(slotSize, slotSize + 20);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerdown', () => {
          this.audio.playClickSound();
          this.selectItem(item, container);
        });

        container.on('pointerover', () => {
          slotBg.clear();
          slotBg.fillStyle(0x5A6578);
          slotBg.fillRoundedRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize, 6);
        });

        container.on('pointerout', () => {
          slotBg.clear();
          slotBg.fillStyle(this.selectedItem === item ? 0x6A7588 : 0x4A5568);
          slotBg.fillRoundedRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize, 6);
        });
      }

      this.itemSlots.push(container);
    });
  }

  private selectItem(item: FurnitureItem, _container: Phaser.GameObjects.Container): void {
    this.selectedItem = item;
    const state = this.gameState.getState();
    const owned = state.furnitureInventory.filter(id => id === item.id).length;

    this.descText.setText(
      `${item.name} - ${item.description}\nCategory: ${item.category} | Price: ${item.price} coins | Owned: ${owned}`
    );

    this.buyButton.setVisible(true);
    this.placeButton.setVisible(owned > 0);
  }

  private buySelectedItem(): void {
    if (!this.selectedItem) return;

    const success = this.gameState.buyFurniture(this.selectedItem.id);
    if (success) {
      this.audio.playBuySound();
      this.coinText.setText(`${this.gameState.getState().coins}`);
      this.inventoryText.setText(`Inventory: ${this.gameState.getState().furnitureInventory.length} items`);
      this.showShopMessage(`Bought ${this.selectedItem.name}!`, '#4CAF50');

      // Refresh display
      this.selectItem(this.selectedItem, this.itemSlots[0]);
    } else {
      this.audio.playError();
      if (this.gameState.getState().coins < this.selectedItem.price) {
        this.showShopMessage('Not enough coins!', '#FF4444');
      }
    }
  }

  private placeSelectedItem(): void {
    if (!this.selectedItem) return;
    const state = this.gameState.getState();
    const owned = state.furnitureInventory.filter(id => id === this.selectedItem!.id).length;

    if (owned <= 0) {
      this.showShopMessage('Buy this item first!', '#FF4444');
      return;
    }

    // Close shop and enter placement mode
    const gameScene = this.scene.get('GameScene') as unknown as { startPlacingFurniture: (id: string) => void };
    gameScene.startPlacingFurniture(this.selectedItem.id);
    this.closeShop();
  }

  private showShopMessage(text: string, color: string): void {
    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: color,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: msg,
      y: msg.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => msg.destroy(),
    });
  }

  private createButton(x: number, y: number, label: string, color: string, callback: () => void): Phaser.GameObjects.Container {
    const bg = this.add.graphics();
    const colorNum = parseInt(color.replace('#', ''), 16);
    bg.fillStyle(colorNum);
    bg.fillRoundedRect(-60, -18, 120, 36, 8);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(120, 36);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => callback());
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(colorNum, 0.8);
      bg.fillRoundedRect(-60, -18, 120, 36, 8);
    });
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(colorNum);
      bg.fillRoundedRect(-60, -18, 120, 36, 8);
    });

    return container;
  }

  private closeShop(): void {
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
