'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/game/config';
import BootScene from '@/game/scenes/BootScene';
import MenuScene from '@/game/scenes/MenuScene';
import GameScene from '@/game/scenes/GameScene';
import ShopScene from '@/game/scenes/ShopScene';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerRef.current,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [BootScene, MenuScene, GameScene, ShopScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        keyboard: true,
        mouse: true,
        touch: true,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-container"
      style={{
        width: '100%',
        maxWidth: `${GAME_WIDTH}px`,
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    />
  );
}
