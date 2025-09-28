import { useState } from 'react'
import { ArrowLeft, Upload, FileText, Mic, PenTool, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SubmissionFormProps {
  method: 'text' | 'image' | 'audio' | 'sketch'
  onBack: () => void
  onSubmit: (data: any) => void
}

export default function SubmissionForm({ method, onBack, onSubmit }: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problem: '',
    solution: '',
    target: '',
    file: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    onSubmit(formData)
    setIsSubmitting(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const getMethodInfo = () => {
    switch (method) {
      case 'text':
        return {
          title: 'Text Submission',
          description: 'Describe your business idea in detail',
          icon: FileText,
          color: 'bg-blue-500'
        }
      case 'image':
        return {
          title: 'Upload Image/Document',
          description: 'Upload handwritten notes, sketches, or documents',
          icon: Upload,
          color: 'bg-green-500'
        }
      case 'audio':
        return {
          title: 'Audio Recording', 
          description: 'Record your business pitch in any language',
          icon: Mic,
          color: 'bg-purple-500'
        }
      case 'sketch':
        return {
          title: 'Sketch/Diagram',
          description: 'Draw your business model or concept',
          icon: PenTool,
          color: 'bg-orange-500'
        }
    }
  }

  const methodInfo = getMethodInfo()
  const Icon = methodInfo.icon

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${methodInfo.color} rounded-full flex items-center justify-center`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{methodInfo.title}</h1>
              <p className="text-sm text-muted-foreground">{methodInfo.description}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your business idea</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Idea Title</label>
                <Input
                  placeholder="e.g., Organic Farming Cooperative"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {method === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">What problem are you solving?</label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-entrepreneur"
                      placeholder="Describe the problem your business addresses..."
                      value={formData.problem}
                      onChange={(e) => setFormData(prev => ({ ...prev, problem: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your solution</label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-entrepreneur"
                      placeholder="How does your business solve this problem?"
                      value={formData.solution}
                      onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Target customers</label>
                    <Input
                      placeholder="Who are your customers?"
                      value={formData.target}
                      onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}

              {(method === 'image' || method === 'audio' || method === 'sketch') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload your {method === 'image' ? 'image/document' : method === 'audio' ? 'audio file' : 'sketch'}
                  </label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept={method === 'image' ? 'image/*,.pdf' : method === 'audio' ? 'audio/*' : 'image/*'}
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium">
                        {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {method === 'image' && 'PNG, JPG, PDF up to 10MB'}
                        {method === 'audio' && 'MP3, WAV, M4A up to 50MB'}
                        {method === 'sketch' && 'PNG, JPG, SVG up to 10MB'}
                      </p>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Additional details (optional)</label>
                <textarea
                  className="w-full min-h-[80px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-entrepreneur"
                  placeholder="Any additional information about your business idea..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Processing Info */}
          <Card className="border-entrepreneur/20 bg-entrepreneur/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-entrepreneur">
                <Sparkles className="h-5 w-5" />
                AI-Powered Analysis
              </CardTitle>
              <CardDescription>
                Our AI will analyze your submission and generate:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-entrepreneur rounded-full" />
                  Structured Business Model Canvas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-entrepreneur rounded-full" />
                  Viability Score & Feedback
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-entrepreneur rounded-full" />
                  Market Analysis & Recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-entrepreneur rounded-full" />
                  Localized Impact Assessment
                </li>
              </ul>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            variant="entrepreneur"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing with AI...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Business Idea
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}