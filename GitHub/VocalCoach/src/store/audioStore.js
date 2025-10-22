import { create } from 'zustand';

const useAudioStore = create((set, get) => ({
  // State
  recordings: [],
  currentRecording: null,
  isRecording: false,
  isAnalyzing: false,
  analysisResults: null,
  realTimeData: {
    pitch: 0,
    volume: 0,
    timestamp: 0,
  },
  error: null,

  // Actions
  startRecording: () => {
    set({ isRecording: true, error: null });
  },

  stopRecording: () => {
    set({ isRecording: false });
  },

  setCurrentRecording: (recording) => {
    set({ currentRecording: recording });
  },

  addRecording: (recording) => {
    set((state) => ({
      recordings: [recording, ...state.recordings],
    }));
  },

  updateRecording: (id, updates) => {
    set((state) => ({
      recordings: state.recordings.map((recording) =>
        recording.id === id ? { ...recording, ...updates } : recording
      ),
    }));
  },

  deleteRecording: (id) => {
    set((state) => ({
      recordings: state.recordings.filter((recording) => recording.id !== id),
    }));
  },

  setAnalysisResults: (results) => {
    set({ analysisResults: results, isAnalyzing: false });
  },

  setAnalyzing: (analyzing) => {
    set({ isAnalyzing: analyzing });
  },

  setRealTimeData: (data) => {
    set({ realTimeData: data });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // Async actions
  uploadAudio: async (audioFile, metadata = {}) => {
    set({ isAnalyzing: true, error: null });

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('title', metadata.title || audioFile.name);
      formData.append('description', metadata.description || '');
      formData.append('tags', JSON.stringify(metadata.tags || []));

      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const recording = {
          id: data.data.id,
          filename: data.data.filename,
          originalName: data.data.originalName,
          analysis: data.data.analysis,
          uploadTime: data.data.uploadTime,
          ...metadata,
        };

        get().addRecording(recording);
        get().setAnalysisResults(data.data.analysis);
        
        return { success: true, recording };
      } else {
        set({ error: data.message, isAnalyzing: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ error: 'Upload failed. Please try again.', isAnalyzing: false });
      return { success: false, error: 'Upload failed. Please try again.' };
    }
  },

  analyzeAudio: async (audioData, filename) => {
    set({ isAnalyzing: true, error: null });

    try {
      const response = await fetch('/api/audio/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${get().token}`,
        },
        body: JSON.stringify({ audioData, filename }),
      });

      const data = await response.json();

      if (data.success) {
        get().setAnalysisResults(data.data);
        return { success: true, results: data.data };
      } else {
        set({ error: data.message, isAnalyzing: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ error: 'Analysis failed. Please try again.', isAnalyzing: false });
      return { success: false, error: 'Analysis failed. Please try again.' };
    }
  },

  fetchRecordings: async () => {
    try {
      const response = await fetch('/api/audio', {
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        set({ recordings: data.data.records });
        return { success: true };
      } else {
        set({ error: data.message });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ error: 'Failed to fetch recordings' });
      return { success: false, error: 'Failed to fetch recordings' };
    }
  },

  deleteRecording: async (id) => {
    try {
      const response = await fetch(`/api/audio/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        get().deleteRecording(id);
        return { success: true };
      } else {
        set({ error: data.message });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ error: 'Failed to delete recording' });
      return { success: false, error: 'Failed to delete recording' };
    }
  },
}));

export default useAudioStore;

