import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, Building2, CheckCircle2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export function SanctionLetterView() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSanctionDetails = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/api/v1/public/sanction/${applicationId}`)
        
        if (!response.ok) {
          throw new Error("Failed to load sanction letter or letter does not exist.")
        }
        
        const json = await response.json()
        setData(json.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSanctionDetails()
  }, [applicationId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10 print:bg-white">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10">
        <div className="p-8 text-center text-red-500 font-bold bg-white rounded-lg shadow-sm border border-red-100 max-w-md">
          <p className="mb-4 text-xl">Verification Failed</p>
          <p className="text-sm text-red-400 font-normal">{error}</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const verificationUrl = window.location.href

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0 font-sans">
      
      {/* Floating Action Bar - Hidden during print */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/50 print:hidden flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium hover:text-indigo-300 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
        <div className="w-px h-5 bg-slate-700"></div>
        <button onClick={handlePrint} className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
          <Printer className="mr-2 h-4 w-4" /> Download PDF
        </button>
      </div>

      {/* A4 Printable Container */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none print:m-0 relative box-border overflow-hidden">
        
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0">
          <div className="w-96 h-96 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-[20rem] text-indigo-900 blur-sm">
            V
          </div>
        </div>

        {/* Decorative Header Strip */}
        <div className="h-6 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-500 w-full relative z-10"></div>
        
        <div className="p-14 relative z-10">
          
          {/* Logo & Header */}
          <div className="flex justify-between items-start mb-14">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg border border-indigo-500/30">
                V
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">VisionKirana</h1>
                <p className="text-[11px] font-bold text-indigo-600 tracking-[0.2em] uppercase">Financial Services Pvt. Ltd.</p>
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-md border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Reference Number</p>
                <p className="font-mono text-sm text-slate-900 font-bold">{data.application_id.toUpperCase()}</p>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Date: <span className="text-slate-900 font-bold">{new Date(data.approval_details.issued_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Title with "Approved" Stamp */}
          <div className="relative mb-12 flex justify-center">
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] text-slate-800 border-b-2 border-indigo-600 pb-3 inline-block px-4">
              Loan Sanction Letter
            </h2>
            {/* Approved Stamp effect */}
            <div className="absolute top-1/2 left-[70%] -translate-y-1/2 rotate-[-15deg] border-4 border-emerald-500 text-emerald-500 font-black text-3xl uppercase tracking-widest px-4 py-1 rounded-lg opacity-20 pointer-events-none mix-blend-multiply">
              APPROVED
            </div>
          </div>

          <div className="space-y-6 text-slate-700 leading-relaxed text-[14px]">
            {/* Address Block */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-2/3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Issued To</p>
              <p className="font-medium">
                <span className="text-lg font-bold text-slate-900 block mb-1">{data.shop.owner_name}</span>
                <span className="font-semibold text-indigo-900">{data.shop.name}</span><br/>
                {data.shop.address}<br/>
                {data.shop.city}, {data.shop.state}<br/>
                <span className="inline-block mt-2 font-mono text-sm">Ph: +91 {data.shop.mobile}</span>
              </p>
            </div>

            <p className="pt-2">
              Dear <strong className="text-slate-900">{data.shop.owner_name}</strong>,
            </p>

            <p className="text-justify">
              We are pleased to inform you that based on your application and our AI-assisted credit evaluation, 
              your request for a business loan has been <strong className="text-emerald-600 font-bold">approved</strong>. 
              The financial accommodation is sanctioned under the following terms and conditions established by VisionKirana Financial Services.
            </p>

            {/* Loan Details Table */}
            <div className="my-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <th className="bg-slate-50/80 py-4 px-6 w-1/3 text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Type</th>
                    <td className="py-4 px-6 font-semibold text-slate-800">Business Term Loan</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-indigo-50/30">
                    <th className="bg-indigo-50/50 py-4 px-6 text-xs font-bold text-indigo-900 uppercase tracking-wider">Sanctioned Amount</th>
                    <td className="py-4 px-6 font-black text-2xl text-indigo-700 tracking-tight">₹{data.requested_amount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <th className="bg-slate-50/80 py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Declared Monthly Sales</th>
                    <td className="py-4 px-6 font-semibold text-slate-800">₹{data.shop.monthly_sales.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <th className="bg-slate-50/80 py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose of Loan</th>
                    <td className="py-4 px-6 font-medium text-slate-700">{data.purpose || "Business Expansion & Working Capital"}</td>
                  </tr>
                  <tr>
                    <th className="bg-slate-50/80 py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Disbursement Status</th>
                    <td className="py-4 px-6 font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Ready for Disbursal
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-justify text-[13px] text-slate-500 italic">
              * This sanction letter is electronically generated and digitally authorized. The facility is subject to 
              the execution of final loan agreements and compliance with the terms established by VisionKirana Financial Services.
              Any discrepancies in the provided information may result in the revocation of this sanction.
            </p>
          </div>

          {/* Footer Area - Signatures & QR */}
          <div className="mt-20 flex justify-between items-end border-t-2 border-slate-100 pt-8">
            
            {/* Signature Block */}
            <div className="w-72">
              <div className="h-20 relative flex items-end justify-center mb-4">
                <span className="font-['Brush_Script_MT',cursive] text-[2.75rem] text-indigo-900 -rotate-3 select-none absolute bottom-0">
                  {data.approval_details.officer_name}
                </span>
              </div>
              <div className="border-t-2 border-slate-800 pt-3 text-center">
                <p className="font-black text-slate-900 text-base">{data.approval_details.officer_name}</p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em] mt-1">Authorized Signatory</p>
                <div className="mt-3 bg-slate-100 py-1.5 px-3 rounded text-[9px] text-slate-500 font-mono flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Signature ID: {data.approval_details.officer_signature}
                </div>
              </div>
            </div>

            {/* Verification QR Code */}
            <div className="text-center flex flex-col items-center">
              <div className="bg-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-slate-200 mb-4">
                <QRCodeSVG value={verificationUrl} size={100} level="Q" fgColor="#1e1b4b" />
              </div>
              <p className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">Scan to Verify</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[160px] leading-relaxed font-medium">Authenticity verifiable via VisionKirana Portal</p>
            </div>
            
          </div>

        </div>
        
        {/* Footer Strip */}
        <div className="absolute bottom-0 w-full border-t border-slate-200 py-6 px-14 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-[11px] text-slate-500 gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>VisionKirana HQ, Tech Park, Bangalore</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <p className="text-[11px] text-slate-500 font-medium">support@visionkirana.com</p>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">VK-FIN-{new Date().getFullYear()}</p>
        </div>
        
      </div>
    </div>
  )
}
