import * as Phaser from 'phaser';
import { generateSprites } from '../assets/SpriteGenerator';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0x2C3E50, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 8);

    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Simulate loading with sprite generation
    progressBar.fillStyle(0x4A90E2, 1);
    progressBar.fillRoundedRect(width / 2 - 155, height / 2 - 10, 310, 20, 6);
  }

  create(): void {
    // Generate all sprites programmatically
    generateSprites(this);

    // Transition to menu
    this.scene.start('MenuScene');
  }
}
