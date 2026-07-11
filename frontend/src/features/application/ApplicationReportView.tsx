import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, ShieldCheck, AlertTriangle, Info, MapPin, Store, Mic, FileText } from "lucide-react"
import { getApplicationReportApiV1ReportApplicationIdGet, getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet } from "@/client"
import "@/api-client"

export function ApplicationReportView() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data, error } = await getApplicationReportApiV1ReportApplicationIdGet({ path: { application_id: applicationId! } })
        
        if (error) throw new Error((error as any)?.detail || "Failed to generate report")
        
        setReport(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [applicationId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center print:hidden">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !report) {
    return <div className="p-8 text-center text-red-500 font-bold print:hidden">Error: {error}</div>
  }

  const handlePrint = () => {
    window.print()
  }

  const isApproved = report.risk_assessment.recommendation === "APPROVE"

  return (
    <div className="bg-muted/10 min-h-screen pb-12 print:bg-white print:pb-0">
      
      {/* Floating Action Bar - Hidden during print */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b shadow-sm print:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex space-x-4">
            <Button onClick={handlePrint} variant="premium">
              <Printer className="mr-2 h-4 w-4" /> Print / Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* A4 Printable Container */}
      <div className="container mx-auto px-4 mt-8 max-w-4xl print:p-0 print:m-0 print:max-w-none print:w-full">
        <div className="bg-card shadow-lg border rounded-xl overflow-hidden print:shadow-none print:border-none">
          
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-8 print:bg-gray-100 print:text-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">VisionKirana Intelligence Report</h1>
                <p className="text-primary-foreground/80 mt-1 print:text-gray-600">Generated automatically by AI Evaluation Engine</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold uppercase tracking-wider opacity-80">Application ID</div>
                <div className="text-2xl font-mono">#{report.application_id}</div>
                <div className="text-sm mt-2 opacity-80">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10 print:p-6 print:space-y-6">
            
            {/* 1. Final Recommendation */}
            <div className={`p-6 rounded-xl border-2 flex items-start space-x-4 ${isApproved ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} print:border-gray-300 print:bg-white`}>
              {isApproved ? <ShieldCheck className="w-10 h-10 text-green-600 flex-shrink-0" /> : <AlertTriangle className="w-10 h-10 text-orange-600 flex-shrink-0" />}
              <div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Final Recommendation: {report.risk_assessment.recommendation}</h2>
                <div className="mt-2 flex space-x-6">
                  <div>
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p className={`text-2xl font-black ${isApproved ? 'text-green-700' : 'text-orange-700'}`}>{report.risk_assessment.health_score} / 100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Category</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{report.risk_assessment.category}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Shop Profile */}
            <section>
              <h3 className="text-xl font-bold border-b pb-2 mb-4 flex items-center"><Store className="mr-2 w-5 h-5 text-primary"/> Shop Profile</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div><span className="text-muted-foreground">Shop Name:</span> <span className="font-medium">{report.shop_profile.name}</span></div>
                <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{report.shop_profile.owner}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{report.shop_profile.address}</span></div>
                <div><span className="text-muted-foreground">Years in Business:</span> <span className="font-medium">{report.shop_profile.years_in_business}</span></div>
                <div><span className="text-muted-foreground">Reported Sales:</span> <span className="font-medium">₹{report.shop_profile.monthly_sales.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Requested Loan:</span> <span className="font-medium">₹{report.shop_profile.requested_loan.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Purpose:</span> <span className="font-medium">{report.shop_profile.purpose}</span></div>
              </div>
            </section>

            {/* 3. AI Module Scores Grid */}
            <section>
              <h3 className="text-xl font-bold border-b pb-2 mb-4">Module Insights</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="print:shadow-none print:border-gray-200">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs uppercase text-muted-foreground">CV: Shelf Density</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 font-bold text-xl">{report.cv_analysis.shelf_density}%</CardContent>
                </Card>
                <Card className="print:shadow-none print:border-gray-200">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs uppercase text-muted-foreground">CV: Brand Diversity</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 font-bold text-xl">{report.cv_analysis.product_diversity}%</CardContent>
                </Card>
                <Card className="print:shadow-none print:border-gray-200">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs uppercase text-muted-foreground">OCR: Invoice Validity</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 font-bold text-xl">{report.ocr_analysis.invoice_activity}%</CardContent>
                </Card>
                <Card className="print:shadow-none print:border-gray-200">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs uppercase text-muted-foreground">Location Market</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 font-bold text-xl">{report.location_intelligence.market_area_score}%</CardContent>
                </Card>
              </div>
            </section>

            {/* 4. Qualitative Insights (Voice & OCR) */}
            <div className="grid md:grid-cols-2 gap-8 print:block print:space-y-6">
              <section className="print:break-inside-avoid">
                <h3 className="text-xl font-bold border-b pb-2 mb-4 flex items-center"><Mic className="mr-2 w-5 h-5 text-primary"/> Voice Intelligence</h3>
                {report.voice_analysis.length > 0 ? report.voice_analysis.map((vt: any, idx: number) => (
                  <div key={idx} className="mb-4 bg-muted/20 p-4 rounded-lg print:bg-white print:border">
                    <p className="text-sm font-medium mb-1">Business Summary</p>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">"{vt.summary}"</p>
                    <div className="mt-2 text-xs font-semibold text-primary">Sentiment: {vt.sentiment}</div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No voice data available.</p>}
              </section>

              <section className="print:break-inside-avoid">
                <h3 className="text-xl font-bold border-b pb-2 mb-4 flex items-center"><MapPin className="mr-2 w-5 h-5 text-primary"/> Location Metrics</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Competition Density (Higher is better)</span>
                    <span className="font-bold">{report.location_intelligence.competition_density_score}%</span>
                  </li>
                  <li className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Footfall Proxy Drivers</span>
                    <span className="font-bold">{report.location_intelligence.footfall_proxy_score}%</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* 4.5. Evidence Documents */}
            <section className="print:break-inside-avoid pt-4">
              <h3 className="text-xl font-bold border-b pb-2 mb-4 flex items-center"><FileText className="mr-2 w-5 h-5 text-primary"/> Evidence Documents</h3>
              {report.evidence_files && report.evidence_files.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.evidence_files.map((file: any) => (
                    <Button 
                      key={file.id} 
                      variant="outline" 
                      className="justify-start h-auto py-3 px-4 flex flex-col items-start gap-1"
                      onClick={async () => {
                        try {
                          const { data, error } = await getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet({
                            path: { document_id: file.id }
                          });
                          if (error) throw new Error("Failed to get secure URL");
                          window.open(data!.url, "_blank");
                        } catch (err) {
                          alert("Failed to securely load document.");
                        }
                      }}
                    >
                      <span className="font-semibold text-sm capitalize">{file.type.replace("_", " ")}</span>
                      <span className="text-xs text-muted-foreground uppercase">{file.category}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No evidence documents uploaded.</p>
              )}
            </section>

            {/* 5. Risk vs Positive Factors */}
            <section className="print:break-inside-avoid pt-4">
              <h3 className="text-xl font-bold border-b pb-2 mb-4">Risk Engine Factors</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 flex items-center mb-3"><ShieldCheck className="w-4 h-4 mr-1"/> Positive Indicators</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {report.risk_assessment.positive_factors.length > 0 
                      ? report.risk_assessment.positive_factors.map((f: string, i: number) => <li key={i}>{f}</li>)
                      : <li>No major positive deviations.</li>
                    }
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 flex items-center mb-3"><AlertTriangle className="w-4 h-4 mr-1"/> Risk Factors</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {report.risk_assessment.risk_factors.length > 0 
                      ? report.risk_assessment.risk_factors.map((f: string, i: number) => <li key={i}>{f}</li>)
                      : <li>No major risk factors detected.</li>
                    }
                  </ul>
                </div>
              </div>
            </section>
            
          </div>
          
          {/* Print Footer */}
          <div className="hidden print:block border-t p-4 text-center text-xs text-gray-400 mt-8">
            CONFIDENTIAL - Internal Use Only - VisionKirana AI Assessment
          </div>
          
        </div>
      </div>
    </div>
  )
}
