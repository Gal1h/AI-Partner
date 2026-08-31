import { useScreenCapture } from '../hooks/useScreenCapture';
import { useCamera } from '../hooks/useCamera';
import { useAudio } from '../hooks/useAudio';
import { useTts } from '../hooks/useTts';
import { useCredentials } from '../hooks/useCredentials';
import { StatCard } from '../components/common/StatCard';
import { QuickAction } from '../components/common/QuickAction';
import './Dashboard.css';

export function Dashboard() {
  const { monitors, captureState: screenCapture, loading: screenLoading } = useScreenCapture();
  const { cameras, cameraState, loading: cameraLoading } = useCamera();
  const { devices: audioDevices, audioState, loading: audioLoading } = useAudio();
  const { ttsState, loading: ttsLoading } = useTts();
  const { credentials, loading: credLoading } = useCredentials();

  const stats = [
    { label: 'Monitors', value: monitors.length, icon: '🖥️', color: '#6366f1' },
    { label: 'Cameras', value: cameras.length, icon: '📷', color: '#10b981' },
    { label: 'Audio Devices', value: audioDevices.length, icon: '🎤', color: '#f59e0b' },
    { label: 'TTS Voices', value: ttsState.availableVoices.length, icon: '🔊', color: '#ec4899' },
  ];

  const quickActions = [
    { label: 'Start Screen Capture', icon: '🖥️', action: 'screen', disabled: screenLoading },
    { label: 'Open Camera', icon: '📷', action: 'camera', disabled: cameraLoading },
    { label: 'Start Recording', icon: '🎤', action: 'audio', disabled: audioLoading },
    { label: 'Test TTS', icon: '🔊', action: 'tts', disabled: ttsLoading },
    { label: 'Add Credential', icon: '🔐', action: 'credentials', disabled: credLoading },
    { label: 'Open Settings', icon: '⚙️', action: 'settings', disabled: false },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-subtitle">AI-Partner - Your AI Companion</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="status-section">
        <h3>Active Sessions</h3>
        <div className="status-grid">
          <StatusCard
            title="Screen Capture"
            status={screenCapture.isCapturing ? 'active' : 'idle'}
            details={screenCapture.isCapturing ? `Running at ${screenCapture.fps} FPS` : 'Not capturing'}
            icon="🖥️"
          />
          <StatusCard
            title="Camera"
            status={cameraState.isActive ? 'active' : 'idle'}
            details={cameraState.isActive ? `Device: ${cameraState.selectedDevice?.name || 'Unknown'}` : 'Not active'}
            icon="📷"
          />
          <StatusCard
            title="Audio Recording"
            status={audioState.isRecording ? 'active' : 'idle'}
            details={audioState.isRecording ? `Level: ${Math.round(audioState.level * 100)}%` : 'Not recording'}
            icon="🎤"
          />
          <StatusCard
            title="Text-to-Speech"
            status={ttsState.isSpeaking ? 'active' : 'idle'}
            details={ttsState.isSpeaking ? 'Speaking...' : `Voice: ${ttsState.settings.voiceId || 'Default'}`}
            icon="🔊"
          />
        </div>
      </div>

      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {quickActions.map((action, i) => (
            <QuickAction key={i} {...action} />
          ))}
        </div>
      </div>

      <div className="credentials-summary">
        <h3>Stored Credentials ({credentials.length})</h3>
        {credentials.length > 0 ? (
          <div className="credentials-list">
            {credentials.slice(0, 5).map(cred => (
              <div key={cred.id} className="credential-item">
                <span className="cred-service">{cred.service}</span>
                <span className="cred-user">{cred.username}</span>
                <span className="cred-date">{new Date(cred.updatedAt).toLocaleDateString()}</span>
              </div>
            ))}
            {credentials.length > 5 && (
              <div className="cred-more">+{credentials.length - 5} more...</div>
            )}
          </div>
        ) : (
          <p className="empty-state">No credentials stored yet. Add your first credential to get started.</p>
        )}
      </div>
    </div>
  );
}

function StatusCard({ title, status, details, icon }: { title: string; status: 'active' | 'idle'; details: string; icon: string }) {
  return (
    <div className={`status-card ${status}`}>
      <div className="status-icon">{icon}</div>
      <div className="status-info">
        <h4>{title}</h4>
        <p>{details}</p>
      </div>
      <div className={`status-badge ${status}`}>
        {status === 'active' ? '● Active' : '○ Idle'}
      </div>
    </div>
  );
}