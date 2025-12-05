/**
 * Text-to-Speech Service using AWS Polly
 * Provides a clean interface for converting text to speech
 */

interface TTSConfig {
  voice?: string;
  engine?: 'standard' | 'neural';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

class TTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private isCurrentlySpeaking: boolean = false;
  private pendingRequest: AbortController | null = null;

  /**
   * Convert text to speech using AWS Polly
   * @param text - The text to convert to speech
   * @param config - Optional configuration for voice, engine, and callbacks
   */
  async speak(text: string, config?: TTSConfig): Promise<void> {
    // Cancel any pending request
    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }
    
    // Stop any currently playing audio
    this.stop();

    try {
      this.isCurrentlySpeaking = true;
      config?.onStart?.();

      // Create abort controller for this request
      this.pendingRequest = new AbortController();

      // Call our API endpoint to get audio from AWS Polly
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: config?.voice || 'Amy',
          engine: config?.engine || 'neural'
        }),
        signal: this.pendingRequest.signal
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      // Get the audio blob from the response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play the audio
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        this.isCurrentlySpeaking = false;
        URL.revokeObjectURL(audioUrl); // Clean up the blob URL
        config?.onEnd?.();
      };

      this.currentAudio.onerror = (event) => {
        this.isCurrentlySpeaking = false;
        URL.revokeObjectURL(audioUrl);
        const error = new Error('Audio playback error');
        config?.onError?.(error);
      };

      await this.currentAudio.play();
      this.pendingRequest = null; // Clear pending request after successful playback
    } catch (error) {
      this.isCurrentlySpeaking = false;
      this.pendingRequest = null;
      
      // Don't throw error if request was aborted (intentional cancellation)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('TTS request was cancelled');
        return;
      }
      
      const err = error instanceof Error ? error : new Error('Unknown error');
      config?.onError?.(err);
      throw err;
    }
  }

  /**
   * Stop any currently playing speech
   */
  stop(): void {
    // Cancel any pending request
    if (this.pendingRequest) {
      this.pendingRequest.abort();
      this.pendingRequest = null;
    }
    
    // Stop any playing audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isCurrentlySpeaking = false;
  }

  /**
   * Check if TTS is currently speaking
   */
  isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  /**
   * Pause the current speech
   */
  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }
}

// Export a singleton instance
export const ttsService = new TTSService();

// Also export the class for testing or custom instances
export default TTSService;

