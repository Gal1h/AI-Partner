import { useState, useEffect, useCallback } from 'react';
import { credentialsApi } from '../services/api';
import type { Credential } from '../types';

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await credentialsApi.listCredentials();
      setCredentials(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCredential = useCallback(async (credential: Credential) => {
    try {
      setError(null);
      const saved = await credentialsApi.saveCredential(credential);
      setCredentials(prev => {
        const idx = prev.findIndex(c => c.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
      return saved;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save credential');
      throw e;
    }
  }, []);

  const createCredential = useCallback(async (
    service: string,
    username: string,
    password: string,
    metadata: Record<string, string> = {}
  ) => {
    try {
      setError(null);
      const created = await credentialsApi.createCredential(service, username, password, metadata);
      setCredentials(prev => [...prev, created]);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create credential');
      throw e;
    }
  }, []);

  const deleteCredential = useCallback(async (id: string) => {
    try {
      await credentialsApi.deleteCredential(id);
      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete credential');
      throw e;
    }
  }, []);

  const testCredential = useCallback(async (service: string, username: string, password: string) => {
    try {
      return await credentialsApi.testCredential(service, username, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to test credential');
      return false;
    }
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  return {
    credentials,
    loading,
    error,
    loadCredentials,
    saveCredential,
    createCredential,
    deleteCredential,
    testCredential,
  };
}