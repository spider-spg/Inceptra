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
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  MapPin,
  Building,
  Lightbulb,
  Target,
  Globe,
  Calendar,
  FileSpreadsheet,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface AdminMetrics {
  totalSubmissions: number
  ruralUrbanSplit: { rural: number; urban: number }
  sectorDistribution: Record<string, number>
  regionDistribution: Record<string, number>
  scoreDistribution: { green: number; yellow: number; red: number }
  monthlyTrends: Array<{ month: string; submissions: number }>
  topPerformingSectors: Array<{ sector: string; avgScore: number; count: number }>
  emergingTrends: Array<{ trend: string; growth: number }>
}

interface StudentIdea {
  id: string
  studentName: string
  ideaTitle: string
  description: string
  score: 'green' | 'yellow' | 'red'
  sector: string
  region: string
  type: 'rural' | 'urban'
  language: string
  submissionDate: string
  mentorStatus: 'pending' | 'reviewed' | 'approved'
  fundingReady: boolean
}

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSector, setFilterSector] = useState('all')
  const [filterRegion, setFilterRegion] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months')

  // Mock data for demonstration
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalSubmissions: 1247,
    ruralUrbanSplit: { rural: 658, urban: 589 },
    sectorDistribution: {
      'Agriculture': 312,
      'Technology': 198,
      'Healthcare': 156,
      'Education': 143,
      'Clean Energy': 128,
      'Food & Beverage': 98,
      'Finance': 89,
      'Manufacturing': 67,
      'Retail': 56
    },
    regionDistribution: {
      'Maharashtra': 234,
      'Gujarat': 187,
      'Karnataka': 156,
      'Tamil Nadu': 143,
      'Telangana': 128,
      'Rajasthan': 112,
      'Punjab': 98,
      'Uttar Pradesh': 89,
      'West Bengal': 67,
      'Kerala': 56
    },
    scoreDistribution: { green: 298, yellow: 645, red: 304 },
    monthlyTrends: [
      { month: 'Jul', submissions: 156 },
      { month: 'Aug', submissions: 189 },
      { month: 'Sep', submissions: 234 },
      { month: 'Oct', submissions: 198 },
      { month: 'Nov', submissions: 267 },
      { month: 'Dec', submissions: 203 }
    ],
    topPerformingSectors: [
      { sector: 'Clean Energy', avgScore: 2.4, count: 128 },
      { sector: 'Agriculture', avgScore: 2.2, count: 312 },
      { sector: 'Healthcare', avgScore: 2.1, count: 156 },
      { sector: 'Technology', avgScore: 1.9, count: 198 },
      { sector: 'Education', avgScore: 1.8, count: 143 }
    ],
    emergingTrends: [
      { trend: 'AI/ML Applications', growth: 45 },
      { trend: 'Sustainable Solutions', growth: 38 },
      { trend: 'Rural Innovation', growth: 32 },
      { trend: 'FinTech Solutions', growth: 28 }
    ]
  })

  const [ideas, setIdeas] = useState<StudentIdea[]>([
    {
      id: '1',
      studentName: 'Priya Sharma',
      ideaTitle: 'Smart Irrigation System',
      description: 'IoT-based irrigation system for small farmers',
      score: 'green',
      sector: 'Agriculture',
      region: 'Maharashtra',
      type: 'rural',
      language: 'English',
      submissionDate: '2024-01-15',
      mentorStatus: 'approved',
      fundingReady: true
    },
    {
      id: '2',
      studentName: 'Rahul Patel',
      ideaTitle: 'Solar-Powered Cold Storage',
      description: 'Affordable cold storage solution for rural farmers',
      score: 'green',
      sector: 'Clean Energy',
      region: 'Gujarat',
      type: 'rural',
      language: 'Hindi',
      submissionDate: '2024-01-14',
      mentorStatus: 'approved',
      fundingReady: true
    },
    {
      id: '3',
      studentName: 'Sneha Reddy',
      ideaTitle: 'Telemedicine Platform',
      description: 'Remote healthcare consultation for rural areas',
      score: 'green',
      sector: 'Healthcare',
      region: 'Telangana',
      type: 'rural',
      language: 'Telugu',
      submissionDate: '2024-01-13',
      mentorStatus: 'reviewed',
      fundingReady: false
    }
  ])

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.ideaTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = filterSector === 'all' || idea.sector === filterSector
    const matchesRegion = filterRegion === 'all' || idea.region === filterRegion
    const matchesType = filterType === 'all' || idea.type === filterType
    
    return matchesSearch && matchesSector && matchesRegion && matchesType
  })

  const sectors = Object.keys(metrics.sectorDistribution)
  const regions = Object.keys(metrics.regionDistribution)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const exportData = (type: 'csv' | 'excel') => {
    console.log(`Exporting data as ${type}`)
    // Implement export functionality
  }

  const getTrendIcon = (growth: number) => {
    if (growth > 20) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (growth < -10) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold admin-gradient bg-clip-text text-transparent">
              Tata STRIVE Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Platform Analytics & Innovation Insights</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ideas">Idea Explorer</TabsTrigger>
            <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top-Level KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.totalSubmissions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rural vs Urban</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round((metrics.ruralUrbanSplit.rural / metrics.totalSubmissions) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rural participation rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Potential Ideas</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{metrics.scoreDistribution.green}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((metrics.scoreDistribution.green / metrics.totalSubmissions) * 100)}% success rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sectors</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{sectors.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {regions.length} regions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rural vs Urban Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Rural vs Urban Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Rural</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{metrics.ruralUrbanSplit.rural}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((metrics.ruralUrbanSplit.rural / metrics.totalSubmissions) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Urban</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{metrics.ruralUrbanSplit.urban}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((metrics.ruralUrbanSplit.urban / metrics.totalSubmissions) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Submission Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metrics.monthlyTrends.map((trend, index) => {
                      const maxSubmissions = Math.max(...metrics.monthlyTrends.map(t => t.submissions))
                      const percentage = (trend.submissions / maxSubmissions) * 100
                      return (
                        <div key={trend.month} className="flex items-center gap-4">
                          <div className="w-8 text-sm font-medium">{trend.month}</div>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-12 text-sm text-right">{trend.submissions}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sector Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Sectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topPerformingSectors.map((sector, index) => (
                    <div key={sector.sector} className="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{sector.sector}</div>
                        <div className="text-sm text-muted-foreground">
                          {sector.count} submissions • Avg Score: {sector.avgScore}/3.0
                        </div>
                      </div>
                      <Badge variant="outline">
                        {sector.avgScore > 2.0 ? 'High Performing' : 'Moderate'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Idea Quality Distribution</CardTitle>
                <CardDescription>Traffic-light scoring across all submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {metrics.scoreDistribution.green}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Green (High Potential)</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((metrics.scoreDistribution.green / metrics.totalSubmissions) * 100)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {metrics.scoreDistribution.yellow}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Yellow (Medium Potential)</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((metrics.scoreDistribution.yellow / metrics.totalSubmissions) * 100)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {metrics.scoreDistribution.red}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Red (Needs Work)</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((metrics.scoreDistribution.red / metrics.totalSubmissions) * 100)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Regional Distribution
                  <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.regionDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .map(([region, count]) => {
                      const percentage = (count / metrics.totalSubmissions) * 100
                      return (
                        <div key={region} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium">{region}</div>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm text-muted-foreground text-right">
                            {count} ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Sector Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Sector-wise Submission Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.sectorDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .map(([sector, count]) => {
                      const percentage = (count / metrics.totalSubmissions) * 100
                      return (
                        <div key={sector} className="flex items-center gap-4">
                          <div className="w-28 text-sm font-medium">{sector}</div>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm text-muted-foreground text-right">
                            {count} ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ideas Explorer Tab */}
          <TabsContent value="ideas" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter & Search Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search ideas or students..."
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
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rural/Urban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                      <SelectItem value="urban">Urban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Ideas List */}
            <div className="grid gap-4">
              {filteredIdeas.map((idea) => (
                <Card key={idea.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{idea.ideaTitle}</h3>
                          <Badge variant={idea.score === 'green' ? 'default' : idea.score === 'yellow' ? 'secondary' : 'destructive'}>
                            {idea.score.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{idea.sector}</Badge>
                          {idea.fundingReady && (
                            <Badge className="bg-green-100 text-green-800">Funding Ready</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          By <span className="font-medium">{idea.studentName}</span> • 
                          <MapPin className="inline h-3 w-3 ml-2 mr-1" />
                          {idea.region} ({idea.type}) • 
                          {new Date(idea.submissionDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {idea.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Mentor: {idea.mentorStatus}
                          </Badge>
                          <Badge variant="outline">{idea.language}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredIdeas.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Ideas Found</h3>
                  <p className="text-muted-foreground">
                    No ideas match your current search and filter criteria.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download filtered results for further analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => exportData('csv')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" onClick={() => exportData('excel')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends & Insights Tab */}
          <TabsContent value="trends" className="space-y-6">
            {/* Emerging Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Emerging Innovation Trends
                </CardTitle>
                <CardDescription>
                  Trending topics and patterns in recent submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {metrics.emergingTrends.map((trend, index) => (
                    <div key={trend.trend} className="flex items-center gap-4 p-4 bg-muted/30 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{trend.trend}</div>
                        <div className="text-sm text-muted-foreground">
                          Growing interest across multiple sectors
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(trend.growth)}
                          <span className="font-semibold text-green-600">+{trend.growth}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">vs last period</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regional Clusters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Innovation Clusters by Region
                </CardTitle>
                <CardDescription>
                  Regions showing high innovation potential and emerging patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border-l-4 border-l-green-500">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                      Maharashtra Innovation Hub
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Strong focus on agricultural technology and sustainable solutions
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">234 submissions</Badge>
                      <Badge variant="secondary">68% rural</Badge>
                      <Badge variant="secondary">Top: Agriculture</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-4 border-l-blue-500">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                      Karnataka Tech Corridor
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Technology-driven solutions with high urban participation
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">156 submissions</Badge>
                      <Badge variant="secondary">72% urban</Badge>
                      <Badge variant="secondary">Top: Technology</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md border-l-4 border-l-purple-500">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">
                      Gujarat Energy Innovation
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Leading in clean energy and manufacturing innovations
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">187 submissions</Badge>
                      <Badge variant="secondary">55% rural</Badge>
                      <Badge variant="secondary">Top: Clean Energy</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Program Impact Metrics</CardTitle>
                <CardDescription>
                  Key success indicators and program effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">24%</div>
                    <div className="text-sm text-muted-foreground">High-Quality Ideas</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Above industry benchmark of 18%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">53%</div>
                    <div className="text-sm text-muted-foreground">Rural Participation</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Exceeding 50% target
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
                    <div className="text-sm text-muted-foreground">Student Satisfaction</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Based on feedback surveys
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}