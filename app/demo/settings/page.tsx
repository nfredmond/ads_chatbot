'use client'

import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Key, Link as LinkIcon, Check, MessageSquare, Settings, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

const connectedAccounts = [
  { id: '1', platform: 'google_ads', account_name: 'Google Ads - Longitude 122', account_id: '123-456-7890', status: 'active', last_synced_at: '2025-11-25T14:30:00' },
  { id: '2', platform: 'meta_ads', account_name: 'Meta Ads - Longitude 122 Marketing', account_id: 'act_1234567890123', status: 'active', last_synced_at: '2025-11-25T14:30:00' },
  { id: '3', platform: 'linkedin_ads', account_name: 'LinkedIn Ads - Longitude 122', account_id: '508123456', status: 'active', last_synced_at: '2025-11-25T14:28:00' },
]

export default function DemoSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Marketing Analytics</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/demo"><Button variant="ghost" size="sm"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</Button></Link>
            <Link href="/demo/chat"><Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4 mr-2" />AI Chat</Button></Link>
            <Link href="/demo/settings"><Button variant="ghost" size="sm" className="text-blue-600"><Settings className="w-4 h-4 mr-2" />Settings</Button></Link>
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">MS</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Mike Strickler</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <Tabs defaultValue="connected" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="ad-platforms">Ad Platforms</TabsTrigger>
              <TabsTrigger value="connected">Connected Accounts</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
                  <CardDescription>Update your profile and organization details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="full-name">Full Name</Label><Input id="full-name" defaultValue="Mike Strickler" /></div>
                  <div className="space-y-2"><Label htmlFor="organization">Organization</Label><Input id="organization" defaultValue="Longitude 122 Marketing" /></div>
                  <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" defaultValue="+1 (619) 555-0122" /></div>
                  <Button>Save Profile</Button>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Setup Wizard</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Re-run the onboarding wizard to reconfigure your ad platform connections</p>
                    <Button variant="outline">Re-run Setup Wizard</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="api-keys" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white"><Key className="w-5 h-5" /><span>AI API Keys</span></CardTitle>
                  <CardDescription>Configure your AI API keys for intelligent insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="anthropic-key">Anthropic API Key (Claude)</Label><Input id="anthropic-key" type="password" defaultValue="sk-ant-api03-••••••••••••••••••••" /></div>
                  <div className="space-y-2"><Label htmlFor="openai-key">OpenAI API Key (Optional)</Label><Input id="openai-key" type="password" defaultValue="sk-proj-••••••••••••••••••••" /></div>
                  <Button>Save API Keys</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ad-platforms" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader><CardTitle className="text-gray-900 dark:text-white">Google Ads</CardTitle><CardDescription>Connect your Google Ads account</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center"><Check className="w-4 h-4 mr-2" /><strong>Connected</strong> - Account ID: 123-456-7890</p>
                  </div>
                  <Button variant="outline"><LinkIcon className="w-4 h-4 mr-2" />Reconnect Google Ads</Button>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader><CardTitle className="text-gray-900 dark:text-white">Meta Ads</CardTitle><CardDescription>Connect your Meta Ads account</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center"><Check className="w-4 h-4 mr-2" /><strong>Connected</strong> - Account ID: act_1234567890123</p>
                  </div>
                  <Button variant="outline"><LinkIcon className="w-4 h-4 mr-2" />Reconnect Meta Ads</Button>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader><CardTitle className="text-gray-900 dark:text-white">LinkedIn Ads</CardTitle><CardDescription>Connect your LinkedIn Ads account</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center"><Check className="w-4 h-4 mr-2" /><strong>Connected</strong> - Account ID: 508123456</p>
                  </div>
                  <Button variant="outline"><LinkIcon className="w-4 h-4 mr-2" />Reconnect LinkedIn Ads</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="connected" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle className="text-gray-900 dark:text-white">Connected Ad Accounts</CardTitle><CardDescription>Manage your connected advertising platform accounts</CardDescription></div>
                    <Button><LinkIcon className="w-4 h-4 mr-2" />Sync Data</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectedAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{account.account_name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Platform: {account.platform.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Account ID: {account.account_id}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Last synced: {new Date(account.last_synced_at).toLocaleString()}</p>
                          </div>
                          <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 mr-1" />{account.status}</Badge>
                        </div>
                        <Button variant="destructive" size="sm">Disconnect</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

