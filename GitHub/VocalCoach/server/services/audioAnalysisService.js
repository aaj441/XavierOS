const Pitchfinder = require('pitchfinder');
const fs = require('fs');
const path = require('path');
const { fft } = require('fft-js');
const logger = require('./logger');

class AudioAnalysisService {
  constructor() {
    // Initialize pitch detection algorithms
    this.detectPitchYIN = Pitchfinder.YIN();
    this.detectPitchAMDF = Pitchfinder.AMDF();
    this.detectPitchACF2 = Pitchfinder.ACF2();
    this.detectPitchDynamicWavelet = Pitchfinder.DynamicWavelet();
    
    // Audio analysis configuration
    this.config = {
      sampleRate: 44100,
      bufferSize: 4096,
      hopSize: 1024,
      minFrequency: 80,
      maxFrequency: 4000,
    };
  }

  /**
   * Analyze audio file for pitch, rhythm, and vocal characteristics
   * @param {Buffer} audioBuffer - Raw audio data
   * @param {string} filename - Original filename
   * @returns {Object} Analysis results
   */
  async analyzeAudio(audioBuffer, filename) {
    try {
      logger.info(`Starting audio analysis for ${filename}`);
      
      // Convert buffer to audio data
      const audioData = await this.processAudioBuffer(audioBuffer);
      
      // Perform various analyses
      const pitchAnalysis = await this.analyzePitch(audioData);
      const rhythmAnalysis = await this.analyzeRhythm(audioData);
      const vocalAnalysis = await this.analyzeVocalCharacteristics(audioData);
      const frequencyAnalysis = await this.analyzeFrequencySpectrum(audioData);
      
      const results = {
        filename,
        timestamp: new Date().toISOString(),
        duration: audioData.duration,
        sampleRate: audioData.sampleRate,
        pitch: pitchAnalysis,
        rhythm: rhythmAnalysis,
        vocal: vocalAnalysis,
        frequency: frequencyAnalysis,
        overallScore: this.calculateOverallScore(pitchAnalysis, rhythmAnalysis, vocalAnalysis),
        recommendations: this.generateRecommendations(pitchAnalysis, rhythmAnalysis, vocalAnalysis),
      };

      logger.info(`Audio analysis completed for ${filename}`);
      return results;

    } catch (error) {
      logger.error('Audio analysis failed:', error);
      throw new Error(`Audio analysis failed: ${error.message}`);
    }
  }

  /**
   * Process raw audio buffer into usable format
   * @param {Buffer} buffer - Raw audio data
   * @returns {Object} Processed audio data
   */
  async processAudioBuffer(buffer) {
    // This is a simplified version - in production, you'd use a proper audio library
    // like node-wav or fluent-ffmpeg for more complex audio formats
    
    const sampleRate = this.config.sampleRate;
    const samples = new Float32Array(buffer.length / 2);
    
    // Convert buffer to float32 samples (assuming 16-bit PCM)
    for (let i = 0; i < samples.length; i++) {
      samples[i] = buffer.readInt16LE(i * 2) / 32768.0;
    }
    
    return {
      samples,
      sampleRate,
      duration: samples.length / sampleRate,
      channels: 1,
    };
  }

  /**
   * Analyze pitch characteristics
   * @param {Object} audioData - Processed audio data
   * @returns {Object} Pitch analysis results
   */
  async analyzePitch(audioData) {
    const { samples, sampleRate } = audioData;
    const pitches = [];
    const hopSize = this.config.hopSize;
    
    // Extract pitch frames
    for (let i = 0; i < samples.length - hopSize; i += hopSize) {
      const frame = samples.slice(i, i + hopSize);
      const pitch = this.detectPitchYIN(frame, sampleRate);
      
      if (pitch && pitch > this.config.minFrequency && pitch < this.config.maxFrequency) {
        pitches.push(pitch);
      }
    }
    
    // Calculate pitch statistics
    const validPitches = pitches.filter(p => p > 0);
    const averagePitch = validPitches.length > 0 
      ? validPitches.reduce((a, b) => a + b, 0) / validPitches.length 
      : 0;
    
    const pitchVariance = validPitches.length > 0
      ? validPitches.reduce((sum, pitch) => sum + Math.pow(pitch - averagePitch, 2), 0) / validPitches.length
      : 0;
    
    const pitchStability = Math.sqrt(pitchVariance) / averagePitch;
    
    return {
      averagePitch,
      pitchVariance,
      pitchStability,
      pitchRange: validPitches.length > 0 ? {
        min: Math.min(...validPitches),
        max: Math.max(...validPitches),
      } : { min: 0, max: 0 },
      pitchConsistency: 1 - pitchStability, // Higher is better
      totalPitchFrames: validPitches.length,
    };
  }

