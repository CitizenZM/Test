import * as Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, PLAYER_SPEED,
  OFFICE_LAYOUT, TASK_DURATION, TASK_REWARD_COINS, TASK_COOLDOWN,
  FURNITURE_CATALOG, ROOM_COLS, ROOM_ROWS,
} from '../config';
import GameStateManager, { PlacedFurniture } from '../managers/GameStateManager';
import SaveManager from '../managers/SaveManager';
import AudioManager from '../managers/AudioManager';

interface DeskObject {
  sprite: Phaser.GameObjects.Image;
  x: number;
  y: number;
  isWorking: boolean;
  cooldownTimer: number;
  indicator: Phaser.GameObjects.Image;
}

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;

  private gameState!: GameStateManager;
  private saveManager!: SaveManager;
  private audio!: AudioManager;

  private wallGroup!: Phaser.Physics.Arcade.StaticGroup;
  private desks: DeskObject[] = [];
  private placedFurnitureSprites: Map<string, Phaser.GameObjects.Image> = new Map();

  // HUD elements
  private coinText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private taskText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer?: Phaser.Time.TimerEvent;

  // Task state
  private activeTask: DeskObject | null = null;
  private taskProgress = 0;
  private taskProgressBar!: Phaser.GameObjects.Graphics;
  private taskProgressBg!: Phaser.GameObjects.Graphics;

  // Interaction
  private nearestDesk: DeskObject | null = null;
  private interactPrompt!: Phaser.GameObjects.Container;

  // Placement mode
  private isPlacingFurniture = false;
  private placingItem: string | null = null;
  private placingPreview: Phaser.GameObjects.Image | null = null;

  // Player animation tracking
  private currentDir: string = 'down';
  private animFrame: number = 0;
  private animTimer: number = 0;
  private isMoving: boolean = false;

  // Play time tracking
  private playTimeTimer: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameState = GameStateManager.getInstance();
    this.saveManager = SaveManager.getInstance();
    this.audio = AudioManager.getInstance();

    this.cameras.main.fadeIn(500);
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Create the room
    this.createRoom();

    // Create player
    this.createPlayer();

    // Create initial desks
    this.createStarterDesks();

    // Restore placed furniture
    this.restorePlacedFurniture();

    // Create HUD
    this.createHUD();

    // Create interaction prompt
    this.createInteractPrompt();

    // Create task progress bar
    this.createTaskProgressBar();

    // Setup input
    this.setupInput();

    // Start auto-save
    this.saveManager.startAutoSave(30000);

    // Show welcome message
    const state = this.gameState.getState();
    if (state.totalTasksCompleted === 0) {
      this.showMessage('Welcome! Walk to a desk and press E to work!', 4000);
    } else {
      this.showMessage(`Welcome back! You have ${state.coins} coins`, 2000);
    }
  }

  private createRoom(): void {
    this.wallGroup = this.physics.add.staticGroup();

    for (let row = 0; row < ROOM_ROWS; row++) {
      for (let col = 0; col < ROOM_COLS; col++) {
        const x = col * TILE_SIZE + TILE_SIZE / 2 + (GAME_WIDTH - ROOM_COLS * TILE_SIZE) / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2 + 40; // offset for HUD

        const tile = OFFICE_LAYOUT[row][col];

        if (tile === 0) {
          this.add.image(x, y, 'tile_floor');
        } else if (tile === 1) {
          this.add.image(x, y, 'tile_wall');
          const wall = this.wallGroup.create(x, y, 'tile_wall') as Phaser.Physics.Arcade.Image;
          wall.setVisible(false);
          wall.body!.setSize(TILE_SIZE, TILE_SIZE);
        } else if (tile === 2) {
          this.add.image(x, y, 'tile_floor');
          // Door marker
          this.add.image(x, y, 'tile_door').setAlpha(0.7);
        }
      }
    }
  }

  private createPlayer(): void {
    const startX = GAME_WIDTH / 2;
    const startY = GAME_HEIGHT / 2 + 40;

    this.player = this.add.sprite(startX, startY, 'player_down_0');
    this.physics.add.existing(this.player);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    body.setOffset(8, 14);
    body.setCollideWorldBounds(true);

    // Set world bounds to room area
    const roomOffsetX = (GAME_WIDTH - ROOM_COLS * TILE_SIZE) / 2;
    const roomOffsetY = 40;
    this.physics.world.setBounds(
      roomOffsetX + TILE_SIZE,
      roomOffsetY + TILE_SIZE * 2,
      (ROOM_COLS - 2) * TILE_SIZE,
      (ROOM_ROWS - 3) * TILE_SIZE
    );

    // Add collision with walls
    this.physics.add.collider(this.player, this.wallGroup);

    // Player depth
    this.player.setDepth(10);
  }

  private createStarterDesks(): void {
    // Place a few starter desks around the office
    const deskPositions = [
      { col: 4, row: 4 },
      { col: 10, row: 4 },
      { col: 16, row: 4 },
      { col: 7, row: 9 },
      { col: 13, row: 9 },
    ];

    const roomOffsetX = (GAME_WIDTH - ROOM_COLS * TILE_SIZE) / 2;
    const roomOffsetY = 40;

    deskPositions.forEach(pos => {
      const x = pos.col * TILE_SIZE + TILE_SIZE / 2 + roomOffsetX;
      const y = pos.row * TILE_SIZE + TILE_SIZE / 2 + roomOffsetY;

      const deskSprite = this.add.image(x, y, 'furniture_desk');
      deskSprite.setDepth(5);

      const indicator = this.add.image(x, y - 40, 'ui_task_indicator');
      indicator.setDepth(15);
      this.tweens.add({
        targets: indicator,
        y: y - 44,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });

      this.desks.push({
        sprite: deskSprite,
        x, y,
        isWorking: false,
        cooldownTimer: 0,
        indicator,
      });
    });
  }

  private restorePlacedFurniture(): void {
    const state = this.gameState.getState();
    state.furniturePlaced.forEach(placed => {
      this.addFurnitureSprite(placed);
    });
  }

  private addFurnitureSprite(placed: PlacedFurniture): void {
    const item = FURNITURE_CATALOG.find(f => f.id === placed.furnitureId);
    if (!item) return;

    const sprite = this.add.image(placed.x, placed.y, item.texture);
    sprite.setDepth(5);
    sprite.setInteractive({ useHandCursor: true });

    sprite.on('pointerdown', () => {
      if (!this.isPlacingFurniture && !this.activeTask) {
        // Pick up furniture
        this.gameState.removeFurniture(placed.id);
        sprite.destroy();
        this.placedFurnitureSprites.delete(placed.id);
        this.audio.playPlaceSound();
        this.showMessage('Furniture picked up! Check your inventory.', 2000);
        this.updateHUD();
      }
    });

    this.placedFurnitureSprites.set(placed.id, sprite);
  }

  private createHUD(): void {
    // Top bar background
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x2C3E50, 0.9);
    hudBg.fillRect(0, 0, GAME_WIDTH, 38);
    hudBg.setDepth(20);

    // Coin icon and text
    const coinIcon = this.add.image(30, 19, 'ui_coin').setDepth(21);
    this.coinText = this.add.text(50, 19, '0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5).setDepth(21);

    // Level text
    this.levelText = this.add.text(160, 19, 'Level 1', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5).setDepth(21);

    // Tasks completed
    this.taskText = this.add.text(280, 19, 'Tasks: 0', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa',
    }).setOrigin(0, 0.5).setDepth(21);

    // Shop button
    const shopBtn = this.add.text(GAME_WIDTH - 100, 19, '[ SHOP ]', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
      color: '#F5A623',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

    shopBtn.on('pointerover', () => shopBtn.setColor('#FFD700'));
    shopBtn.on('pointerout', () => shopBtn.setColor('#F5A623'));
    shopBtn.on('pointerdown', () => {
      this.audio.playClickSound();
      this.scene.launch('ShopScene');
      this.scene.pause();
    });

    // Mute button
    const muteBtn = this.add.text(GAME_WIDTH - 30, 19, '♪', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

    muteBtn.on('pointerdown', () => {
      const muted = this.audio.toggleMute();
      muteBtn.setColor(muted ? '#666666' : '#ffffff');
      muteBtn.setText(muted ? '♪' : '♪');
    });

    // Message text (center, for notifications)
    this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    this.updateHUD();
  }

  private createInteractPrompt(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(0, 0, 120, 30, 6);

    const text = this.add.text(60, 15, 'Press E to work', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.interactPrompt = this.add.container(0, 0, [bg, text]);
    this.interactPrompt.setDepth(20);
    this.interactPrompt.setVisible(false);
  }

  private createTaskProgressBar(): void {
    this.taskProgressBg = this.add.graphics();
    this.taskProgressBg.setDepth(20);
    this.taskProgressBg.setVisible(false);

    this.taskProgressBar = this.add.graphics();
    this.taskProgressBar.setDepth(21);
    this.taskProgressBar.setVisible(false);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Escape to cancel placement
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
      if (this.isPlacingFurniture) {
        this.cancelPlacement();
      }
    });

    // Click to place furniture
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPlacingFurniture && this.placingItem && pointer.y > 40) {
        this.confirmPlacement(pointer.x, pointer.y);
      }
    });

    // Move preview with mouse
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.placingPreview) {
        // Snap to grid
        const snappedX = Math.round(pointer.x / 16) * 16;
        const snappedY = Math.round(pointer.y / 16) * 16;
        this.placingPreview.setPosition(snappedX, snappedY);
      }
    });
  }

  update(time: number, delta: number): void {
    if (this.activeTask) {
      this.updateTask(delta);
      return; // Can't move while working
    }

    this.updatePlayerMovement(delta);
    this.updateDeskInteraction();
    this.updateDeskCooldowns(delta);
    this.trackPlayTime(delta);
  }

  private updatePlayerMovement(delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -PLAYER_SPEED;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = PLAYER_SPEED;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -PLAYER_SPEED;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = PLAYER_SPEED;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    body.setVelocity(vx, vy);

    // Determine direction
    this.isMoving = vx !== 0 || vy !== 0;

    if (this.isMoving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.currentDir = vx < 0 ? 'left' : 'right';
      } else {
        this.currentDir = vy < 0 ? 'up' : 'down';
      }

      // Animate
      this.animTimer += delta;
      if (this.animTimer > 150) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }

    this.player.setTexture(`player_${this.currentDir}_${this.animFrame}`);

    // Sort depth based on Y position
    this.player.setDepth(10 + this.player.y * 0.01);
  }

  private updateDeskInteraction(): void {
    const interactDist = 50;
    let closest: DeskObject | null = null;
    let closestDist = Infinity;

    for (const desk of this.desks) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, desk.x, desk.y);
      if (dist < interactDist && dist < closestDist && !desk.isWorking && desk.cooldownTimer <= 0) {
        closest = desk;
        closestDist = dist;
      }
    }

    this.nearestDesk = closest;

    if (closest) {
      this.interactPrompt.setPosition(closest.x - 60, closest.y - 55);
      this.interactPrompt.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.startTask(closest);
      }
    } else {
      this.interactPrompt.setVisible(false);
    }
  }

  private startTask(desk: DeskObject): void {
    this.activeTask = desk;
    desk.isWorking = true;
    desk.indicator.setVisible(false);
    this.taskProgress = 0;
    this.interactPrompt.setVisible(false);

    this.audio.playTaskStart();

    // Show progress bar above desk
    this.taskProgressBg.setVisible(true);
    this.taskProgressBar.setVisible(true);
    this.updateTaskProgressBar();

    this.showMessage('Working...', TASK_DURATION);

    // Stop player
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  private updateTask(delta: number): void {
    if (!this.activeTask) return;

    this.taskProgress += delta;
    this.updateTaskProgressBar();

    if (this.taskProgress >= TASK_DURATION) {
      this.completeTask();
    }
  }

  private updateTaskProgressBar(): void {
    if (!this.activeTask) return;

    const desk = this.activeTask;
    const barWidth = 80;
    const barHeight = 10;
    const x = desk.x - barWidth / 2;
    const y = desk.y - 50;
    const progress = Math.min(this.taskProgress / TASK_DURATION, 1);

    this.taskProgressBg.clear();
    this.taskProgressBg.fillStyle(0x333333, 0.9);
    this.taskProgressBg.fillRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 4);

    this.taskProgressBar.clear();
    this.taskProgressBar.fillStyle(0x4CAF50);
    this.taskProgressBar.fillRoundedRect(x, y, barWidth * progress, barHeight, 3);
  }

  private completeTask(): void {
    if (!this.activeTask) return;

    const desk = this.activeTask;
    desk.isWorking = false;
    desk.cooldownTimer = TASK_COOLDOWN;

    this.activeTask = null;
    this.taskProgress = 0;

    this.taskProgressBg.setVisible(false);
    this.taskProgressBar.setVisible(false);
    this.taskProgressBg.clear();
    this.taskProgressBar.clear();

    // Award coins
    this.gameState.addCoins(TASK_REWARD_COINS);
    this.gameState.completeTask();
    this.audio.playTaskComplete();
    this.audio.playCoinSound();

    // Coin popup animation
    this.createCoinPopup(desk.x, desk.y - 30);

    // Check for level up
    const state = this.gameState.getState();
    const prevLevel = state.level;
    this.updateHUD();
    if (this.gameState.getState().level > prevLevel) {
      this.audio.playLevelUp();
      this.showMessage(`LEVEL UP! You're now level ${this.gameState.getState().level}!`, 3000);
      this.createLevelUpEffect();
    } else {
      this.showMessage(`+${TASK_REWARD_COINS} coins!`, 1500);
    }
  }

  private createCoinPopup(x: number, y: number): void {
    const coinText = this.add.text(x, y, `+${TASK_REWARD_COINS}`, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: coinText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => coinText.destroy(),
    });

    // Sparkle particles
    for (let i = 0; i < 5; i++) {
      const spark = this.add.image(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 20,
        'particle_star'
      ).setDepth(30).setScale(Math.random() + 0.5);

      this.tweens.add({
        targets: spark,
        y: spark.y - 30 - Math.random() * 20,
        x: spark.x + (Math.random() - 0.5) * 40,
        alpha: 0,
        scale: 0,
        duration: 600 + Math.random() * 400,
        onComplete: () => spark.destroy(),
      });
    }
  }

  private createLevelUpEffect(): void {
    // Big flashy level up effect
    const flash = this.add.graphics();
    flash.fillStyle(0xFFD700, 0.3);
    flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    flash.setDepth(50);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy(),
    });

    const levelText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'LEVEL UP!', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(51).setScale(0);

    this.tweens.add({
      targets: levelText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      yoyo: true,
      hold: 1000,
      onComplete: () => levelText.destroy(),
    });
  }

  private updateDeskCooldowns(delta: number): void {
    for (const desk of this.desks) {
      if (desk.cooldownTimer > 0) {
        desk.cooldownTimer -= delta;
        desk.indicator.setVisible(false);
      } else if (!desk.isWorking) {
        desk.indicator.setVisible(true);
      }
    }
  }

  private updateHUD(): void {
    const state = this.gameState.getState();
    this.coinText.setText(`${state.coins}`);
    this.levelText.setText(`Level ${state.level}`);
    this.taskText.setText(`Tasks: ${state.totalTasksCompleted}`);
  }

  private showMessage(text: string, duration: number = 2000): void {
    if (this.messageTimer) {
      this.messageTimer.remove();
    }
    this.messageText.setText(text);
    this.messageText.setAlpha(1);
    this.messageTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: this.messageText,
        alpha: 0,
        duration: 300,
      });
    });
  }

  private trackPlayTime(delta: number): void {
    this.playTimeTimer += delta;
    if (this.playTimeTimer >= 1000) {
      this.gameState.addPlayTime(1);
      this.playTimeTimer -= 1000;
    }
  }

  // Called from ShopScene to start placing furniture
  startPlacingFurniture(furnitureId: string): void {
    const item = FURNITURE_CATALOG.find(f => f.id === furnitureId);
    if (!item) return;

    this.isPlacingFurniture = true;
    this.placingItem = furnitureId;

    this.placingPreview = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, item.texture);
    this.placingPreview.setAlpha(0.6);
    this.placingPreview.setDepth(30);
    this.placingPreview.setTint(0x00FF00);

    this.showMessage('Click to place furniture. ESC to cancel.', 5000);
  }

  private confirmPlacement(x: number, y: number): void {
    if (!this.placingItem) return;

    const placed = this.gameState.placeFurniture(this.placingItem, x, y);
    if (placed) {
      this.addFurnitureSprite(placed);
      this.audio.playPlaceSound();
      this.showMessage('Furniture placed!', 1500);
    }

    this.cancelPlacement();
    this.updateHUD();
  }

  private cancelPlacement(): void {
    this.isPlacingFurniture = false;
    this.placingItem = null;
    if (this.placingPreview) {
      this.placingPreview.destroy();
      this.placingPreview = null;
    }
  }
}
