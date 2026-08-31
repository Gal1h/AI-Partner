import { useState } from 'react';
import { useCredentials } from '../hooks/useCredentials';
import type { Credential } from '../types';
import './CredentialsPage.css';

export function CredentialsPage() {
  const { credentials, loading, error, saveCredential, createCredential, deleteCredential, testCredential } = useCredentials();
  const [showModal, setShowModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [formData, setFormData] = useState({
    service: '',
    username: '',
    password: '',
    metadata: {} as Record<string, string>,
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const openModal = (credential?: Credential) => {
    if (credential) {
      setEditingCredential(credential);
      setFormData({
        service: credential.service,
        username: credential.username,
        password: credential.password,
        metadata: credential.metadata,
      });
    } else {
      setEditingCredential(null);
      setFormData({ service: '', username: '', password: '', metadata: {} });
    }
    setShowModal(true);
    setTestResult(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCredential(null);
    setFormData({ service: '', username: '', password: '', metadata: {} });
    setTestResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCredential) {
        await saveCredential({ ...editingCredential, ...formData });
      } else {
        await createCredential(formData.service, formData.username, formData.password, formData.metadata);
      }
      closeModal();
    } catch (e) {
      setTestResult({ success: false, message: e instanceof Error ? e.message : 'Failed to save credential' });
    }
  };

  const handleTest = async () => {
    try {
      const success = await testCredential(formData.service, formData.username, formData.password);
      setTestResult({ success, message: success ? 'Credential test passed!' : 'Credential test failed' });
    } catch (e) {
      setTestResult({ success: false, message: e instanceof Error ? e.message : 'Test failed' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      await deleteCredential(id);
    }
  };

  return (
    <div className="credentials-page">
      <div className="page-header">
        <h2>Credentials</h2>
        <p>Securely store and manage your API keys and credentials</p>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add Credential
        </button>
      </div>

      {credentials.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔐</div>
          <h3>No credentials stored</h3>
          <p>Add your first credential to securely store API keys, passwords, and other sensitive data.</p>
          <button className="btn btn-primary" onClick={() => openModal()}>
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div className="credentials-list">
          {credentials.map(cred => (
            <div key={cred.id} className="credential-card">
              <div className="cred-header">
                <div className="cred-service">
                  <span className="service-icon">{getServiceIcon(cred.service)}</span>
                  <span className="service-name">{cred.service}</span>
                </div>
                <div className="cred-actions">
                  <button className="icon-btn" onClick={() => openModal(cred)} title="Edit">
                    ✏️
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(cred.id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
              <div className="cred-details">
                <div className="cred-field">
                  <span className="field-label">Username</span>
                  <span className="field-value">{cred.username}</span>
                </div>
                <div className="cred-field">
                  <span className="field-label">Password</span>
                  <span className="field-value password-masked">
                    {'•'.repeat(Math.min(cred.password.length, 16))}
                    <button className="toggle-visibility" title="Show/Hide">👁️</button>
                  </span>
                </div>
                {Object.keys(cred.metadata).length > 0 && (
                  <div className="cred-metadata">
                    {Object.entries(cred.metadata).map(([key, value]) => (
                      <div key={key} className="meta-item">
                        <span className="meta-key">{key}</span>
                        <span className="meta-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="cred-footer">
                <span className="cred-date">Updated: {new Date(cred.updatedAt).toLocaleDateString()}</span>
                <span className="cred-date">Created: {new Date(cred.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCredential ? 'Edit Credential' : 'Add Credential'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Service</label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={e => setFormData(prev => ({ ...prev, service: e.target.value }))}
                    placeholder="e.g., openai, anthropic, github"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username / API Key ID</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Your username or API key ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password / API Key</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Your password or API key"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Additional Metadata (JSON)</label>
                  <textarea
                    value={JSON.stringify(formData.metadata, null, 2)}
                    onChange={e => {
                      try {
                        setFormData(prev => ({ ...prev, metadata: JSON.parse(e.target.value) }));
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={4}
                    placeholder='{"key": "value"}'
                  />
                </div>

                {testResult && (
                  <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                    {testResult.message}
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleTest}>
                    Test Credential
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCredential ? 'Save Changes' : 'Add Credential'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getServiceIcon(service: string): string {
  const icons: Record<string, string> = {
    openai: '🤖',
    anthropic: '🧠',
    google: '🌐',
    azure: '☁️',
    github: '🐙',
    gitlab: '🦊',
    aws: '☁️',
    custom: '🔑',
  };
  return icons[service.toLowerCase()] || '🔑';
}