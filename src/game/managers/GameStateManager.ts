import { LEVEL_THRESHOLDS, FurnitureItem, FURNITURE_CATALOG } from '../config';

export interface PlacedFurniture {
  id: string;
  furnitureId: string;
  x: number;
  y: number;
}

export interface GameState {
  sessionId: string;
  playerName: string;
  avatarId: number;
  coins: number;
  level: number;
  totalTasksCompleted: number;
  totalCoinsEarned: number;
  playTimeSeconds: number;
  furnitureInventory: string[]; // furniture IDs owned
  furniturePlaced: PlacedFurniture[];
  achievements: string[];
}

class GameStateManager {
  private static instance: GameStateManager;
  private state: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  private constructor() {
    this.state = this.getDefaultState();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  private getDefaultState(): GameState {
    let sessionId = '';
    if (typeof window !== 'undefined') {
      sessionId = localStorage.getItem('pixel_office_session_id') || '';
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('pixel_office_session_id', sessionId);
      }
    }
    return {
      sessionId,
      playerName: 'Player',
      avatarId: 0,
      coins: 0,
      level: 1,
      totalTasksCompleted: 0,
      totalCoinsEarned: 0,
      playTimeSeconds: 0,
      furnitureInventory: [],
      furniturePlaced: [],
      achievements: [],
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  setState(partial: Partial<GameState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  addCoins(amount: number): void {
    this.state.coins += amount;
    this.state.totalCoinsEarned += amount;
    this.checkLevelUp();
    this.notifyListeners();
  }

  spendCoins(amount: number): boolean {
    if (this.state.coins < amount) return false;
    this.state.coins -= amount;
    this.notifyListeners();
    return true;
  }

  completeTask(): void {
    this.state.totalTasksCompleted++;
    this.checkAchievements();
    this.notifyListeners();
  }

  buyFurniture(furnitureId: string): boolean {
    const item = FURNITURE_CATALOG.find(f => f.id === furnitureId);
    if (!item) return false;
    if (this.state.coins < item.price) return false;
    if (this.state.level < item.unlockLevel) return false;

    this.state.coins -= item.price;
    this.state.furnitureInventory.push(furnitureId);
    this.notifyListeners();
    return true;
  }

  placeFurniture(furnitureId: string, x: number, y: number): PlacedFurniture | null {
    const invIndex = this.state.furnitureInventory.indexOf(furnitureId);
    if (invIndex === -1) return null;

    const placed: PlacedFurniture = {
      id: 'placed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      furnitureId,
      x,
      y,
    };

    this.state.furnitureInventory.splice(invIndex, 1);
    this.state.furniturePlaced.push(placed);
    this.notifyListeners();
    return placed;
  }

  removeFurniture(placedId: string): boolean {
    const idx = this.state.furniturePlaced.findIndex(f => f.id === placedId);
    if (idx === -1) return false;

    const item = this.state.furniturePlaced[idx];
    this.state.furniturePlaced.splice(idx, 1);
    this.state.furnitureInventory.push(item.furnitureId);
    this.notifyListeners();
    return true;
  }

  private checkLevelUp(): void {
    const earned = this.state.totalCoinsEarned;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (earned >= LEVEL_THRESHOLDS[i]) {
        if (this.state.level < i + 1) {
          this.state.level = i + 1;
        }
        break;
      }
    }
  }

  private checkAchievements(): void {
    const achs = this.state.achievements;
    if (this.state.totalTasksCompleted >= 1 && !achs.includes('first_task')) {
      achs.push('first_task');
    }
    if (this.state.totalTasksCompleted >= 10 && !achs.includes('task_master')) {
      achs.push('task_master');
    }
    if (this.state.totalTasksCompleted >= 50 && !achs.includes('workaholic')) {
      achs.push('workaholic');
    }
    if (this.state.furniturePlaced.length >= 5 && !achs.includes('decorator')) {
      achs.push('decorator');
    }
    if (this.state.totalCoinsEarned >= 500 && !achs.includes('rich')) {
      achs.push('rich');
    }
  }

  addPlayTime(seconds: number): void {
    this.state.playTimeSeconds += seconds;
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l(this.getState()));
  }

  // Serialization for save/load
  toJSON(): object {
    return { ...this.state };
  }

  fromJSON(data: Partial<GameState>): void {
    this.state = { ...this.getDefaultState(), ...data, sessionId: this.state.sessionId };
    this.notifyListeners();
  }
}

export default GameStateManager;
