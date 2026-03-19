import { supabase } from '@/lib/supabase';
import GameStateManager, { GameState } from './GameStateManager';

class SaveManager {
  private static instance: SaveManager;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private gameState: GameStateManager;
  private isSaving = false;

  private constructor() {
    this.gameState = GameStateManager.getInstance();
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  async loadGame(): Promise<boolean> {
    const state = this.gameState.getState();

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('game_saves')
        .select('*')
        .eq('session_id', state.sessionId)
        .single();

      if (data && !error) {
        this.gameState.fromJSON({
          playerName: data.player_name,
          avatarId: data.avatar_id,
          coins: data.coins,
          level: data.level,
          totalTasksCompleted: data.total_tasks_completed,
          totalCoinsEarned: data.total_coins_earned,
          playTimeSeconds: data.play_time_seconds,
          furnitureInventory: data.furniture_inventory || [],
          furniturePlaced: data.furniture_placed || [],
          achievements: data.achievements || [],
        });
        console.log('Game loaded from Supabase');
        return true;
      }
    } catch (e) {
      console.log('Supabase load failed, trying localStorage');
    }

    // Fallback to localStorage
    try {
      const saved = localStorage.getItem('pixel_office_save');
      if (saved) {
        const data = JSON.parse(saved);
        this.gameState.fromJSON(data);
        console.log('Game loaded from localStorage');
        return true;
      }
    } catch (e) {
      console.log('localStorage load failed');
    }

    return false;
  }

  async saveGame(): Promise<boolean> {
    if (this.isSaving) return false;
    this.isSaving = true;

    const state = this.gameState.getState();

    // Always save to localStorage as backup
    try {
      localStorage.setItem('pixel_office_save', JSON.stringify(state));
    } catch (e) {
      console.warn('localStorage save failed');
    }

    // Try Supabase
    try {
      const { error } = await supabase
        .from('game_saves')
        .upsert({
          session_id: state.sessionId,
          player_name: state.playerName,
          avatar_id: state.avatarId,
          coins: state.coins,
          level: state.level,
          office_data: {},
          furniture_placed: state.furniturePlaced,
          furniture_inventory: state.furnitureInventory,
          achievements: state.achievements,
          total_tasks_completed: state.totalTasksCompleted,
          total_coins_earned: state.totalCoinsEarned,
          play_time_seconds: state.playTimeSeconds,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' });

      if (error) {
        console.warn('Supabase save error:', error.message);
      } else {
        console.log('Game saved to Supabase');
      }
    } catch (e) {
      console.warn('Supabase save failed, localStorage backup active');
    }

    this.isSaving = false;
    return true;
  }

  startAutoSave(intervalMs: number = 30000): void {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => {
      this.saveGame();
    }, intervalMs);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}

export default SaveManager;
