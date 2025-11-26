'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Sparkles, MessageSquare, Settings, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

const sampleMessages = [
  { role: 'assistant' as const, content: "Hello Mike! I'm your AI marketing analytics assistant. I have access to your campaign data across Google Ads, Meta Ads, and LinkedIn Ads. How can I help you optimize your advertising performance today?", timestamp: new Date('2025-11-25T14:25:00') },
  { role: 'user' as const, content: 'What were my total conversions last month and which platform performed best?', timestamp: new Date('2025-11-25T14:26:00') },
  { role: 'assistant' as const, content: `Based on your campaign data from October 2025, here's your conversion breakdown:\n\n**Total Conversions: 694**\n\n**Platform Performance:**\n1. 🥇 **Meta Ads**: 312 conversions (45%) - ROAS: 4.2x\n2. 🥈 **Google Ads**: 284 conversions (41%) - ROAS: 3.8x\n3. 🥉 **LinkedIn Ads**: 98 conversions (14%) - ROAS: 2.4x\n\n**Key Insights:**\n- Meta Ads is your top performer with the highest ROAS at 4.2x\n- Google Ads delivers consistent volume with solid 3.8x returns\n- LinkedIn Ads has lower conversion volume but targets high-value B2B prospects\n\n**Recommendation:** Consider increasing Meta Ads budget by 15-20% given its strong ROAS performance.\n\nWould you like me to dive deeper into any specific platform or campaign?`, timestamp: new Date('2025-11-25T14:26:30') },
  { role: 'user' as const, content: 'Why did my Google Ads CPC increase last week?', timestamp: new Date('2025-11-25T14:28:00') },
  { role: 'assistant' as const, content: `I've analyzed your Google Ads data and identified several factors contributing to the 12% CPC increase:\n\n**Primary Causes:**\n\n1. **Increased Competition** 📈\n   - Holiday season is approaching, driving more advertisers to bid on your keywords\n\n2. **Quality Score Changes** ⚠️\n   - Landing page relevance dropped slightly for 3 campaigns\n\n3. **Audience Expansion**\n   - Recent targeting changes expanded reach but diluted relevance\n\n**Recommendations:**\n\n1. **Review keyword bids** - Lower bids on underperforming keywords\n2. **Improve landing pages** - A/B test new variants to boost Quality Score\n3. **Refine audiences** - Tighten targeting to most profitable segments\n\nWould you like me to identify the specific campaigns that need attention?`, timestamp: new Date('2025-11-25T14:28:45') },
]

const suggestedQueries = ['What were my total conversions last week?', 'Compare Google Ads vs Meta Ads performance', 'Which campaigns have the highest ROAS?', 'Show me trends in click-through rates']

export default function DemoChatPage() {
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
            <Link href="/demo/chat"><Button variant="ghost" size="sm" className="text-blue-600"><MessageSquare className="w-4 h-4 mr-2" />AI Chat</Button></Link>
            <Link href="/demo/settings"><Button variant="ghost" size="sm"><Settings className="w-4 h-4 mr-2" />Settings</Button></Link>
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">MS</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Mike Strickler</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Marketing Assistant</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white"><Sparkles className="w-5 h-5 text-blue-600" /><span>Chat</span></CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Model:</span>
                    <Select defaultValue="claude-sonnet-4-5">
                      <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5</SelectItem>
                        <SelectItem value="claude-haiku-4-5">Claude Haiku 4.5</SelectItem>
                        <SelectItem value="gpt-5">GPT-5 (Thinking)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {sampleMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex space-x-2">
                    <Textarea placeholder="Ask me anything about your marketing campaigns..." className="flex-1" rows={2} />
                    <Button><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader><CardTitle className="text-sm text-gray-900 dark:text-white">Suggested Questions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedQueries.map((query, index) => (
                    <Button key={index} variant="outline" className="w-full text-left justify-start h-auto py-3 px-4 text-sm whitespace-normal leading-relaxed">{query}</Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

