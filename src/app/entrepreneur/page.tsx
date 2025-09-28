"use client"

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Upload, 
  Mic, 
  FileText, 
  Download, 
  History, 
  Target, 
  Users, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Eye,
  Trash2,
  BarChart3
} from 'lucide-react'

interface AIScoring {
  overallScore: number
  rubrics: {
    [key: string]: {
      score: number
      maxScore: number
      feedback: string
    }
  }
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  detailedFeedback: string
}

interface BusinessIdea {
  id: string
  title: string
  description: string
  status: 'draft' | 'submitted' | 'reviewed'
  score: 'green' | 'yellow' | 'red'
  submissionDate: string
  businessCanvas: {
    problemStatement: string
    proposedSolution: string
    targetMarket: string
    revenueModel: string
    risksAndChallenges: string
  }
  aiFeedback: {
    score: 'green' | 'yellow' | 'red'
    tips: string[]
    improvements: string[]
  }
  localImpact: {
    region: string
    relevance: string
    adoptionPotential: string
  }
  analysis?: {
    aiScoring?: AIScoring
    businessCanvas?: any
    businessAnalysis?: any
    trafficLightScore?: string
  }
}

export default function EntrepreneurDashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('submit')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null)
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)
  const [analysisError, setAnalysisError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Mock data for demonstration
  const [submittedIdeas, setSubmittedIdeas] = useState<BusinessIdea[]>([
    {
      id: '1',
      title: 'Smart Irrigation System',
      description: 'IoT-based irrigation system for small farmers',
      status: 'reviewed',
      score: 'green',
      submissionDate: '2024-01-15',
      businessCanvas: {
        problemStatement: 'Small farmers struggle with water management',
        proposedSolution: 'IoT sensors with automated irrigation',
        targetMarket: 'Small-scale farmers in Maharashtra',
        revenueModel: 'Hardware sales + subscription service',
        risksAndChallenges: 'Initial setup cost, technical support needs'
      },
      aiFeedback: {
        score: 'green',
        tips: [
          'Strong market demand in agricultural sector',
          'Clear value proposition for farmers', 
          'Scalable technology solution'
        ],
        improvements: [
          'Consider partnerships with agricultural cooperatives',
          'Develop financing options for farmers'
        ]
      },
      localImpact: {
        region: 'Rural Maharashtra',
        relevance: 'High - addresses water scarcity issues',
        adoptionPotential: 'High adoption potential in drought-prone areas'
      }
    }
  ])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'entrepreneur')) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if it's a PDF file
      if (file.type === 'application/pdf') {
        setUploadedFile(file)
        console.log('📄 PDF file selected:', file.name)
      } else {
        alert('Please upload a PDF file for business plan analysis.')
        event.target.value = '' // Reset the input
      }
    }
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a'))) {
      setUploadedAudio(file)
      console.log('🎵 Audio file selected:', file.name)
    } else {
      alert('Please select a valid audio file (MP3, WAV, M4A)')
      event.target.value = '' // Reset the input
    }
  }

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const submitIdea = async () => {
    setIsAnalyzing(true)
    setAnalysisError('')
    
    try {
      let analysisResult = null
      
      // If there's an uploaded PDF file, send it to the backend
      if (uploadedFile && uploadedFile.type === 'application/pdf') {
        const formData = new FormData()
        formData.append('file', uploadedFile)
        
        console.log('📤 Sending PDF to backend for analysis...')
        
        const response = await fetch('http://localhost:8001/api/analyze-pdf', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status} ${response.statusText}`)
        }
        
        analysisResult = await response.json()
        console.log('✅ Received analysis from backend:', analysisResult)
        
      } else if (uploadedAudio) {
        // If there's an uploaded audio file, convert it to text first
        console.log('🎵 Processing audio file for analysis...')
        
        // For now, we'll treat it as a text analysis with the filename
        // TODO: Implement audio-to-text conversion in backend
        const audioText = `Audio business idea presentation from file: ${uploadedAudio.name}. 
        This is a placeholder for audio-to-text conversion. The user uploaded an audio file describing their business idea.
        Please analyze this as a business concept that needs development across all business model canvas components.`
        
        const response = await fetch('http://localhost:8001/api/analyze-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: audioText
          }),
        })
        
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status} ${response.statusText}`)
        }
        
        analysisResult = await response.json()
        console.log('✅ Received analysis from audio processing:', analysisResult)
        
      } else if (ideaDescription.trim()) {
        // If there's text input, send it to the text analysis endpoint
        console.log('📤 Sending text to backend for analysis...')
        
        const response = await fetch('http://localhost:8001/api/analyze-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: ideaDescription
          }),
        })
        
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status} ${response.statusText}`)
        }
        
        analysisResult = await response.json()
        console.log('✅ Received analysis from backend:', analysisResult)
      } else {
        throw new Error('Please provide either a text description, upload a PDF file, or upload an audio file.')
      }
      
      // Create the business idea object with AI analysis results
      const newIdea: BusinessIdea = {
        id: Date.now().toString(),
        title: analysisResult?.filename || ideaDescription.split(' ').slice(0, 4).join(' ') || 'New Business Idea',
        description: ideaDescription || `Analysis from ${analysisResult?.filename}`,
        status: 'reviewed',
        score: analysisResult?.analysis?.trafficLightScore?.toLowerCase() || 'yellow',
        submissionDate: new Date().toISOString().split('T')[0],
        businessCanvas: {
          problemStatement: analysisResult?.analysis?.businessCanvas?.valueProposition?.details || 'AI analysis completed',
          proposedSolution: analysisResult?.analysis?.businessCanvas?.keyActivities?.details || 'Solution analysis completed',
          targetMarket: analysisResult?.analysis?.businessCanvas?.customerSegments?.details || 'Target market analysis completed',
          revenueModel: analysisResult?.analysis?.businessCanvas?.revenueStreams?.details || 'Revenue model analysis completed',
          risksAndChallenges: analysisResult?.analysis?.businessCanvas?.costStructure?.details || 'Risk analysis completed'
        },
        aiFeedback: {
          score: (analysisResult?.analysis?.trafficLightScore?.toLowerCase() || 'yellow') as 'green' | 'yellow' | 'red',
          tips: analysisResult?.analysis?.businessAnalysis?.strengths || ['Analysis completed successfully'],
          improvements: analysisResult?.analysis?.feedbackSuggestions || ['Continue developing your business plan']
        },
        localImpact: {
          region: 'Local Region',
          relevance: analysisResult?.analysis?.localImpactMapping || 'Positive local impact potential',
          adoptionPotential: 'High adoption potential in target market'
        },
        analysis: analysisResult?.analysis || undefined
      }
      
      setSubmittedIdeas([newIdea, ...submittedIdeas])
      setLatestAnalysis(analysisResult?.analysis)
      setIdeaDescription('')
      setUploadedFile(null)
      setUploadedAudio(null)
      setActiveTab('history')
      
    } catch (error: any) {
      console.error('❌ Error submitting idea:', error)
      const errorMessage = error.message || 'Unknown error occurred'
      setAnalysisError(`Analysis failed: ${errorMessage}. Please ensure the backend server is running on port 8000.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreIcon = (score: 'green' | 'yellow' | 'red') => {
    switch (score) {
      case 'green': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'yellow': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'red': return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const downloadPDF = async (idea: BusinessIdea) => {
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // PDF Title and Header
      pdf.setFontSize(24)
      pdf.setTextColor(59, 130, 246) // Blue color
      pdf.text('Business Analysis Report', pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 15
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`"${idea.title}"`, pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 10
      pdf.setFontSize(12)
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' })

      // Add a line separator
      yPosition += 15
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 15

      // === OVERALL SCORE SECTION ===
      pdf.setFontSize(18)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Overall AI Score', 20, yPosition)
      yPosition += 10

      if (idea.analysis?.aiScoring) {
        const score = idea.analysis.aiScoring.overallScore
        pdf.setFontSize(36)
        const scoreColor = score >= 75 ? [34, 197, 94] : score >= 35 ? [234, 179, 8] : [239, 68, 68]
        pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
        pdf.text(`${score}/100`, 20, yPosition)
        
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        const scoreLabel = score >= 75 ? 'Excellent (75-100)' : score >= 35 ? 'Good (35-75)' : 'Needs Development (0-35)'
        pdf.text(scoreLabel, 80, yPosition - 10)
        
        yPosition += 15
        pdf.setFontSize(11)
        const feedbackLines = pdf.splitTextToSize(idea.analysis.aiScoring.detailedFeedback, pageWidth - 40)
        pdf.text(feedbackLines, 20, yPosition)
        yPosition += feedbackLines.length * 5 + 10
      }

      // === RUBRICS BREAKDOWN ===
      pdf.setFontSize(16)
      pdf.text('Scoring Rubrics', 20, yPosition)
      yPosition += 10

      if (idea.analysis?.aiScoring?.rubrics) {
        const rubrics = idea.analysis.aiScoring.rubrics
        Object.entries(rubrics).forEach(([rubricName, rubricData]: [string, any]) => {
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${rubricName.charAt(0).toUpperCase() + rubricName.slice(1)}:`, 20, yPosition)
          pdf.text(`${rubricData.score}/${rubricData.maxScore}`, pageWidth - 40, yPosition)
          
          // Progress bar
          const barWidth = 100
          const barHeight = 3
          const fillWidth = (rubricData.score / rubricData.maxScore) * barWidth
          const barColor = rubricData.score >= 19 ? [34, 197, 94] : rubricData.score >= 9 ? [234, 179, 8] : [239, 68, 68]
          
          pdf.setFillColor(240, 240, 240)
          pdf.rect(20, yPosition + 3, barWidth, barHeight, 'F')
          pdf.setFillColor(barColor[0], barColor[1], barColor[2])
          pdf.rect(20, yPosition + 3, fillWidth, barHeight, 'F')
          
          yPosition += 8
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)
          const feedbackLines = pdf.splitTextToSize(rubricData.feedback, pageWidth - 40)
          pdf.text(feedbackLines, 20, yPosition)
          yPosition += feedbackLines.length * 4 + 8

          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            pdf.addPage()
            yPosition = 20
          }
        })
      }

      // === BUSINESS MODEL CANVAS SECTION ===
      if (yPosition > pageHeight - 80) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(18)
      pdf.text('Business Model Canvas', 20, yPosition)
      yPosition += 15

      const canvasItems = [
        { label: 'Problem Statement', content: idea.businessCanvas.problemStatement },
        { label: 'Proposed Solution', content: idea.businessCanvas.proposedSolution },
        { label: 'Target Market', content: idea.businessCanvas.targetMarket },
        { label: 'Revenue Model', content: idea.businessCanvas.revenueModel },
        { label: 'Risks & Challenges', content: idea.businessCanvas.risksAndChallenges }
      ]

      canvasItems.forEach(item => {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(item.label + ':', 20, yPosition)
        yPosition += 6
        
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        const contentLines = pdf.splitTextToSize(item.content, pageWidth - 40)
        pdf.text(contentLines, 20, yPosition)
        yPosition += contentLines.length * 4 + 8

        if (yPosition > pageHeight - 50) {
          pdf.addPage()
          yPosition = 20
        }
      })

      // === DETAILED ANALYSIS SECTION ===
      if (yPosition > pageHeight - 60) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(16)
      pdf.text('Detailed Analysis', 20, yPosition)
      yPosition += 15

      // Strengths
      const strengths = idea.analysis?.aiScoring?.strengths || idea.aiFeedback.tips || []
      if (strengths.length > 0) {
        pdf.setFontSize(14)
        pdf.setTextColor(34, 197, 94)
        pdf.text('✓ Strengths', 20, yPosition)
        yPosition += 8
        
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        strengths.forEach((strength: any) => {
          const lines = pdf.splitTextToSize(`• ${strength}`, pageWidth - 40)
          pdf.text(lines, 25, yPosition)
          yPosition += lines.length * 4 + 2
        })
        yPosition += 8
      }

      // Weaknesses
      const weaknesses = idea.analysis?.aiScoring?.weaknesses || []
      if (weaknesses.length > 0) {
        pdf.setFontSize(14)
        pdf.setTextColor(239, 68, 68)
        pdf.text('⚠ Areas for Improvement', 20, yPosition)
        yPosition += 8
        
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        weaknesses.forEach((weakness: any) => {
          const lines = pdf.splitTextToSize(`• ${weakness}`, pageWidth - 40)
          pdf.text(lines, 25, yPosition)
          yPosition += lines.length * 4 + 2
        })
        yPosition += 8
      }

      // Improvements
      const improvements = idea.analysis?.aiScoring?.improvements || idea.aiFeedback.improvements || []
      if (improvements.length > 0) {
        pdf.setFontSize(14)
        pdf.setTextColor(234, 179, 8)
        pdf.text('📋 Recommended Actions', 20, yPosition)
        yPosition += 8
        
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        improvements.forEach((improvement: any) => {
          const lines = pdf.splitTextToSize(`• ${improvement}`, pageWidth - 40)
          pdf.text(lines, 25, yPosition)
          yPosition += lines.length * 4 + 2
        })
      }

      // Footer
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(`Incentra Business Analysis Report - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      }

      // Save the PDF
      const fileName = `${idea.title.replace(/[^a-z0-9]/gi, '_')}_Business_Report.pdf`
      pdf.save(fileName)
      
      console.log('✅ PDF report generated successfully:', fileName)
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error)
      alert('Failed to generate PDF report. Please try again.')
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || user.role !== 'entrepreneur') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold entrepreneur-gradient bg-clip-text text-transparent">
              Entrepreneur Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="submit">Submit Idea</TabsTrigger>
            <TabsTrigger value="canvas">Business Canvas</TabsTrigger>
            <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Submit Idea Tab */}
          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Submit Your Business Idea
                </CardTitle>
                <CardDescription>
                  Describe your idea using text, upload PDF files, or upload audio recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Describe your business idea</label>
                  <textarea
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    placeholder="Tell us about your innovative business idea..."
                    className="w-full h-32 p-3 border rounded-md resize-none"
                  />
                </div>

                {/* Upload Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf"
                        className="hidden"
                      />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Upload Notes</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        PDF Business Plans
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                      {uploadedFile && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {uploadedFile.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Audio Upload */}
                  <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Mic className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Upload Audio</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Upload your recorded idea
                      </p>
                      {uploadedAudio ? (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600 font-medium">{uploadedAudio.name}</p>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setUploadedAudio(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a"
                            onChange={handleAudioUpload}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </label>
                      )}
                    </CardContent>
                  </Card>


                </div>

                {/* Error Display */}
                {analysisError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-5 w-5" />
                      <p className="text-sm font-medium">Analysis Error</p>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={submitIdea}
                    disabled={(!ideaDescription.trim() && !uploadedFile && !uploadedAudio) || isAnalyzing}
                    variant="entrepreneur"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing with AI...
                      </>
                    ) : (
                      'Submit Idea for Analysis'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Canvas Tab */}
          <TabsContent value="canvas" className="space-y-6">
            {submittedIdeas.length > 0 && latestAnalysis ? (
              <div className="space-y-6">
                {/* Enhanced Business Canvas with AI Analysis */}
                <Card className="border-entrepreneur/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      AI-Generated Business Model Canvas
                    </CardTitle>
                    <CardDescription>
                      Comprehensive analysis based on your business plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Business Model Canvas Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                      {/* Key Partners */}
                      <Card className="lg:row-span-2 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-blue-800">Key Partners</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
                            {latestAnalysis.businessCanvas?.keyPartners?.details || 'Analysis of key partnerships and strategic alliances'}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Key Activities */}
                      <Card className="border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-green-800">Key Activities</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-green-50 rounded text-sm text-green-800">
                            {latestAnalysis.businessCanvas?.keyActivities?.details || 'Core business activities identified'}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Value Propositions */}
                      <Card className="lg:row-span-2 border-2 border-entrepreneur">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-entrepreneur">Value Propositions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-entrepreneur/10 rounded text-sm text-entrepreneur font-medium">
                            {latestAnalysis.businessCanvas?.valueProposition?.details || 'Core value delivered to customers'}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customer Relationships */}
                      <Card className="border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-purple-800">Customer Relationships</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-purple-50 rounded text-sm text-purple-800">
                            {latestAnalysis.businessCanvas?.customerRelationships?.details || 'Customer engagement strategy'}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customer Segments */}
                      <Card className="lg:row-span-2 border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-orange-800">Customer Segments</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-orange-50 rounded text-sm text-orange-800">
                            {latestAnalysis.businessCanvas?.customerSegments?.details || 'Target customer groups identified'}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Key Resources */}
                      <Card className="border-indigo-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-indigo-800">Key Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-indigo-50 rounded text-sm text-indigo-800">
                            {latestAnalysis.businessCanvas?.keyResources?.details || 'Essential resources for operations'}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Channels */}
                      <Card className="border-pink-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-pink-800">Channels</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-pink-50 rounded text-sm text-pink-800">
                            {latestAnalysis.businessCanvas?.channels?.details || 'Distribution and sales channels'}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cost Structure and Revenue Streams */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      <Card className="border-red-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-red-800">Cost Structure</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-red-50 rounded text-sm text-red-800">
                            {latestAnalysis.businessCanvas?.costStructure?.details || 'Major cost components identified'}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-emerald-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-emerald-800">Revenue Streams</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-emerald-50 rounded text-sm text-emerald-800">
                            {latestAnalysis.businessCanvas?.revenueStreams?.details || 'Revenue generation methods'}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* SWOT Analysis */}
                <Card className="border-entrepreneur/20 bg-entrepreneur/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-entrepreneur">
                      <AlertTriangle className="h-5 w-5" />
                      SWOT Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          {(latestAnalysis.businessAnalysis?.strengths || ['Strong foundation']).map((strength: string, index: number) => (
                            <li key={index}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Weaknesses</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {(latestAnalysis.businessAnalysis?.weaknesses || ['Areas for improvement']).map((weakness: string, index: number) => (
                            <li key={index}>• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Opportunities</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {(latestAnalysis.businessAnalysis?.opportunities || ['Market opportunities']).map((opportunity: string, index: number) => (
                            <li key={index}>• {opportunity}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Threats</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {(latestAnalysis.businessAnalysis?.threats || ['Potential challenges']).map((threat: string, index: number) => (
                            <li key={index}>• {threat}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Business Canvas Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Submit your first idea to see the AI-generated business canvas
                  </p>
                  <Button onClick={() => setActiveTab('submit')}>
                    Submit Your First Idea
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            {submittedIdeas.length > 0 ? (
              <div className="space-y-6">
                {submittedIdeas.map((idea) => (
                  <div key={idea.id} className="space-y-6">
                    {/* Overall Score Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {getScoreIcon(idea.aiFeedback.score)}
                            AI Analysis for "{idea.title}"
                          </CardTitle>
                          <Badge 
                            variant={idea.aiFeedback.score === 'green' ? 'default' : 
                                   idea.aiFeedback.score === 'yellow' ? 'secondary' : 'destructive'}
                          >
                            {idea.aiFeedback.score.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Overall Score Display */}
                        {idea.analysis?.aiScoring && (
                          <div className="space-y-4">
                            <div className={`text-center p-6 rounded-lg ${
                              idea.analysis.aiScoring.overallScore >= 75 ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950' :
                              idea.analysis.aiScoring.overallScore >= 35 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950' :
                              'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950'
                            }`}>
                              <div className={`text-4xl font-bold mb-2 ${
                                idea.analysis.aiScoring.overallScore >= 75 ? 'text-green-600' :
                                idea.analysis.aiScoring.overallScore >= 35 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {idea.analysis.aiScoring.overallScore}/100
                              </div>
                              <div className="text-lg font-medium text-muted-foreground">Overall AI Score</div>
                              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                                idea.analysis.aiScoring.overallScore >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                idea.analysis.aiScoring.overallScore >= 35 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              }`}>
                                {idea.analysis.aiScoring.overallScore >= 75 ? 'Excellent (75-100)' :
                                 idea.analysis.aiScoring.overallScore >= 35 ? 'Good (35-75)' :
                                 'Needs Development (0-35)'}
                              </div>
                              <p className="text-sm text-muted-foreground mt-3">
                                {idea.analysis.aiScoring.detailedFeedback}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Score Interpretation Legend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Score Interpretation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>0-35: Needs Development</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>35-75: Good</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>75-100: Excellent</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rubrics Breakdown */}
                    {idea.analysis?.aiScoring?.rubrics && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Detailed Scoring Rubrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {Object.entries(idea.analysis.aiScoring.rubrics).map(([rubricName, rubricData]) => (
                            <div key={rubricName} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium capitalize">{rubricName}</h4>
                                <span className="text-sm font-medium">
                                  {rubricData.score}/{rubricData.maxScore}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    (rubricData as any).score >= 19 ? 'bg-green-600' :
                                    (rubricData as any).score >= 9 ? 'bg-yellow-600' :
                                    'bg-red-600'
                                  }`}
                                  style={{ width: `${((rubricData as any).score / (rubricData as any).maxScore) * 100}%` }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">{rubricData.feedback}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Strengths, Weaknesses, and Improvements */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Strengths */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(idea.analysis?.aiScoring?.strengths || idea.aiFeedback.tips || []).map((strength, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Weaknesses */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-red-600 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(idea.analysis?.aiScoring?.weaknesses || []).map((weakness, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Improvements */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-orange-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Recommended Actions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(idea.analysis?.aiScoring?.improvements || idea.aiFeedback.improvements || []).map((improvement, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Feedback Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Submit an idea to receive AI-powered feedback and suggestions
                  </p>
                  <Button onClick={() => setActiveTab('submit')}>
                    Submit Your First Idea
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Submission History</h2>
              <Badge variant="outline">
                {submittedIdeas.length} {submittedIdeas.length === 1 ? 'Idea' : 'Ideas'}
              </Badge>
            </div>

            <div className="grid gap-4">
              {submittedIdeas.map((idea) => (
                <Card key={idea.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{idea.title}</h3>
                          {getScoreIcon(idea.score)}
                          <Badge variant={idea.status === 'reviewed' ? 'default' : 'secondary'}>
                            {idea.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {idea.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {new Date(idea.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('canvas')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadPDF(idea)} title="Download Complete Business Report (Canvas + AI Scoring)">
                          <Download className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {submittedIdeas.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your submitted ideas will appear here with their progress tracking
                    </p>
                    <Button onClick={() => setActiveTab('submit')}>
                      Submit Your First Idea
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}