'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Key, Link as LinkIcon, Check, X, Save, Eye, EyeOff, RefreshCw, AlertCircle, ExternalLink, MessageSquare, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdAccount {
  id: string;
  tenant_id: string;
  platform: string;
  account_id: string;
  account_name: string;
  status: string;
  last_synced_at: string | null;
  metadata: Record<string, string>;
}

interface SyncResult {
  platform: string;
  status: string;
  campaigns?: number;
  metrics?: number;
  message?: string;
}

function formatSyncSummary(results: SyncResult[]) {
  const totalCampaigns = results.reduce((sum, r) => sum + (r.campaigns || 0), 0);
  const totalMetrics = results.reduce((sum, r) => sum + (r.metrics || 0), 0);
  const failed = results.filter((r) => r.status === 'error');

  if (failed.length === 0) {
    return {
      success: `Synced ${totalCampaigns} campaigns and ${totalMetrics} metric records.`,
      error: null as string | null,
    };
  }

  const details = failed
    .map((r) => `${r.platform.replace('_ads', ' Ads')}: ${r.message || 'Unknown error'}`)
    .join(' | ');

  return {
    success: `Partial sync: ${totalCampaigns} campaigns and ${totalMetrics} metrics synced.`,
    error: details,
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ad-platforms');
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [syncing, setSyncing] = useState(false);
  
  // API Keys state
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  
  // Default model
  const [defaultModel, setDefaultModel] = useState('anthropic/claude-sonnet-4-5');
  
  // Demo mode
  const [demoMode, setDemoMode] = useState(false);
  
  // Custom AI instructions
  const [customInstructions, setCustomInstructions] = useState('');
  const [loadingInstructions, setLoadingInstructions] = useState(false);

  // Google Ads state
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleDeveloperToken, setGoogleDeveloperToken] = useState('');
  const [googleCustomerId, setGoogleCustomerId] = useState('');

  // Meta Ads state
  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');

  // LinkedIn Ads state
  const [linkedinClientId, setLinkedinClientId] = useState('');
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('');

  const supabase = useMemo(() => createClient(), []);

  // Load custom instructions from database
  const loadCustomInstructions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('custom_ai_instructions')
        .eq('id', user.id)
        .single();

      if (!error && profile?.custom_ai_instructions) {
        setCustomInstructions(profile.custom_ai_instructions);
      }
    } catch (err) {
      console.error('Error loading custom instructions:', err);
    }
  }, [supabase]);

  // Save custom instructions to database
  const saveCustomInstructions = async () => {
    setLoadingInstructions(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ custom_ai_instructions: customInstructions })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Custom AI instructions saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save custom instructions');
    } finally {
      setLoadingInstructions(false);
    }
  };

  // Load connected ad accounts from database
  const loadAdAccounts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) return;

      const { data, error: loadError } = await supabase
        .from('ad_accounts')
        .select('id, tenant_id, platform, account_id, account_name, status, last_synced_at, metadata')
        .eq('tenant_id', profile.tenant_id)
        .order('platform');

      if (loadError) {
        console.error('Error loading ad accounts:', loadError);
        return;
      }

      if (data) {
        setAdAccounts(data as AdAccount[]);

        // Load saved credentials from accounts
        const metaAccount = data.find((acc) => acc.platform === 'meta_ads');
        if (metaAccount?.metadata?.app_id) {
          setMetaAppId(metaAccount.metadata.app_id);
        }
        if (metaAccount?.metadata?.app_secret) {
          setMetaAppSecret(metaAccount.metadata.app_secret);
        }

        const linkedinAccount = data.find((acc) => acc.platform === 'linkedin_ads');
        if (linkedinAccount?.metadata?.client_id) {
          setLinkedinClientId(linkedinAccount.metadata.client_id);
        }
        if (linkedinAccount?.metadata?.client_secret) {
          setLinkedinClientSecret(linkedinAccount.metadata.client_secret);
        }

        const googleAccount = data.find((acc) => acc.platform === 'google_ads');
        if (googleAccount?.metadata?.client_id) {
          setGoogleClientId(googleAccount.metadata.client_id);
        }
        if (googleAccount?.metadata?.client_secret) {
          setGoogleClientSecret(googleAccount.metadata.client_secret);
        }
        if (googleAccount?.metadata?.developer_token) {
          setGoogleDeveloperToken(googleAccount.metadata.developer_token);
        }
        if (googleAccount?.account_id) {
          setGoogleCustomerId(googleAccount.account_id);
        }
      }
    } catch (err) {
      console.error('Error loading ad accounts:', err);
    }
  }, [supabase]);

  useEffect(() => {
    loadAdAccounts();
    loadCustomInstructions();

    // Check for OAuth success/error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const successMessage = urlParams.get('success');
    const errorMessage = urlParams.get('error');
    
    if (successMessage) {
      setSuccess(successMessage);
      // Reload accounts to show updated status
      loadAdAccounts();
      
      // If sync message in success, trigger sync after a delay
      if (successMessage.includes('Syncing')) {
        setTimeout(async () => {
          setLoading(true);
          try {
            const response = await fetch('/api/sync-data', { method: 'POST' });
            const data = await response.json();
            if (!response.ok) {
              setError(`Sync completed but encountered issues: ${data.error || 'Unknown error'}`);
            } else {
              const summary = formatSyncSummary((data.results || []) as SyncResult[]);
              setSuccess(`Connection successful! ${summary.success}`);
              if (summary.error) {
                setError(summary.error);
              }
              await loadAdAccounts();
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(`Auto-sync failed: ${errorMessage}. Please try manual sync.`);
          } finally {
            setLoading(false);
          }
        }, 2000);
      }
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    if (errorMessage) {
      setError(errorMessage);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadAdAccounts, loadCustomInstructions]);

  const handleSyncData = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/sync-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync data');
      }

      const summary = formatSyncSummary((data.results || []) as SyncResult[]);
      setSuccess(summary.success);
      if (summary.error) {
        setError(summary.error);
      }
      await loadAdAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGoogleAds = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      if (!googleClientId || !googleClientSecret || !googleDeveloperToken || !googleCustomerId) {
        throw new Error('Please fill in all required Google Ads credentials');
      }

      const normalizedGoogleCustomerId = googleCustomerId.replace(/\D/g, '');
      if (!normalizedGoogleCustomerId) {
        throw new Error('Google Customer ID is invalid. Use digits only (dashes are okay; we will clean them).');
      }

      // Save credentials first (without tokens - they'll be added via OAuth)
      const { error: upsertError } = await supabase.from('ad_accounts').upsert({
        tenant_id: profile?.tenant_id,
        platform: 'google_ads',
        account_id: normalizedGoogleCustomerId,
        account_name: 'Google Ads Account',
        status: 'pending',
        metadata: {
          client_id: googleClientId,
          client_secret: googleClientSecret,
          developer_token: googleDeveloperToken,
        },
      }, {
        onConflict: 'tenant_id,platform'
      });

      if (upsertError) throw upsertError;

      // Redirect to OAuth flow
      window.location.href = '/auth/google';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleConnectMetaAds = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      if (!metaAppId || !metaAppSecret) {
        throw new Error('Please fill in all required Meta Ads credentials (App ID and App Secret)');
      }

      // Save app credentials first (account_id and tokens will be set via OAuth)
      const { error: upsertError } = await supabase.from('ad_accounts').upsert({
        tenant_id: profile?.tenant_id,
        platform: 'meta_ads',
        account_id: 'pending',
        account_name: 'Meta Ads Account',
        status: 'pending',
        metadata: {
          app_id: metaAppId,
          app_secret: metaAppSecret,
        },
      }, {
        onConflict: 'tenant_id,platform'
      });

      if (upsertError) throw upsertError;

      await loadAdAccounts();

      // Redirect to OAuth flow
      window.location.href = '/auth/meta';
    } catch (err: any) {
      setError(err.message || 'Failed to connect Meta Ads. Please try again.');
      setLoading(false);
    }
  };

  const handleConnectLinkedInAds = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      if (!linkedinClientId || !linkedinClientSecret) {
        throw new Error('Please fill in all required LinkedIn Ads credentials');
      }

      // Save credentials first
      const { error: upsertError } = await supabase.from('ad_accounts').upsert({
        tenant_id: profile?.tenant_id,
        platform: 'linkedin_ads',
        account_id: 'pending',
        account_name: 'LinkedIn Ads Account',
        status: 'pending',
        metadata: {
          client_id: linkedinClientId,
          client_secret: linkedinClientSecret,
        },
      }, {
        onConflict: 'tenant_id,platform'
      });

      if (upsertError) throw upsertError;

      await loadAdAccounts();

      // Redirect to OAuth flow
      window.location.href = '/auth/linkedin';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAPIKeys = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      localStorage.setItem('openai_key', openaiKey);
      localStorage.setItem('anthropic_key', anthropicKey);
      localStorage.setItem('google_key', googleKey);
      localStorage.setItem('default_model', defaultModel);
      localStorage.setItem('demo_mode', String(demoMode));
      
      setSuccess('Settings saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformDisplayName = (platform: string) => {
    return platform.replace('_ads', ' Ads').replace(/^\w/, c => c.toUpperCase());
  };

  const getAccountStatus = (platform: string) => {
    const account = adAccounts.find(a => a.platform === platform);
    return account;
  };

  const tabs = [
    { id: 'ad-platforms', label: 'Ad Platforms' },
    { id: 'ai-models', label: 'AI Models' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your ad platform connections and AI models</p>
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ad Platforms Tab */}
      {activeTab === 'ad-platforms' && (
        <div className="space-y-6">
          {/* Connected Accounts Summary */}
          {adAccounts.filter(a => a.status === 'active').length > 0 && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Connected Platforms</h3>
                </div>
                <button
                  onClick={handleSyncData}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync All Data'}
                </button>
              </div>

              <div className="space-y-3">
                {adAccounts.filter(a => a.status === 'active').map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/20">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{getPlatformDisplayName(account.platform)}</p>
                        <p className="text-sm text-gray-400">{account.account_name}</p>
                        {account.last_synced_at && (
                          <p className="text-xs text-gray-500">
                            Last synced: {new Date(account.last_synced_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                      Connected
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Ads Card */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/20">
                  <span className="text-lg font-bold text-blue-400">G</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Google Ads</h3>
                  <p className="text-sm text-gray-400">Connect your Google Ads account</p>
                </div>
              </div>
              {getAccountStatus('google_ads')?.status === 'active' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  Connected
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client ID</label>
                  <input
                    type="text"
                    placeholder="Enter Client ID"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Secret</label>
                  <input
                    type="password"
                    placeholder="Enter Client Secret"
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Developer Token</label>
                  <input
                    type="password"
                    placeholder="Enter Developer Token"
                    value={googleDeveloperToken}
                    onChange={(e) => setGoogleDeveloperToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Customer ID</label>
                  <input
                    type="text"
                    placeholder="e.g., 123-456-7890"
                    value={googleCustomerId}
                    onChange={(e) => setGoogleCustomerId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleConnectGoogleAds}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                {getAccountStatus('google_ads')?.status === 'active' ? 'Reconnect' : 'Connect Google Ads'}
              </button>
            </div>
          </div>

          {/* Meta Ads Card */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600/20">
                  <span className="text-lg font-bold text-blue-400">f</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Meta Ads</h3>
                  <p className="text-sm text-gray-400">Connect your Meta (Facebook) Ads account</p>
                </div>
              </div>
              {getAccountStatus('meta_ads')?.status === 'active' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  Connected
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">App ID</label>
                  <input
                    type="text"
                    placeholder="Enter App ID"
                    value={metaAppId}
                    onChange={(e) => setMetaAppId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">App Secret</label>
                  <input
                    type="password"
                    placeholder="Enter App Secret"
                    value={metaAppSecret}
                    onChange={(e) => setMetaAppSecret(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleConnectMetaAds}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                {getAccountStatus('meta_ads')?.status === 'active' ? 'Reconnect' : 'Connect Meta Ads'}
              </button>
            </div>
          </div>

          {/* LinkedIn Ads Card */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-700/20">
                  <span className="text-lg font-bold text-blue-400">in</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">LinkedIn Ads</h3>
                  <p className="text-sm text-gray-400">Connect your LinkedIn Ads account</p>
                </div>
              </div>
              {getAccountStatus('linkedin_ads')?.status === 'active' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  Connected
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client ID</label>
                  <input
                    type="text"
                    placeholder="Enter Client ID"
                    value={linkedinClientId}
                    onChange={(e) => setLinkedinClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Secret</label>
                  <input
                    type="password"
                    placeholder="Enter Client Secret"
                    value={linkedinClientSecret}
                    onChange={(e) => setLinkedinClientSecret(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleConnectLinkedInAds}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                {getAccountStatus('linkedin_ads')?.status === 'active' ? 'Reconnect' : 'Connect LinkedIn Ads'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Models Tab */}
      {activeTab === 'ai-models' && (
        <div className="space-y-6">
          {/* API Keys Card */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold">API Keys</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Configure your AI API keys for model access. Keys are stored securely in your browser.
            </p>

            <div className="space-y-4">
              {/* OpenAI Key */}
              <div>
                <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                <div className="relative">
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    placeholder="sk-proj-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('openai')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKeys.openai ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Anthropic Key */}
              <div>
                <label className="block text-sm font-medium mb-2">Anthropic API Key</label>
                <div className="relative">
                  <input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    placeholder="sk-ant-api03-..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('anthropic')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKeys.anthropic ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Google Key */}
              <div>
                <label className="block text-sm font-medium mb-2">Google AI Studio API Key</label>
                <div className="relative">
                  <input
                    type={showKeys.google ? 'text' : 'password'}
                    placeholder="AIza..."
                    value={googleKey}
                    onChange={(e) => setGoogleKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('google')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKeys.google ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Default Model Card */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Default AI Model</h3>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none"
            >
              <optgroup label="OpenAI GPT-5">
                <option value="openai/gpt-5">GPT-5 (Flagship)</option>
                <option value="openai/gpt-5-mini">GPT-5 Mini</option>
              </optgroup>
              <optgroup label="Anthropic Claude 4.5">
                <option value="anthropic/claude-sonnet-4-5">Claude Sonnet 4.5 (Recommended)</option>
                <option value="anthropic/claude-opus-4-5">Claude Opus 4.5</option>
                <option value="anthropic/claude-haiku-4-5">Claude Haiku 4.5</option>
              </optgroup>
              <optgroup label="Google Gemini 3">
                <option value="google/gemini-3">Gemini 3</option>
                <option value="google/gemini-3-flash">Gemini 3 Flash</option>
              </optgroup>
            </select>
          </div>

          {/* Custom AI Instructions Card */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold">Custom AI Instructions</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Add custom instructions for the AI chatbot. These will be included in every conversation
              to personalize the AI's behavior, tone, or focus areas.
            </p>
            
            <div className="space-y-4">
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Example: Always prioritize ROAS when making recommendations. Focus on e-commerce clients. Prefer actionable, data-driven insights. Be concise."
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none resize-none"
              />
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {customInstructions.length}/2000 characters
                </p>
                <button
                  onClick={saveCustomInstructions}
                  disabled={loadingInstructions || customInstructions.length > 2000}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loadingInstructions ? 'Saving...' : 'Save Instructions'}
                </button>
              </div>
              
              {/* Example prompts */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-medium text-gray-300 mb-2">Example Instructions:</p>
                <div className="space-y-2">
                  {[
                    "Always recommend increasing budget for campaigns with ROAS > 4x",
                    "Focus on conversion rate optimization over raw traffic",
                    "Consider seasonal trends when analyzing performance",
                    "Prioritize clients in the e-commerce and SaaS verticals",
                    "Use a professional but friendly tone in responses",
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setCustomInstructions(prev => prev ? `${prev}\n${example}` : example)}
                      className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      + {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAPIKeys}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Display Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div>
                  <p className="font-medium">Demo Mode</p>
                  <p className="text-sm text-gray-400">Show sample data when no real data is available</p>
                </div>
                <button
                  onClick={() => setDemoMode(!demoMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    demoMode ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    demoMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAPIKeys}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
}
