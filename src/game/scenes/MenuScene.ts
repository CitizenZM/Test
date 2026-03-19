import * as Phaser from 'phaser';
import GameStateManager from '../managers/GameStateManager';
import SaveManager from '../managers/SaveManager';
import AudioManager from '../managers/AudioManager';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export default class MenuScene extends Phaser.Scene {
  private gameState!: GameStateManager;
  private saveManager!: SaveManager;

  constructor() {
    super({ key: 'MenuScene' });
  }

  async create(): Promise<void> {
    this.gameState = GameStateManager.getInstance();
    this.saveManager = SaveManager.getInstance();

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Animated stars background
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT,
        Math.random() * 2 + 1,
        0xffffff,
        Math.random() * 0.5 + 0.3
      );
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
      });
    }

    // Title with bounce animation
    const title = this.add.text(cx, 100, 'PIXEL OFFICE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      color: '#F5A623',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 110,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Subtitle
    this.add.text(cx, 160, 'Build Your Dream Office!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Decorative pixel art office
    this.drawMiniOffice(cx, cy - 30);

    // Play button
    const playBtn = this.add.image(cx, cy + 100, 'ui_button').setInteractive({ useHandCursor: true });
    const playText = this.add.text(cx, cy + 100, 'PLAY!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    playBtn.on('pointerover', () => {
      playBtn.setTexture('ui_button_hover');
      playBtn.setScale(1.05);
      playText.setScale(1.05);
    });
    playBtn.on('pointerout', () => {
      playBtn.setTexture('ui_button');
      playBtn.setScale(1);
      playText.setScale(1);
    });
    playBtn.on('pointerdown', async () => {
      AudioManager.getInstance().playClickSound();
      playBtn.setScale(0.95);
      playText.setScale(0.95);

      // Try to load saved game
      await this.saveManager.loadGame();

      // Transition
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });

    // Bounce animation on button
    this.tweens.add({
      targets: [playBtn, playText],
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Credits
    this.add.text(cx, GAME_HEIGHT - 40, 'Use Arrow Keys or WASD to move', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT - 20, 'Press E to interact with desks', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  private drawMiniOffice(cx: number, cy: number): void {
    // Small decorative office preview
    const g = this.add.graphics();

    // Floor
    g.fillStyle(0xE8DCC8);
    g.fillRect(cx - 80, cy - 40, 160, 80);

    // Walls
    g.fillStyle(0x95A5A6);
    g.fillRect(cx - 80, cy - 60, 160, 20);
    g.fillRect(cx - 80, cy - 40, 4, 80);
    g.fillRect(cx + 76, cy - 40, 4, 80);

    // Mini desk
    g.fillStyle(0x8B6914);
    g.fillRect(cx - 30, cy - 20, 40, 12);
    g.fillRect(cx - 28, cy - 8, 4, 16);
    g.fillRect(cx + 4, cy - 8, 4, 16);

    // Mini monitor
    g.fillStyle(0x333333);
    g.fillRect(cx - 16, cy - 32, 20, 14);
    g.fillStyle(0x00D4AA);
    g.fillRect(cx - 14, cy - 30, 16, 10);

    // Mini plant
    g.fillStyle(0xD2691E);
    g.fillRect(cx + 30, cy, 10, 12);
    g.fillStyle(0x4CAF50);
    g.fillCircle(cx + 35, cy - 4, 8);

    // Mini character
    g.fillStyle(0xFFD5B0);
    g.fillCircle(cx - 5, cy + 10, 5);
    g.fillStyle(0x4A90E2);
    g.fillRect(cx - 9, cy + 15, 8, 10);
  }
}
