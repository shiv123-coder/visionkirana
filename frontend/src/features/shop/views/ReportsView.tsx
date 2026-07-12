import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, PieChart } from "lucide-react"

export function ReportsView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial & Operational Reports</h2>
          <p className="text-sm text-muted-foreground">Download comprehensive statements and analytics for your business.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm flex flex-col items-center justify-center p-6 text-center bg-background hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Profit & Loss</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly income vs expenses summary</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => alert("Downloading Profit & Loss Statement (PDF)...")}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </Card>

        <Card className="border-border shadow-sm flex flex-col items-center justify-center p-6 text-center bg-background hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Tax Summary</h3>
          <p className="text-xs text-muted-foreground mb-4">GST and local tax calculations</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => alert("Downloading Tax Summary (CSV)...")}>
            <Download className="w-4 h-4 mr-2" /> Download CSV
          </Button>
        </Card>

        <Card className="border-border shadow-sm flex flex-col items-center justify-center p-6 text-center bg-background hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Inventory Audit</h3>
          <p className="text-xs text-muted-foreground mb-4">Complete stock level snapshot</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => alert("Downloading Inventory Audit (Excel)...")}>
            <Download className="w-4 h-4 mr-2" /> Download Excel
          </Button>
        </Card>

        <Card className="border-border shadow-sm flex flex-col items-center justify-center p-6 text-center bg-background hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Custom Report</h3>
          <p className="text-xs text-muted-foreground mb-4">Build a report with specific metrics</p>
          <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => alert("Opening Custom Report Builder...")}>
            Generate New
          </Button>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Past Downloads</h3>
        <Card className="border-border shadow-sm">
          <div className="divide-y divide-border">
            {[
              { name: "P&L Statement - Q2 2026", date: "Jul 10, 2026", type: "PDF" },
              { name: "Inventory Audit - End of Month", date: "Jun 30, 2026", type: "Excel" },
              { name: "GST Summary - June", date: "Jun 28, 2026", type: "CSV" },
            ].map((report, i) => (
              <div key={i} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                <div>
                  <h4 className="font-medium text-foreground text-sm">{report.name}</h4>
                  <p className="text-xs text-muted-foreground">{report.date} • {report.type}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-indigo-600" onClick={() => alert(`Re-downloading ${report.name}...`)}>
                  <Download className="w-4 h-4 mr-2" /> Re-download
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
