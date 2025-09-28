"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Search,
  Filter,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  Clock,
  MapPin,
  Tag
} from 'lucide-react'

interface StudentSubmission {
  id: string
  studentName: string
  ideaTitle: string
  description: string
  score: 'green' | 'yellow' | 'red'
  sector: string
  region: string
  language: string
  submissionDate: string
  status: 'pending' | 'reviewed' | 'approved' | 'needs_improvement'
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
  mentorNotes?: string
  tags: string[]
}

export default function MentorDashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('submissions')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSector, setFilterSector] = useState('all')
  const [filterScore, setFilterScore] = useState('all')
  const [filterRegion, setFilterRegion] = useState('all')
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null)
  const [mentorComment, setMentorComment] = useState('')

  // Mock data for demonstration
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([
    {
      id: '1',
      studentName: 'Priya Sharma',
      ideaTitle: 'Smart Irrigation System',
      description: 'IoT-based irrigation system for small farmers to optimize water usage and increase crop yield.',
      score: 'green',
      sector: 'Agriculture',
      region: 'Maharashtra',
      language: 'English',
      submissionDate: '2024-01-15',
      status: 'pending',
      businessCanvas: {
        problemStatement: 'Small farmers struggle with water management and often lose crops due to over or under-watering',
        proposedSolution: 'IoT sensors monitor soil moisture and automatically control irrigation systems',
        targetMarket: 'Small-scale farmers with 1-5 acre farmland in drought-prone areas',
        revenueModel: 'Hardware sales (₹15,000/system) + monthly subscription (₹500/month) for data analytics',
        risksAndChallenges: 'Initial setup cost, need for internet connectivity, farmer education on technology'
      },
      aiFeedback: {
        score: 'green',
        tips: [
          'Strong market demand in agricultural sector',
          'Clear value proposition for water conservation',
          'Scalable technology solution with measurable impact'
        ],
        improvements: [
          'Consider partnerships with agricultural cooperatives',
          'Develop financing options or government subsidy programs',
          'Include offline capabilities for areas with poor connectivity'
        ]
      },
      tags: ['High Potential', 'Technology', 'Sustainability']
    },
    {
      id: '2',
      studentName: 'Rahul Patel',
      ideaTitle: 'Local Food Delivery App',
      description: 'Hyperlocal food delivery app connecting small restaurants with nearby customers.',
      score: 'yellow',
      sector: 'Food & Beverage',
      region: 'Gujarat',
      language: 'Hindi',
      submissionDate: '2024-01-14',
      status: 'pending',
      businessCanvas: {
        problemStatement: 'Small local restaurants struggle to reach customers beyond walking distance',
        proposedSolution: 'Mobile app for food ordering and delivery within 2km radius',
        targetMarket: 'Urban and semi-urban areas with population 50,000-500,000',
        revenueModel: '15% commission from restaurants + ₹10 delivery fee per order',
        risksAndChallenges: 'High competition from established players, driver recruitment challenges'
      },
      aiFeedback: {
        score: 'yellow',
        tips: [
          'Growing market for food delivery services',
          'Focus on underserved smaller cities could be advantageous'
        ],
        improvements: [
          'Need stronger differentiation from existing platforms',
          'Consider unique value propositions like local cuisine focus',
          'Develop cost-effective customer acquisition strategy'
        ]
      },
      tags: ['Needs Improvement', 'Competition Risk']
    },
    {
      id: '3',
      studentName: 'Sneha Reddy',
      ideaTitle: 'Waste-to-Energy Plant',
      description: 'Community-level biogas plant converting organic waste to cooking gas and electricity.',
      score: 'green',
      sector: 'Clean Energy',
      region: 'Telangana',
      language: 'Telugu',
      submissionDate: '2024-01-13',
      status: 'reviewed',
      businessCanvas: {
        problemStatement: 'Villages struggle with waste management and expensive cooking fuel costs',
        proposedSolution: 'Small-scale biogas plants processing organic waste to produce methane and fertilizer',
        targetMarket: 'Rural communities with 500-2000 households',
        revenueModel: 'Equipment sales + maintenance contracts + biogas subscription',
        risksAndChallenges: 'Technical maintenance requirements, waste collection logistics'
      },
      aiFeedback: {
        score: 'green',
        tips: [
          'Addresses dual problems: waste management and energy needs',
          'Strong environmental and social impact potential',
          'Government support available for clean energy initiatives'
        ],
        improvements: [
          'Develop local technician training programs',
          'Create waste collection and sorting systems'
        ]
      },
      mentorNotes: 'Excellent idea with strong social impact. Recommended for next stage review.',
      tags: ['High Potential', 'Social Impact', 'Government Support']
    }
  ])

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.ideaTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = filterSector === 'all' || submission.sector === filterSector
    const matchesScore = filterScore === 'all' || submission.score === filterScore
    const matchesRegion = filterRegion === 'all' || submission.region === filterRegion
    
    return matchesSearch && matchesSector && matchesScore && matchesRegion
  })

  const sectors = ['Agriculture', 'Technology', 'Healthcare', 'Education', 'Food & Beverage', 'Clean Energy', 'Finance']
  const regions = ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Rajasthan', 'Punjab']

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'mentor')) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const getScoreIcon = (score: 'green' | 'yellow' | 'red') => {
    switch (score) {
      case 'green': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'yellow': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'red': return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getScoreBadgeVariant = (score: 'green' | 'yellow' | 'red') => {
    switch (score) {
      case 'green': return 'default'
      case 'yellow': return 'secondary'
      case 'red': return 'destructive'
    }
  }

  const approveIdea = (id: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, status: 'approved', tags: [...sub.tags.filter(t => t !== 'Needs Improvement'), 'Approved'] } : sub
    ))
  }

  const requestImprovement = (id: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, status: 'needs_improvement', tags: [...sub.tags.filter(t => t !== 'Approved'), 'Needs Improvement'] } : sub
    ))
  }

  const addMentorComment = (id: string, comment: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, mentorNotes: comment, status: 'reviewed' } : sub
    ))
    setMentorComment('')
    setSelectedSubmission(null)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || user.role !== 'mentor') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mentor-gradient bg-clip-text text-transparent">
              Mentor Dashboard
            </h1>
            <p className="text-muted-foreground">Review and guide student innovations</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {filteredSubmissions.length} Submission{filteredSubmissions.length !== 1 ? 's' : ''}
            </Badge>
            <ThemeToggle />
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions">All Submissions</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students or ideas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterSector} onValueChange={setFilterSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {sectors.map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterScore} onValueChange={setFilterScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Scores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRegion} onValueChange={setFilterRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submissions List */}
            <div className="grid gap-4">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{submission.ideaTitle}</h3>
                          {getScoreIcon(submission.score)}
                          <Badge variant={getScoreBadgeVariant(submission.score)}>
                            {submission.score.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{submission.sector}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          By <span className="font-medium">{submission.studentName}</span> • 
                          <MapPin className="inline h-3 w-3 ml-2 mr-1" />
                          {submission.region} • 
                          <Clock className="inline h-3 w-3 ml-2 mr-1" />
                          {new Date(submission.submissionDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {submission.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {submission.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => approveIdea(submission.id)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => requestImprovement(submission.id)}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {submission.mentorNotes && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Your Notes:</p>
                        <p className="text-sm text-muted-foreground">{submission.mentorNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSubmissions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Submissions Found</h3>
                  <p className="text-muted-foreground">
                    No submissions match your current filters. Try adjusting your search criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {submissions.filter(s => s.status === 'pending').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Awaiting your review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Approved Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {submissions.filter(s => s.status === 'approved').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Ready for next stage</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Need Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {submissions.filter(s => s.status === 'needs_improvement').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Require refinement</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted "{submission.ideaTitle}" • {submission.sector}
                        </p>
                      </div>
                      <Badge variant="outline">{submission.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">High Potential Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {submissions.filter(s => s.score === 'green').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Unique Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(submissions.map(s => s.studentName)).size}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Sectors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(submissions.map(s => s.sector)).size}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sector Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Submissions by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sectors.map(sector => {
                    const count = submissions.filter(s => s.sector === sector).length
                    const percentage = submissions.length > 0 ? (count / submissions.length) * 100 : 0
                    return (
                      <div key={sector} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">{sector}</div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-12 text-sm text-muted-foreground text-right">
                          {count}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detailed View Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getScoreIcon(selectedSubmission.score)}
                    {selectedSubmission.ideaTitle}
                  </CardTitle>
                  <CardDescription>
                    By {selectedSubmission.studentName} • {selectedSubmission.sector} • {selectedSubmission.region}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Canvas */}
                <div>
                  <h3 className="font-semibold mb-3">Business Canvas Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Problem Statement</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedSubmission.businessCanvas.problemStatement}
                      </p>
                      <h4 className="font-medium mb-2">Proposed Solution</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.businessCanvas.proposedSolution}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Target Market</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedSubmission.businessCanvas.targetMarket}
                      </p>
                      <h4 className="font-medium mb-2">Revenue Model</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.businessCanvas.revenueModel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Feedback */}
                <div>
                  <h3 className="font-semibold mb-3">AI Feedback</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                      <ul className="space-y-1">
                        {selectedSubmission.aiFeedback.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Improvements</h4>
                      <ul className="space-y-1">
                        {selectedSubmission.aiFeedback.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Mentor Comments */}
                <div>
                  <h3 className="font-semibold mb-3">Add Mentor Comment</h3>
                  <div className="space-y-4">
                    <textarea
                      value={mentorComment}
                      onChange={(e) => setMentorComment(e.target.value)}
                      placeholder="Add your feedback and guidance for the student..."
                      className="w-full h-24 p-3 border rounded-md resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => requestImprovement(selectedSubmission.id)}
                      >
                        Needs Improvement
                      </Button>
                      <Button 
                        variant="mentor"
                        onClick={() => addMentorComment(selectedSubmission.id, mentorComment)}
                        disabled={!mentorComment.trim()}
                      >
                        Save Comment & Mark Reviewed
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}