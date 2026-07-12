import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, PieChart } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export function ReportsView() {
  const generatePDF = (filename: string) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("VisionKirana Profit & Loss Statement", 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    autoTable(doc, {
      startY: 40,
      head: [['Category', 'Amount (₹)', 'Percentage', 'Status']],
      body: [
        ['Total Revenue', '2,45,000', '100%', 'Excellent'],
        ['Cost of Goods Sold', '1,35,000', '55%', 'Normal'],
        ['Gross Profit', '1,10,000', '45%', 'Good'],
        ['Operating Expenses', '32,000', '13%', 'Normal'],
        ['Net Profit Before Tax', '78,000', '32%', 'Excellent'],
        ['Tax (GST/Local)', '14,040', '6%', 'Paid'],
        ['Net Profit After Tax', '63,960', '26%', 'Excellent'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10, cellPadding: 5 }
    })
    
    doc.save(filename)
  }

  const generateExcel = (filename: string) => {
    const data = [
      { "Item Code": "PRD-001", "Product Name": "Premium Basmati Rice", "Category": "Groceries", "Current Stock": 120, "Reorder Level": 50, "Unit Price (₹)": 450, "Total Value (₹)": 54000 },
      { "Item Code": "PRD-002", "Product Name": "Sunflower Oil 1L", "Category": "Groceries", "Current Stock": 15, "Reorder Level": 20, "Unit Price (₹)": 165, "Total Value (₹)": 2475 },
      { "Item Code": "PRD-003", "Product Name": "Toor Dal 1kg", "Category": "Pulses", "Current Stock": 45, "Reorder Level": 30, "Unit Price (₹)": 160, "Total Value (₹)": 7200 },
      { "Item Code": "PRD-004", "Product Name": "Whole Wheat Atta", "Category": "Groceries", "Current Stock": 0, "Reorder Level": 10, "Unit Price (₹)": 380, "Total Value (₹)": 0 },
      { "Item Code": "PRD-005", "Product Name": "Sugar 1kg", "Category": "Groceries", "Current Stock": 200, "Reorder Level": 50, "Unit Price (₹)": 45, "Total Value (₹)": 9000 },
    ]
    
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // Add column widths
    const wscols = [
      { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Audit")
    
    XLSX.writeFile(workbook, filename)
  }

  const generateCSV = (filename: string) => {
    const headers = ["Tax ID", "Tax Type", "Month", "Taxable Amount (₹)", "Tax Rate (%)", "Tax Amount (₹)", "Status"]
    const data = [
      ["TX-1001", "CGST", "June 2026", "120000", "9", "10800", "Paid"],
      ["TX-1002", "SGST", "June 2026", "120000", "9", "10800", "Paid"],
      ["TX-1003", "IGST", "June 2026", "45000", "18", "8100", "Pending"],
      ["TX-1004", "Local Municipal", "June 2026", "245000", "1", "2450", "Paid"],
    ]
    
    const csvContent = [headers.join(","), ...data.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          <Button variant="outline" size="sm" className="w-full" onClick={() => generatePDF("Profit_Loss_Statement.pdf")}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </Card>

        <Card className="border-border shadow-sm flex flex-col items-center justify-center p-6 text-center bg-background hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Tax Summary</h3>
          <p className="text-xs text-muted-foreground mb-4">GST and local tax calculations</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => generateCSV("Tax_Summary.csv")}>
            <Download className="w-4 h-4 mr-2" /> Download CSV
          </Button>
        </Card>

        <Card className="border-border shadow-sm flex flex-col items-center justify-center p-6 text-center bg-background hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Inventory Audit</h3>
          <p className="text-xs text-muted-foreground mb-4">Complete stock level snapshot</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => generateExcel("Inventory_Audit.xlsx")}>
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
                <Button variant="ghost" size="sm" className="h-8 text-indigo-600" onClick={() => {
                  if (report.type === "PDF") generatePDF(`${report.name.replace(/\s+/g, '_')}.pdf`)
                  else if (report.type === "Excel") generateExcel(`${report.name.replace(/\s+/g, '_')}.xlsx`)
                  else generateCSV(`${report.name.replace(/\s+/g, '_')}.csv`)
                }}>
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