  /**
   * Analyze rhythm and timing
   * @param {Object} audioData - Processed audio data
   * @returns {Object} Rhythm analysis results
   */
  async analyzeRhythm(audioData) {
    const { samples, sampleRate } = audioData;
    
    // Simple onset detection using energy
    const onsets = [];
    const windowSize = 1024;
    const hopSize = 512;
    const threshold = 0.1;
    
    let previousEnergy = 0;
    
    for (let i = 0; i < samples.length - windowSize; i += hopSize) {
      const frame = samples.slice(i, i + windowSize);
      const energy = frame.reduce((sum, sample) => sum + sample * sample, 0) / windowSize;
      
      if (energy > threshold && energy > previousEnergy * 1.5) {
        onsets.push(i / sampleRate);
      }
      
      previousEnergy = energy;
    }
    
    // Calculate rhythm metrics
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }
    
    const averageInterval = intervals.length > 0 
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
      : 0;
    
    const tempo = averageInterval > 0 ? 60 / averageInterval : 0;
    
    return {
      tempo,
      averageInterval,
      onsetCount: onsets.length,
      rhythmConsistency: this.calculateRhythmConsistency(intervals),
      onsets,
    };
  }

  /**
   * Analyze vocal characteristics
   * @param {Object} audioData - Processed audio data
   * @returns {Object} Vocal analysis results
   */
  async analyzeVocalCharacteristics(audioData) {
    const { samples, sampleRate } = audioData;
    
    // Calculate RMS (Root Mean Square) for volume analysis
    const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
    
    // Calculate zero crossing rate for voice activity detection
    let zeroCrossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / samples.length;
    
    // Analyze spectral centroid (brightness)
    const spectralCentroid = await this.calculateSpectralCentroid(samples, sampleRate);
    
    return {
      volume: rms,
      zeroCrossingRate: zcr,
      spectralCentroid,
      voiceActivity: zcr > 0.01 && zcr < 0.3, // Typical voice range
      brightness: spectralCentroid,
    };
  }

  /**
   * Analyze frequency spectrum
   * @param {Object} audioData - Processed audio data
   * @returns {Object} Frequency analysis results
   */
  async analyzeFrequencySpectrum(audioData) {
    const { samples, sampleRate } = audioData;
    
    // Use FFT to analyze frequency content
    const windowSize = 2048;
    const hopSize = 1024;
    const spectrums = [];
    
    for (let i = 0; i < samples.length - windowSize; i += hopSize) {
      const frame = samples.slice(i, i + windowSize);
      const spectrum = fft(frame);
      spectrums.push(spectrum);
    }
    
    // Calculate average spectrum
    const averageSpectrum = new Array(windowSize / 2).fill(0);
    spectrums.forEach(spectrum => {
      for (let i = 0; i < averageSpectrum.length; i++) {
        averageSpectrum[i] += Math.sqrt(spectrum[i].real * spectrum[i].real + spectrum[i].imag * spectrum[i].imag);
      }
    });
    
    // Normalize
    for (let i = 0; i < averageSpectrum.length; i++) {
      averageSpectrum[i] /= spectrums.length;
    }
    
    // Find dominant frequencies
    const dominantFrequencies = this.findDominantFrequencies(averageSpectrum, sampleRate);
    
    return {
      spectrum: averageSpectrum,
      dominantFrequencies,
      spectralRolloff: this.calculateSpectralRolloff(averageSpectrum),
      spectralFlux: this.calculateSpectralFlux(spectrums),
    };
  }

  /**
   * Calculate spectral centroid
   * @param {Float32Array} samples - Audio samples
   * @param {number} sampleRate - Sample rate
   * @returns {number} Spectral centroid
   */
  async calculateSpectralCentroid(samples, sampleRate) {
    const spectrum = fft(samples.slice(0, 2048));
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length / 2; i++) {
      const magnitude = Math.sqrt(spectrum[i].real * spectrum[i].real + spectrum[i].imag * spectrum[i].imag);
      const frequency = (i * sampleRate) / spectrum.length;
      
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Find dominant frequencies in spectrum
   * @param {Array} spectrum - Frequency spectrum
   * @param {number} sampleRate - Sample rate
   * @returns {Array} Dominant frequencies
   */
  findDominantFrequencies(spectrum, sampleRate) {
    const peaks = [];
    const threshold = Math.max(...spectrum) * 0.1;
    
    for (let i = 1; i < spectrum.length - 1; i++) {
      if (spectrum[i] > threshold && 
          spectrum[i] > spectrum[i - 1] && 
          spectrum[i] > spectrum[i + 1]) {
        const frequency = (i * sampleRate) / (spectrum.length * 2);
        peaks.push({ frequency, magnitude: spectrum[i] });
      }
    }
    
    return peaks.sort((a, b) => b.magnitude - a.magnitude).slice(0, 10);
  }

  /**
   * Calculate spectral rolloff
   * @param {Array} spectrum - Frequency spectrum
   * @returns {number} Spectral rolloff frequency
   */
  calculateSpectralRolloff(spectrum) {
    const totalEnergy = spectrum.reduce((sum, mag) => sum + mag, 0);
    const rolloffThreshold = totalEnergy * 0.85;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < spectrum.length; i++) {
      cumulativeEnergy += spectrum[i];
      if (cumulativeEnergy >= rolloffThreshold) {
        return i;
      }
    }
    return spectrum.length - 1;
  }

  /**
   * Calculate spectral flux
   * @param {Array} spectrums - Array of frequency spectrums
   * @returns {number} Spectral flux
   */
  calculateSpectralFlux(spectrums) {
    let totalFlux = 0;
    
    for (let i = 1; i < spectrums.length; i++) {
      let flux = 0;
      for (let j = 0; j < spectrums[i].length / 2; j++) {
        const prevMag = Math.sqrt(spectrums[i - 1][j].real * spectrums[i - 1][j].real + 
                                 spectrums[i - 1][j].imag * spectrums[i - 1][j].imag);
        const currMag = Math.sqrt(spectrums[i][j].real * spectrums[i][j].real + 
                                 spectrums[i][j].imag * spectrums[i][j].imag);
        
        flux += Math.max(0, currMag - prevMag);
      }
      totalFlux += flux;
    }
    
    return totalFlux / (spectrums.length - 1);
  }

  /**
   * Calculate rhythm consistency
   * @param {Array} intervals - Time intervals between onsets
   * @returns {number} Rhythm consistency score
   */
  calculateRhythmConsistency(intervals) {
    if (intervals.length < 2) return 0;
    
    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    return averageInterval > 0 ? 1 - (standardDeviation / averageInterval) : 0;
  }

  /**
   * Calculate overall performance score
   * @param {Object} pitchAnalysis - Pitch analysis results
   * @param {Object} rhythmAnalysis - Rhythm analysis results
   * @param {Object} vocalAnalysis - Vocal analysis results
   * @returns {number} Overall score (0-100)
   */
  calculateOverallScore(pitchAnalysis, rhythmAnalysis, vocalAnalysis) {
    const pitchScore = Math.min(100, pitchAnalysis.pitchConsistency * 100);
    const rhythmScore = Math.min(100, rhythmAnalysis.rhythmConsistency * 100);
    const vocalScore = vocalAnalysis.voiceActivity ? 80 : 40; // Basic voice activity check
    
    return Math.round((pitchScore * 0.4 + rhythmScore * 0.3 + vocalScore * 0.3));
  }

  /**
   * Generate coaching recommendations
   * @param {Object} pitchAnalysis - Pitch analysis results
   * @param {Object} rhythmAnalysis - Rhythm analysis results
   * @param {Object} vocalAnalysis - Vocal analysis results
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(pitchAnalysis, rhythmAnalysis, vocalAnalysis) {
    const recommendations = [];
    
    // Pitch recommendations
    if (pitchAnalysis.pitchConsistency < 0.7) {
      recommendations.push({
        category: 'Pitch',
        priority: 'High',
        message: 'Work on pitch stability. Practice sustained notes with a metronome.',
        exercises: ['Long tone exercises', 'Pitch matching drills', 'Scale practice']
      });
    }
    
    if (pitchAnalysis.pitchVariance > 100) {
      recommendations.push({
        category: 'Pitch',
        priority: 'Medium',
        message: 'Reduce pitch variation. Focus on maintaining consistent pitch.',
        exercises: ['Pitch slides', 'Interval training', 'Vocal sirens']
      });
    }
    
    // Rhythm recommendations
    if (rhythmAnalysis.rhythmConsistency < 0.6) {
      recommendations.push({
        category: 'Rhythm',
        priority: 'High',
        message: 'Improve rhythmic accuracy. Practice with a metronome.',
        exercises: ['Rhythm clapping', 'Metronome practice', 'Subdivision exercises']
      });
    }
    
    // Vocal quality recommendations
    if (vocalAnalysis.volume < 0.1) {
      recommendations.push({
        category: 'Volume',
        priority: 'Medium',
        message: 'Increase vocal projection. Practice breathing exercises.',
        exercises: ['Breathing exercises', 'Volume control drills', 'Projection practice']
      });
    }
    
    if (vocalAnalysis.zeroCrossingRate > 0.3) {
      recommendations.push({
        category: 'Voice Quality',
        priority: 'Medium',
        message: 'Reduce breathiness. Focus on vocal cord closure.',
        exercises: ['Vocal cord strengthening', 'Breath control', 'Tone quality exercises']
      });
    }
    
    return recommendations;
  }
}

module.exports = AudioAnalysisService;

