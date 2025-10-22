import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Play, Pause, Download } from 'lucide-react';
import useAudioStore from '../store/audioStore';
import toast from 'react-hot-toast';

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: []
  });

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const { uploadAudio, isAnalyzing, realTimeData } = useAudioStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      toast.success('Recording stopped');
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleUpload = async () => {
    if (!audioBlob) {
      toast.error('No recording to upload');
      return;
    }

    const result = await uploadAudio(audioBlob, metadata);
    
    if (result.success) {
      toast.success('Recording uploaded and analyzed successfully!');
      // Reset form
      setAudioBlob(null);
      setAudioUrl(null);
      setMetadata({ title: '', description: '', tags: [] });
      setRecordingTime(0);
    } else {
      toast.error(result.error || 'Upload failed');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Voice Recording Studio</h1>
          <p className="text-xl text-purple-200">
            Record your voice and get instant AI-powered analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recording Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Recording Controls</h2>
            
            {/* Recording Status */}
            <div className="text-center mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
              }`}>
                <Mic size={48} className="text-white" />
              </div>
              
              <div className="text-3xl font-mono text-white mb-2">
                {formatTime(recordingTime)}
              </div>
              
              <p className="text-purple-200">
                {isRecording ? 'Recording...' : 'Ready to record'}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4 mb-8">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-colors flex items-center space-x-2"
                >
                  <Mic size={24} />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold transition-colors flex items-center space-x-2"
                >
                  <Square size={24} />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {/* Playback Controls */}
            {audioUrl && (
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Playback</h3>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                  className="w-full mb-4"
                />
                <div className="flex justify-center">
                  <button
                    onClick={playRecording}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Real-time Data */}
            {isRecording && (
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Real-time Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {realTimeData.pitch.toFixed(0)} Hz
                    </div>
                    <div className="text-sm text-purple-200">Pitch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {(realTimeData.volume * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-purple-200">Volume</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata and Upload */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Recording Details</h2>
            
            {/* Metadata Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter recording title..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Description
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your recording..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.tags.join(', ')}
                  onChange={(e) => setMetadata(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  placeholder="practice, scales, warmup..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Upload Button */}
            <div className="mt-8">
              <button
                onClick={handleUpload}
                disabled={!audioBlob || isAnalyzing}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Upload & Analyze</span>
                  </>
                )}
              </button>
            </div>

            {/* Recording Info */}
            {audioBlob && (
              <div className="mt-6 bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Recording Info</h3>
                <div className="text-sm text-purple-200 space-y-1">
                  <div>Duration: {formatTime(recordingTime)}</div>
                  <div>Size: {(audioBlob.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div>Format: WAV</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;

