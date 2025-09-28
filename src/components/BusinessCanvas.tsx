import { ArrowLeft, Download, Share, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BusinessAnalysis {
  businessCanvas: {
    keyPartners?: { description: string; details: string }
    keyActivities?: { description: string; details: string }
    keyResources?: { description: string; details: string }
    valueProposition?: { description: string; details: string }
    customerRelationships?: { description: string; details: string }
    channels?: { description: string; details: string }
    customerSegments?: { description: string; details: string }
    costStructure?: { description: string; details: string }
    revenueStreams?: { description: string; details: string }
  }
  businessAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  trafficLightScore: string
  feedbackSuggestions: string[]
  localImpactMapping: string
}

interface BusinessCanvasProps {
  ideaTitle: string
  analysis?: BusinessAnalysis
  onBack: () => void
}

export default function BusinessCanvas({ ideaTitle, analysis, onBack }: BusinessCanvasProps) {
  // Use analysis data if available, otherwise fallback to mock data
  const getCanvasSection = (section: any, fallback: string[]) => {
    if (section?.details && section.details !== 'Not specified') {
      return [section.details]
    }
    return fallback
  }

  const canvasData = {
    keyPartners: getCanvasSection(analysis?.businessCanvas?.keyPartners, [
      'Local farmers cooperative',
      'Organic certification agencies',
      'Distribution partners',
      'Technology providers'
    ]),
    keyActivities: getCanvasSection(analysis?.businessCanvas?.keyActivities, [
      'Organic farming coordination',
      'Quality assurance',
      'Supply chain management',
      'Farmer training programs'
    ]),
    keyResources: getCanvasSection(analysis?.businessCanvas?.keyResources, [
      'Agricultural land network',
      'Farming expertise',
      'Certification credentials',
      'Distribution infrastructure'
    ]),
    valuePropositions: getCanvasSection(analysis?.businessCanvas?.valueProposition, [
      'Guaranteed organic produce',
      'Fair pricing for farmers',
      'Traceable supply chain',
      'Direct market access'
    ]),
    customerRelationships: getCanvasSection(analysis?.businessCanvas?.customerRelationships, [
      'Direct sales',
      'Community supported agriculture',
      'Online platform',
      'Subscription services'
    ]),
    channels: getCanvasSection(analysis?.businessCanvas?.channels, [
      'Farmers markets',
      'Online platform',
      'Retail partnerships',
      'Direct delivery'
    ]),
    customerSegments: getCanvasSection(analysis?.businessCanvas?.customerSegments, [
      'Health-conscious consumers',
      'Restaurants & cafes',
      'Organic food retailers',
      'Local communities'
    ]),
    costStructure: getCanvasSection(analysis?.businessCanvas?.costStructure, [
      'Farmer payments',
      'Certification costs',
      'Transportation',
      'Technology infrastructure'
    ]),
    revenueStreams: getCanvasSection(analysis?.businessCanvas?.revenueStreams, [
      'Product sales',
      'Subscription fees',
      'Premium pricing',
      'Consulting services'
    ])
  }

  const handleExportPDF = () => {
    // Mock PDF export
    alert('PDF export would be implemented here')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-entrepreneur" />
                Business Model Canvas
              </h1>
              <p className="text-muted-foreground">AI-generated analysis for: {ideaTitle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button variant="entrepreneur" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Business Model Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          {/* Key Partners */}
          <Card className="lg:row-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Key Partners</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                {canvasData.keyPartners.map((item, index) => (
                  <li key={index} className="p-2 bg-blue-50 rounded text-blue-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Activities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Key Activities</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                {canvasData.keyActivities.map((item, index) => (
                  <li key={index} className="p-2 bg-green-50 rounded text-green-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Value Propositions */}
          <Card className="lg:row-span-2 border-2 border-entrepreneur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-entrepreneur">Value Propositions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                {canvasData.valuePropositions.map((item, index) => (
                  <li key={index} className="p-2 bg-entrepreneur/10 rounded text-entrepreneur font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Customer Relationships */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Customer Relationships</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                {canvasData.customerRelationships.map((item, index) => (
                  <li key={index} className="p-2 bg-purple-50 rounded text-purple-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card className="lg:row-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Customer Segments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                {canvasData.customerSegments.map((item, index) => (
                  <li key={index} className="p-2 bg-orange-50 rounded text-orange-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Resources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Key Resources</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                {canvasData.keyResources.map((item, index) => (
                  <li key={index} className="p-2 bg-indigo-50 rounded text-indigo-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Channels */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Channels</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                {canvasData.channels.map((item, index) => (
                  <li key={index} className="p-2 bg-pink-50 rounded text-pink-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Cost Structure and Revenue Streams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cost Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {canvasData.costStructure.map((item, index) => (
                  <li key={index} className="p-2 bg-red-50 rounded text-red-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Revenue Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {canvasData.revenueStreams.map((item, index) => (
                  <li key={index} className="p-2 bg-emerald-50 rounded text-emerald-800">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="mt-6 border-entrepreneur/20 bg-entrepreneur/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-entrepreneur">
              <Sparkles className="h-5 w-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {(analysis?.businessAnalysis?.strengths || [
                    'Strong value proposition for health-conscious market',
                    'Direct farmer relationships reduce costs',
                    'Growing demand for organic products'
                  ]).map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Opportunities</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {(analysis?.businessAnalysis?.opportunities || [
                    'Government support for organic farming',
                    'Export potential to urban markets',
                    'Technology integration for efficiency'
                  ]).map((opportunity, index) => (
                    <li key={index}>• {opportunity}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Challenges</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {(analysis?.businessAnalysis?.threats || analysis?.businessAnalysis?.weaknesses || [
                    'Certification costs and complexity',
                    'Seasonal supply variations',
                    'Competition from established brands'
                  ]).map((challenge, index) => (
                    <li key={index}>• {challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Recommendations */}
            {analysis?.feedbackSuggestions && analysis.feedbackSuggestions.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {analysis.feedbackSuggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Local Impact */}
            {analysis?.localImpactMapping && (
              <div className="p-4 bg-purple-50 rounded-lg mt-4">
                <h4 className="font-semibold text-purple-800 mb-2">Local Impact</h4>
                <p className="text-sm text-purple-700">{analysis.localImpactMapping}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}