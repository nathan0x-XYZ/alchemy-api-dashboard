'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/status-indicator';

export interface APIKeyInputProps {
  onSave?: (apiKey: string) => void;
  onTest?: (apiKey: string) => Promise<boolean>;
  defaultValue?: string;
  className?: string;
}

export function APIKeyInput({
  onSave,
  onTest,
  defaultValue = '',
  className,
}: APIKeyInputProps) {
  const [apiKey, setApiKey] = useState(defaultValue);
  const [isVisible, setIsVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'none' | 'success' | 'error'>('none');
  const [error, setError] = useState('');

  const handleVisibilityToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleTest = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setIsTesting(true);
    setError('');
    setTestStatus('none');

    try {
      if (onTest) {
        const isValid = await onTest(apiKey);
        setTestStatus(isValid ? 'success' : 'error');
      }
    } catch (err) {
      setTestStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to test API key');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    onSave?.(apiKey);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type={isVisible ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setError('');
            setTestStatus('none');
          }}
          placeholder="Enter your API key"
          error={error}
          leftIcon={(
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          )}
          rightIcon={(
            <button
              type="button"
              onClick={handleVisibilityToggle}
              className="focus:outline-none"
            >
              {isVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
          className={className}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTest}
          loading={isTesting}
          disabled={!apiKey}
        >
          Test Key
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!apiKey || testStatus === 'error'}
        >
          Save Key
        </Button>
        {testStatus !== 'none' && (
          <StatusIndicator
            variant={testStatus === 'success' ? 'healthy' : 'error'}
            animate={isTesting}
          >
            {testStatus === 'success' ? 'Valid API Key' : 'Invalid API Key'}
          </StatusIndicator>
        )}
      </div>
    </div>
  );
}
