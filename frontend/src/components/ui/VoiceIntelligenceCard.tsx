import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Mic, Target, TrendingUp, AlertTriangle, FileText, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface VoiceTranscriptData {
  id: number
  file_url: string
  transcript_text?: string
  sentiment_score?: string
  business_summary?: string
  loan_purpose?: string
  challenges?: string
  future_plans?: string
}

interface VoiceIntelligenceCardProps {
  data: VoiceTranscriptData
  className?: string
}

export function VoiceIntelligenceCard({ data, className }: VoiceIntelligenceCardProps) {
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive": return "bg-green-100 text-green-800 border-green-200"
      case "negative": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const sections = [
    {
      title: "Business Summary",
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      content: data.business_summary,
      bg: "bg-blue-50"
    },
    {
      title: "Loan Purpose",
      icon: <Target className="w-5 h-5 text-indigo-500" />,
      content: data.loan_purpose,
      bg: "bg-indigo-50"
    },
    {
      title: "Identified Challenges",
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      content: data.challenges,
      bg: "bg-orange-50"
    },
    {
      title: "Future Plans",
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      content: data.future_plans,
      bg: "bg-emerald-50"
    }
  ]

  return (
    <Card className={cn("overflow-hidden border-2 border-primary/10 shadow-sm", className)}>
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Voice Intelligence</CardTitle>
              <CardDescription>AI-extracted insights from merchant audio</CardDescription>
            </div>
          </div>
          {data.sentiment_score && (
            <Badge variant="outline" className={cn("px-3 py-1", getSentimentColor(data.sentiment_score))}>
              Sentiment: {data.sentiment_score}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {data.transcript_text ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, idx) => (
                <div key={idx} className={cn("p-4 rounded-xl border border-black/5 flex flex-col", section.bg)}>
                  <div className="flex items-center space-x-2 mb-3">
                    {section.icon}
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                    {section.content || "No data extracted."}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Full Transcript
              </h4>
              <div className="bg-muted/20 p-4 rounded-lg border text-sm text-foreground/80 font-mono leading-relaxed">
                "{data.transcript_text}"
              </div>
            </div>
            
            {/* Audio playback control */}
            <div className="mt-4 flex items-center justify-between bg-card border rounded-full px-4 py-2 shadow-sm">
               <span className="text-sm font-medium">Source Audio</span>
               <audio controls src={data.file_url} className="h-8 w-64 outline-none" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
            <p className="text-muted-foreground font-medium">Processing audio intelligence...</p>
            <p className="text-xs text-muted-foreground/70 mt-1">This usually takes a few seconds.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
