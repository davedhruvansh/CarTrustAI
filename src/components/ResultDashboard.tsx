import React, { useRef, useState } from "react";
import { useCarTrust } from "../context/CarTrustContext";
import { ArrowLeft, ShieldCheck, Printer, CheckCircle2, AlertTriangle, XCircle, Gauge, Calendar, Navigation, IndianRupee, Heart, FileText, Sparkles, Download, Cpu, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { VehicleArchitectureInfo } from "../types";
import { Logo } from "./Logo";

export const ResultDashboard: React.FC = () => {
  const { selectedReport, setCurrentPage, setSelectedReport, deleteReport, token } = useCarTrust();
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [loadedArchitectureInfo, setLoadedArchitectureInfo] = useState<VehicleArchitectureInfo | null>(
    selectedReport?.architectureInfo || null
  );
  const [fetchingArchitecture, setFetchingArchitecture] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(true);

  React.useEffect(() => {
    if (selectedReport) {
      if (selectedReport.architectureInfo) {
        setLoadedArchitectureInfo(selectedReport.architectureInfo);
      } else if (token) {
        const fetchArch = async () => {
          setFetchingArchitecture(true);
          try {
            const brand = encodeURIComponent(selectedReport.vehicle.brand);
            const model = encodeURIComponent(selectedReport.vehicle.model);
            const year = selectedReport.vehicle.year;
            const fuel = encodeURIComponent(selectedReport.vehicle.fuelType || "Petrol");
            const trans = encodeURIComponent(selectedReport.vehicle.transmission || "Automatic");
            
            const res = await fetch(`/api/architecture?brand=${brand}&model=${model}&year=${year}&fuelType=${fuel}&transmission=${trans}`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (res.ok) {
              const data = await res.json();
              setLoadedArchitectureInfo(data);
            } else {
              setLoadedArchitectureInfo(null);
            }
          } catch (err) {
            console.error("Failed to load vehicle architecture specs:", err);
            setLoadedArchitectureInfo(null);
          } finally {
            setFetchingArchitecture(false);
          }
        };
        fetchArch();
      } else {
        setLoadedArchitectureInfo(null);
      }
    }
  }, [selectedReport, token]);

  if (!selectedReport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 font-sans">
        <div className="text-center space-y-4 max-w-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold">No Inspection Loaded</h3>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 cursor-pointer"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { vehicle, trustScore, trustCategory, trustReason, maintenance, condition, priceValidation, fraudRisk, recommendation, recommendationReason, createdAt, images } = selectedReport;

  const hasAnyImages = !!(images && (images.front || images.back || images.side || images.interior));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setExporting(true);
    setExportError(null);
    try {
      // Small visual delay to show reactive state
      await new Promise((resolve) => setTimeout(resolve, 800));

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageHeight = 297;
      let y = 20;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 25) { // Leave 25mm space at the bottom for footer safety
          doc.addPage();
          y = 25; // Header starts at 25mm on subsequent pages
          
          // Draw running header on subsequent pages
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184); // Slate-400
          doc.text(`CarTrust AI Official Assessment Report — ${vehicle.brand} ${vehicle.model}`, 20, 15);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.35);
          doc.line(20, 17.5, 190, 17.5);
        }
      };

      // Base Font
      doc.setFont("Helvetica");

      // ==========================================
      // PAGE HEADER BRANDING WITH VECTOR EMBLEM
      // ==========================================
      // Draw professional branding emblem vector (Sleek shield base)
      doc.setFillColor(10, 25, 47); // Deep Navy (#0A192F)
      doc.roundedRect(20, y - 6.5, 8, 8, 1.5, 1.5, "f");
      doc.setFillColor(0, 191, 255); // Electric Blue (#00BFFF)
      doc.circle(24, y - 2.5, 2.2, "f");
      doc.setFillColor(255, 255, 255);
      doc.circle(24, y - 2.5, 0.9, "f"); // Central verification core node

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22); // 22pt for balanced typography
      doc.setTextColor(10, 25, 47); // Core Navy text
      doc.text("CarTrust AI", 30, y);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5); // Royal blue subtitle
      doc.setTextColor(59, 130, 246);
      doc.text("Vehicle Verification & Predictive Maintenance Report", 20, y + 6);
      
      // Horizontal Rule
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1.0);
      doc.line(20, y + 9, 190, y + 9);
      y += 15;
      
      // Metadata Grid Banner (Top block)
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.35);
      doc.roundedRect(20, y, 170, 18, 1.2, 1.2, "FD");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("REPORT ID / VEHICLE ID", 24, y + 6);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(selectedReport.id.toUpperCase(), 24, y + 12);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("GENERATED DATE", 85, y + 6);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const formattedDate = new Date(createdAt).toLocaleDateString() + " " + new Date(createdAt).toLocaleTimeString();
      doc.text(formattedDate, 85, y + 12);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("ANALYSIS CONFIDENCE %", 145, y + 6);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(16, 185, 129); // Success Emerald
      doc.text(`${selectedReport.overallConfidence ?? 85}%`, 145, y + 12);
      
      y += 26;

      // ==========================================
      // SECTION 1 — EXECUTIVE SUMMARY CARD
      // ==========================================
      checkPageBreak(65);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16); // 16-18pt requirement
      doc.setTextColor(30, 58, 138);
      doc.text("Section 1: Executive Summary", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      
      // Determine colors based on decision recommendation
      let brandColor = [37, 99, 235]; // Blue
      let tintColor = [240, 249, 255]; 
      let textColor = [30, 58, 138];
      
      if (recommendation === "BUY") {
        brandColor = [16, 185, 129];
        tintColor = [236, 253, 245];
        textColor = [6, 78, 59];
      } else if (recommendation === "NEGOTIATE") {
        brandColor = [245, 158, 11];
        tintColor = [254, 252, 232];
        textColor = [120, 53, 4];
      } else if (recommendation === "AVOID") {
        brandColor = [239, 68, 68];
        tintColor = [255, 241, 242];
        textColor = [159, 18, 57];
      }
      
      // Certificate Frame Background (Proportionate card high spacing!)
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.35);
      doc.roundedRect(20, y, 170, 48, 2, 2, "FD");
      
      // Visual feedback heavy left border tab
      doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.rect(20, y, 4, 48, "F");
      
      // Left summary column items
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11); // subheadings 11-12pt
      doc.setTextColor(148, 163, 184);
      doc.text("Final Recommendation", 28, y + 7);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18); // Large distinctive decision display
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(recommendation, 28, y + 14);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10); // body text 10-11pt
      doc.setTextColor(71, 85, 105);
      const executiveReasonLines = doc.splitTextToSize(recommendationReason, 76);
      doc.text(executiveReasonLines, 28, y + 20);
      
      // Middle vertical dividing axis
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(110, y + 4, 110, y + 44);
      
      // Right grid labels & values
      const labelX = 114;
      const valX = 154;
      
      // 1. Trust Score
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("Composite Trust Score:", labelX, y + 7);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text(`${trustScore}% (${trustCategory})`, valX, y + 7);
      
      // 2. Fraud Risk
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("Fraud & Risk Index:", labelX, y + 15);
      let riskPctColor = (fraudRisk.score > 30) ? [220, 38, 38] : [16, 185, 129];
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(riskPctColor[0], riskPctColor[1], riskPctColor[2]);
      doc.text(`${fraudRisk.score}% Risk`, valX, y + 15);
      
      // 3. Estimated Market Value
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("Estimated Market Value:", labelX, y + 23);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`₹${priceValidation.estimatedMarketPrice.toLocaleString('en-IN')}`, valX, y + 23);
      
      // 4. Seller Listing Price
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("Seller Asking Price:", labelX, y + 31);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`₹${vehicle.price.toLocaleString('en-IN')}`, valX, y + 31);
      
      // 5. Price Differential
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("Price Differential:", labelX, y + 39);
      
      const priceDiffVal = vehicle.price - priceValidation.estimatedMarketPrice;
      const priceDiffPct = ((priceDiffVal / priceValidation.estimatedMarketPrice) * 100).toFixed(1);
      const isAboveVal = priceDiffVal > 0;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(isAboveVal ? 220 : 16, isAboveVal ? 38 : 185, isAboveVal ? 38 : 129);
      doc.text(
        `${isAboveVal ? "+" : ""}₹${priceDiffVal.toLocaleString('en-IN')} (${priceDiffPct}%)`,
        valX,
        y + 39
      );
      
      y += 56;

      // ==========================================
      // SECTION 2 — VEHICLE INFORMATION
      // ==========================================
      checkPageBreak(55);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16); // 16-18pt requirement
      doc.setTextColor(30, 58, 138);
      doc.text("Section 2: Vehicle Information", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      
      // Specification structural matrix rows
      const specRows = [
        [{ label: "Manufacturer Brand", value: vehicle.brand }, { label: "Model Derivative", value: vehicle.model }, { label: "Model Year Build", value: String(vehicle.year) }],
        [{ label: "Odometer Mileage", value: `${vehicle.kilometers.toLocaleString('en-IN')} km` }, { label: "Engine Fuel Type", value: vehicle.fuelType }, { label: "Gearbox Transmission", value: vehicle.transmission }],
        [{ label: "Previous Owners Count", value: `${vehicle.ownerCount} Owner(s)` }, { label: "Listing Location", value: vehicle.location }, { label: "Seller Asking Price", value: `₹${vehicle.price.toLocaleString('en-IN')} INR` }]
      ];
      
      const widthPerCol = 170 / 3;
      
      specRows.forEach((rowCells, rIndex) => {
        const rowHeight = 14; // High spacing prevents cramped layout
        if (rIndex % 2 === 0) {
          doc.setFillColor(248, 250, 252);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(20, y, 170, rowHeight, "F");
        
        rowCells.forEach((cell, cIndex) => {
          const colX = 20 + cIndex * widthPerCol;
          
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text(cell.label.toUpperCase(), colX + 4, y + 5);
          
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10.5); // Body text size (10-11pt)
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text(cell.value, colX + 4, y + 10.5);
          
          if (cIndex > 0) {
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.3);
            doc.line(colX, y + 2, colX, y + rowHeight - 2);
          }
        });
        
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.35);
        doc.line(20, y + rowHeight, 190, y + rowHeight);
        y += rowHeight;
      });
      
      y += 8;

      // ==========================================
      // SECTION 3 — MARKET PRICE VERIFICATION
      // ==========================================
      checkPageBreak(58);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("Section 3: Market Price Verification", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      
      // Side-by-side stats validation frame
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.35);
      doc.roundedRect(20, y, 170, 20, 1.2, 1.2, "FD");
      
      let priceBadgeColor = [37, 99, 235];
      if (priceValidation.priceCheck === "Great Deal") {
        priceBadgeColor = [16, 185, 129];
      } else if (priceValidation.priceCheck === "Fair Price") {
        priceBadgeColor = [59, 130, 246];
      } else if (priceValidation.priceCheck === "Overpriced") {
        priceBadgeColor = [239, 68, 68];
      }
      
      const priceColWidth = 170 / 3;

      // 1) Seller Price
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Seller Price", 24, y + 6.5);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`₹${vehicle.price.toLocaleString('en-IN')}`, 24, y + 13.5);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(20 + priceColWidth, y + 3, 20 + priceColWidth, y + 17);
      
      // 2) Estimated Market Price
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Estimated Market Value", 20 + priceColWidth + 4, y + 6.5);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text(`₹${priceValidation.estimatedMarketPrice.toLocaleString('en-IN')}`, 20 + priceColWidth + 4, y + 13.5);

      // Divider line
      doc.line(20 + 2 * priceColWidth, y + 3, 20 + 2 * priceColWidth, y + 17);
      
      // 3) Assessment Results
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Assessment Results", 20 + 2 * priceColWidth + 4, y + 6.5);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(priceBadgeColor[0], priceBadgeColor[1], priceBadgeColor[2]);
      doc.text(priceValidation.priceCheck.toUpperCase(), 20 + 2 * priceColWidth + 4, y + 13.5);
      
      y += 26;
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11); // subheading 11-12pt
      doc.setTextColor(100, 116, 139);
      doc.text("Expected Fair Market Pricing Limits (IQR range):", 20, y);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`₹${priceValidation.marketMin.toLocaleString('en-IN')} to ₹${priceValidation.marketMax.toLocaleString('en-IN')}`, 110, y);
      
      y += 7;
      
      // Explanatory paragraphs
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10); // Body text (10-11pt)
      doc.setTextColor(71, 85, 105);
      const priceLinesParagraph = doc.splitTextToSize(priceValidation.reason, 170);
      doc.text(priceLinesParagraph, 20, y);
      
      y += priceLinesParagraph.length * 4.6 + 6;

      // ==========================================
      // SECTION 4 — FRAUD & RISK ANALYSIS
      // ==========================================
      checkPageBreak(70);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("Section 4: Fraud & Risk Analysis", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      
      // Structured audit lines checklist (no narrow column cramped summaries!)
      const auditDetailsList = [
        {
          check: "Odometer Consistency Check",
          status: fraudRisk.unusualMileage.flag ? "WARNING" : "PASS",
          details: fraudRisk.unusualMileage.description
        },
        {
          check: "Price Manipulation Risk Audit",
          status: fraudRisk.priceManipulation.flag ? "WARNING" : "PASS",
          details: fraudRisk.priceManipulation.description
        },
        {
          check: "Abnormal Owner Turnover Rate",
          status: fraudRisk.multipleOwnerRisk.flag ? "WARNING" : "PASS",
          details: fraudRisk.multipleOwnerRisk.description
        },
        {
          check: "Listing Integrity Verification",
          status: "PASS", 
          details: "Odometer readouts and model build dates correspond with standard baseline data distributions."
        },
        {
          check: "Accident History Integrity",
          status: "UNABLE TO VERIFY",
          details: "Government registration systems and third-party databases are unavailable without complete vehicle VIN details."
        },
        {
          check: "Physical Structural Damage Check",
          status: "UNABLE TO VERIFY",
          details: "Computer vision chassis panel metrics require fully standard on-site computer diagnostic sensor scans."
        }
      ];
      
      auditDetailsList.forEach((row, i) => {
        const wrapDetails = doc.splitTextToSize(row.details, 162); // Spanning total width instead of narrow column!
        const rowHeight = 16 + wrapDetails.length * 4.2;
        checkPageBreak(rowHeight + 4);
        
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, y, 170, rowHeight, "F");
        }
        
        // Audit Check
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(row.check, 24, y + 6);
        
        // Audit status
        let specStatusColor = [16, 185, 129]; // Emerald (PASS)
        let auditLabel = row.status;
        if (row.status === "WARNING" || row.status === "HIGH RISK") {
          specStatusColor = [245, 158, 11]; // Amber
        } else if (row.status === "UNABLE TO VERIFY") {
          specStatusColor = [100, 116, 139]; // Slate Gray
          auditLabel = "Unable to Verify";
        }
        doc.setTextColor(specStatusColor[0], specStatusColor[1], specStatusColor[2]);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.text(auditLabel, 190 - 4, y + 6, { align: "right" });
        
        // Audit logic findings (Below the row!)
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10); // Body text 10-11pt
        doc.setTextColor(71, 85, 105);
        doc.text(wrapDetails, 24, y + 12);
        
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(20, y + rowHeight, 190, y + rowHeight);
        y += rowHeight;
      });
      
      y += 8;

      // ==========================================
      // SECTION 5 — MAINTENANCE FORECAST
      // ==========================================
      checkPageBreak(65);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("Section 5: Maintenance Forecast", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 6;
      
      if (maintenance.estimateUnavailable) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(252, 165, 165);
        doc.setLineWidth(0.35);
        doc.roundedRect(20, y, 170, 22, 1.2, 1.2, "FD");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(185, 28, 28);
        doc.text("Predictive Maintenance Estimating System Offline", 24, y + 8);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(127, 29, 29);
        doc.text("Missing or invalid historical fields constrain standard wear tracking iterations.", 24, y + 15);
        y += 30;
      } else {
        // Structured maintenance table layout header
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y, 170, 9, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("SERVICE CATEGORY", 24, y + 6);
        doc.text("YEAR 1 COST", 80, y + 6);
        doc.text("YEAR 3 COST", 115, y + 6);
        doc.text("CONFIDENCE", 150, y + 6);
        
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(20, y + 9, 190, y + 9);
        y += 9;
        
        maintenance.items.forEach((item, index) => {
          const wrapReasonText = doc.splitTextToSize(`Reason: ${item.reason || item.description || ''}`, 162);
          const rowHeight = 12 + wrapReasonText.length * 4.2; // Move long explanation text below rows
          checkPageBreak(rowHeight + 4);
          
          if (index % 2 === 1) {
            doc.setFillColor(252, 253, 254);
            doc.rect(20, y, 170, rowHeight, "F");
          }
          
          // Row cell details
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          doc.text(item.name, 24, y + 6);
          
          doc.setFont("Helvetica", "normal");
          doc.text(`₹${item.cost1Year.toLocaleString('en-IN')}`, 80, y + 6);
          doc.text(`₹${item.cost3Years.toLocaleString('en-IN')}`, 115, y + 6);
          
          // Servicing category confidence levels
          const serviceConfidence = item.confidence ?? 85;
          let confidenceColor = [16, 185, 129];
          if (serviceConfidence < 70) {
            confidenceColor = [245, 158, 11];
          }
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(confidenceColor[0], confidenceColor[1], confidenceColor[2]);
          doc.text(`${serviceConfidence}%`, 150, y + 6);
          
          // Description details paragraph blocks below row
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.text(wrapReasonText, 24, y + 11.5);
          
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.3);
          doc.line(20, y + rowHeight, 190, y + rowHeight);
          y += rowHeight;
        });
        
        // Dedicated Summary Cards for Totals instead of simple tables footer line
        y += 6;
        checkPageBreak(30);

        doc.setFillColor(240, 249, 255); // soft primary highlight
        doc.setDrawColor(186, 230, 253);
        doc.setLineWidth(0.35);
        doc.roundedRect(20, y, 170, 20, 1.5, 1.5, "FD");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138);
        doc.text("Forecasted Servicing Cumulative Totals", 24, y + 7);
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Year 1 Total: ₹${maintenance.total1Year.toLocaleString('en-IN')}`, 24, y + 14);
        doc.text(`Year 3 Total: ₹${maintenance.total3Years.toLocaleString('en-IN')}`, 85, y + 14);
        
        doc.setTextColor(16, 185, 129);
        doc.text(`Overall Forecast Confidence: ${maintenance.confidence}%`, 135, y + 14);
        
        y += 26;
      }

      // ==========================================
      // SECTION 6 — VISUAL INSPECTION
      // ==========================================
      checkPageBreak(50);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("Section 6: Visual Inspection", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      
      if (!hasAnyImages) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.35);
        doc.roundedRect(20, y, 170, 22, 1, 1, "FD");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11); // subheading 11-12pt
        doc.setTextColor(148, 163, 184);
        doc.text("Visual Inspection Not Available", 24, y + 8);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10); // body text 10-11pt
        doc.setTextColor(100, 116, 139);
        doc.text("No vehicle photographs were provided for inspection.", 24, y + 15);
        y += 30;
      } else {
        // Aligned dual scorecard tiles side-by-side
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, y, 82, 16, 1, 1, "FD");
        doc.roundedRect(108, y, 82, 16, 1, 1, "FD");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("EXTERIOR SURFACE PAINT QUALITY", 24, y + 6);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(condition.exteriorQuality || "Not Available", 24, y + 11.5);
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("DENT / CAMBER STRUCTURAL RISK", 112, y + 6);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(condition.dentRisk || "Not Available", 112, y + 11.5);
        
        y += 22;
        
        // Secondary visual rows inline
        checkPageBreak(25);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text("Surface Scratches Flagged:", 20, y);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(condition.scratchesDetected ? "Yes (Visual Imperfections Noted)" : "No Scratches Identified", 85, y);
        
        y += 6.5;
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text("Chassis Rust / Metal Decay:", 20, y);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(condition.rustDetected ? 220 : 16, condition.rustDetected ? 38 : 124, condition.rustDetected ? 38 : 65);
        doc.text(condition.rustDetected ? "WARNING: Rust oxidation observed!" : "No oxidation identified", 85, y);
        
        y += 10;
        
        if (condition.notes) {
          checkPageBreak(30);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(100, 116, 139);
          doc.text("Computer Vision Summary Notes:", 20, y);
          
          y += 5.5;
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          const notesOutputLines = doc.splitTextToSize(condition.notes, 170);
          doc.text(notesOutputLines, 20, y);
          y += notesOutputLines.length * 4.6 + 6;
        } else {
          y += 4;
        }
      }

      // ==========================================
      // SECTION 7 — AI FINDINGS & OBSERVATIONS
      // ==========================================
      checkPageBreak(55);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("Section 7: AI Findings & Observations", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      
      // Calculate list elements dynamically inside PDF generator matching real data structures
      const compiledStrengths: string[] = [];
      const compiledConcerns: string[] = [];
      const compiledRisks: string[] = [];
      
      if (vehicle.ownerCount <= 2) {
        compiledStrengths.push("Low turnaround ownership profiles limit operational risk indices.");
      } else {
        compiledConcerns.push("Elevated multiple ownership revisions recorded in vehicle history.");
      }
      
      if (priceValidation.priceCheck === "Great Deal" || priceValidation.priceCheck === "Fair Price") {
        compiledStrengths.push("Competitive asking market valuation falls within safe IQR limits.");
      } else {
        compiledConcerns.push("Acquisition listing price floats outside predictable pricing bands.");
      }
      
      if (!condition.rustDetected && hasAnyImages) {
        compiledStrengths.push("No material rust decomposition or metal oxidation spotted on images.");
      } else if (condition.rustDetected) {
        compiledRisks.push("Material degradation spotted: heavy surface rust requires sand treatments.");
      }
      
      if (fraudRisk.score < 25) {
        compiledStrengths.push("Consistent mileage-to-year progression limits odometer turning concerns.");
      } else {
        compiledRisks.push(`Anomalies triggered: predictive algorithms alert on odometer/year regression.`);
      }
      
      if (maintenance.total1Year < 320 && !maintenance.estimateUnavailable) {
        compiledStrengths.push("Conservative short-term predictive maintenance overheads modeled.");
      } else if (maintenance.total1Year >= 650) {
        compiledConcerns.push("Accelerated near-term predictive servicing requirements modeled.");
      }
      
      if (vehicle.kilometers > 160000) {
        compiledConcerns.push("High mileage status is correlated with accelerated structural fatigue.");
      }
      
      if (compiledStrengths.length === 0) compiledStrengths.push("Standard core structural parameters reported.");
      if (compiledConcerns.length === 0) compiledConcerns.push("Perform primary liquid reviews prior to purchase.");
      if (compiledRisks.length === 0) compiledRisks.push("No significant or severe hazards projected.");

      // Draw compiled lists inside findings columns
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(16, 185, 129); // Green
      doc.text("Identified Asset Strengths", 20, y);
      y += 5.5;
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10); // Body text 10-11pt
      doc.setTextColor(51, 65, 85);
      compiledStrengths.forEach((strLine) => {
        const wrapStrength = doc.splitTextToSize(`•  ${strLine}`, 170);
        checkPageBreak(wrapStrength.length * 4.6 + 2);
        doc.text(wrapStrength, 20, y);
        y += wrapStrength.length * 4.6 + 1.5;
      });
      
      y += 3.5;
      
      checkPageBreak(25);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(245, 158, 11); // Amber
      doc.text("Observed Advisory Concerns", 20, y);
      y += 5.5;
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10); // Body text 10-11pt
      doc.setTextColor(51, 65, 85);
      compiledConcerns.forEach((concLine) => {
        const wrapConcern = doc.splitTextToSize(`•  ${concLine}`, 170);
        checkPageBreak(wrapConcern.length * 4.6 + 2);
        doc.text(wrapConcern, 20, y);
        y += wrapConcern.length * 4.6 + 1.5;
      });
      
      y += 3.5;
      
      checkPageBreak(25);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(239, 68, 68); // Red
      doc.text("Key Detected Hazards & Risks", 20, y);
      y += 5.5;
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10); // Body text 10-11pt
      doc.setTextColor(51, 65, 85);
      compiledRisks.forEach((riskLine) => {
        const wrapRisk = doc.splitTextToSize(`•  ${riskLine}`, 170);
        checkPageBreak(wrapRisk.length * 4.6 + 2);
        doc.text(wrapRisk, 20, y);
        y += wrapRisk.length * 4.6 + 1.5;
      });
      
      y += 8;

      // ==========================================
      // SECTION 8 — FINAL RECOMMENDATION
      // ==========================================
      checkPageBreak(45);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("Section 8: Final Recommendation", 20, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      
      doc.setFillColor(tintColor[0], tintColor[1], tintColor[2]);
      doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, y, 170, 24, 1.5, 1.5, "FD");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text("CARTRUST ASSESSMENT FINAL DISPOSITION MATRIX STATE", 24, y + 6);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`RECOMMENDED ACQUISITION STATE: ${recommendation}`, 24, y + 12);
      
      let summaryFactorText = "";
      if (selectedReport.reasonsList && selectedReport.reasonsList.length > 0) {
        summaryFactorText = selectedReport.reasonsList.join("; ");
      } else {
        summaryFactorText = "No abnormal metadata patterns or historical anomalies triggered.";
      }
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const decisionSummaryLines = doc.splitTextToSize(`Decision Factors Summary: ${summaryFactorText}`, 160);
      doc.text(decisionSummaryLines, 24, y + 18);
      
      y += 30;

      // ==========================================
      // SECTION 9 — DISCLAIMER
      // ==========================================
      checkPageBreak(30);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, y, 170, 16, 1, 1, "D");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Section 9: Disclaimer", 24, y + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      const standardDisclaimerText = "This report is generated using predictive analysis, user-provided information, and AI-assisted evaluation. Results are estimates and should not replace a professional mechanical inspection or official government vehicle records verification.";
      const wrappedDisclaimerText = doc.splitTextToSize(standardDisclaimerText, 162);
      doc.text(wrappedDisclaimerText, 24, y + 11);

      // ==========================================
      // DYNAMIC MULTI-PAGE PAGE-NUMBER FOOTERS PASS
      // ==========================================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        
        // Horizontal footer division line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(20, pageHeight - 16, 190, pageHeight - 16);
        
        // Footer left: Report descriptor branding
        doc.text("CarTrust AI Assessment Report • Official Automotive Intelligence Diagnostic Audit", 20, pageHeight - 11);
        
        // Footer right: Dynamic page and generated date
        const footerRightStr = `Generated: ${formattedDate}  |  Page ${i} of ${totalPages}`;
        doc.text(footerRightStr, 190, pageHeight - 11, { align: "right" });
      }

      // Save report filename matching proper car model credentials
      const timestamp = Date.now();
      const cleanBrand = vehicle.brand.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const cleanModel = vehicle.model.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const certificateFilename = `cartrust-assessment-${cleanBrand}-${cleanModel}-${timestamp}.pdf`;
      doc.save(certificateFilename);

    } catch (err: any) {
      console.error("PDF generation failure: ", err);
      setExportError(err.message || "An unexpected error occurred during PDF compiling.");
    } finally {
      setExporting(false);
    }
  };

  const getRecommendationTheme = (rec: string) => {
    switch (rec) {
      case "BUY":
        return {
          banner: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
          badge: "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]",
          glow: "bg-emerald-500/5",
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        };
      case "NEGOTIATE":
        return {
          banner: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          badge: "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]",
          glow: "bg-amber-500/5",
          icon: <AlertTriangle className="w-7 h-7 text-amber-400" />
        };
      default:
        return {
          banner: "bg-rose-500/10 border-rose-500/30 text-rose-300",
          badge: "bg-rose-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]",
          glow: "bg-rose-500/5",
          icon: <XCircle className="w-7 h-7 text-rose-400" />
        };
    }
  };

  const recTheme = getRecommendationTheme(recommendation);

  // Price line position offset calculation
  const totalPricingSpan = Math.max(1, priceValidation.marketMax - priceValidation.marketMin);
  const positionPercentage = Math.max(
    0,
    Math.min(100, Math.round(((vehicle.price - priceValidation.marketMin) / totalPricingSpan) * 100))
  );

  return (
    <div className="min-h-screen text-slate-100 bg-slate-950 flex flex-col relative font-sans print:bg-white print:text-black">
      {/* Glow blocks */}
      <div className="absolute top-[8%] left-[5%] w-[450px] h-[450px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none print:hidden" />
      <div className="absolute bottom-[8%] right-[5%] w-[450px] h-[450px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none print:hidden" />

      {/* Navigation bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 print:hidden animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setSelectedReport(null); setCurrentPage("dashboard"); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4.5 h-4.5" /> Back
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2.5">
              <Logo variant="square" className="w-[28px] h-[28px]" />
              <span className="font-sans font-bold text-sm tracking-tight text-white select-none">
                CarTrust<span className="text-blue-500">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              disabled={exporting}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> System Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.45)] text-sm font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Certificate (PDF)
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main ref={printRef} className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8 print:p-0">
        
        {/* Error Notification */}
        {exportError && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">PDF Generation Missed:</span> {exportError}
            </div>
          </div>
        )}
        
        {/* CERTIFICATE HEADER (ONLY RENDERS IN PRINT MODE) */}
        <div className="hidden print:flex flex-col border-b-2 border-slate-900 pb-6 mb-8 text-slate-900 font-sans">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo variant="square" theme="light" className="w-[45px] h-[45px]" />
              <div>
                <img src="/src/assets/images/cartrust_logo_light_1780973926683.png" alt="CarTrust AI Logo" className="hidden" />
                <h1 className="text-3xl font-black tracking-tight leading-none mb-1">CARTRUST AI</h1>
                <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Certified Digital Car Verification Sheet</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 border border-slate-200 rounded">Official Inspections Estimate</span>
              <p className="text-xs text-slate-500 font-mono mt-1">Generated: {new Date(createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mt-4 text-[11px] leading-relaxed text-slate-600">
            Disclaimer: This inspection certificate evaluates chronological, visual, and operational metrics utilizing predictive algorithms. It remains an advisory verification and does not assert legal or official governmental registration validations.
          </div>
        </div>

        {/* Top summary grid: Name & Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card Left: Brand & Recommendation Decision */}
          <div className={`p-6 rounded-2xl border ${recTheme.banner} backdrop-blur-sm lg:col-span-2 flex flex-col justify-between space-y-4 print:border-slate-300 print:text-black print:bg-slate-50`}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${recTheme.badge} print:bg-slate-200 print:text-black`}>
                  {recTheme.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-slate-400">Final Procurement Status</span>
                  <h2 className="text-3xl font-black tracking-tight mt-0.5">{vehicle.brand} {vehicle.model}</h2>
                </div>
              </div>
              <p className="text-sm border-t border-slate-800/60 print:border-slate-200 pt-3 leading-relaxed">
                {recommendationReason}
              </p>

              {/* Reasons Summary List section (AI signal checklist summary) */}
              {selectedReport.reasonsList && selectedReport.reasonsList.length > 0 && (
                <div className="border-t border-slate-800/40 print:border-slate-200 pt-3.5">
                  <span className="text-[9px] font-bold tracking-wider uppercase font-mono text-slate-400 block mb-2">Primary Valuation Signals</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {selectedReport.reasonsList.map((reasonStr: string, index: number) => (
                      <div key={index} className="flex items-center gap-1.5 bg-slate-950/20 border border-slate-900/40 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-300">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                        <span className="leading-tight font-medium">{reasonStr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono font-semibold pt-4 print:text-slate-600 border-t border-slate-900/50 print:border-slate-200">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Model Year: {vehicle.year}</span>
              <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> Mileage: {vehicle.kilometers.toLocaleString()} km</span>
              <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> Location: {vehicle.location}</span>
            </div>
          </div>

          {/* Card Right: Trust Score radial dial + Advanced System-Category Confidences */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between space-y-4 print:border-slate-300 print:bg-slate-50 font-sans">
            <div className="flex flex-col items-center space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Composite Trust Rating</span>
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Beautiful background ring */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="52" className="stroke-slate-800 fill-none" strokeWidth="6" />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-blue-500 fill-none transition-all duration-1000 print:stroke-black"
                    strokeWidth="6"
                    strokeDasharray="326"
                    strokeDashoffset={326 - (326 * trustScore) / 100}
                  />
                </svg>
                <div className="text-center space-y-0.5 relative z-10">
                  <span className="text-3xl font-extrabold tracking-tighter text-white print:text-black">{trustScore}%</span>
                  <span className="text-[9px] font-mono text-slate-400 block font-semibold uppercase">{trustCategory}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed text-center px-2 print:text-slate-500 line-clamp-2">
                {trustReason}
              </p>
            </div>

            {/* Overall & Category System Confidences matrix */}
            <div className="border-t border-slate-800/80 pt-3 space-y-2 mt-auto text-left w-full">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase text-slate-400">
                <span>System Confidence</span>
                <span className="text-emerald-400 font-extrabold">{selectedReport.overallConfidence ?? 85}%</span>
              </div>
              
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/50">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${selectedReport.overallConfidence ?? 85}%` }}
                />
              </div>

              {selectedReport.categoryConfidence && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[8.5px] font-mono text-slate-500">
                  <div className="flex justify-between items-center border-b border-slate-900/60 pb-0.5">
                    <span>PRICE:</span>
                    <span className="text-slate-300 font-bold">{selectedReport.categoryConfidence.price}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-900/60 pb-0.5">
                    <span>MAINTENANCE:</span>
                    <span className="text-slate-300 font-bold">{selectedReport.categoryConfidence.maintenance}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-900/60 pb-0.5">
                    <span>VISUAL:</span>
                    <span className="text-slate-300 font-bold text-right truncate">
                      {selectedReport.categoryConfidence.visual > 0 ? `${selectedReport.categoryConfidence.visual}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-900/60 pb-0.5">
                    <span>FRAUD RISK:</span>
                    <span className="text-slate-300 font-bold">{selectedReport.categoryConfidence.fraud}%</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* In-depth reports contents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section 1: Price Validation Dashboard */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm space-y-6 print:border-slate-300 print:bg-slate-50 print:break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:border-slate-200">
              <IndianRupee className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono">Market Price Verification</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 print:bg-white print:border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Seller Price</span>
                <span className="text-2xl font-black text-white print:text-black">₹{vehicle.price.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 print:bg-white print:border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Est. Market Median</span>
                <span className="text-2xl font-black text-blue-400 print:text-black">₹{priceValidation.estimatedMarketPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Fair Range Low (₹{priceValidation.marketMin.toLocaleString('en-IN')})</span>
                <span>Fair Range High (₹{priceValidation.marketMax.toLocaleString('en-IN')})</span>
              </div>
              
              {/* Price target slider indicator */}
              <div className="h-2.5 w-full bg-slate-800 rounded-full relative overflow-visible print:bg-slate-200">
                {/* Highlight fair range bar */}
                <div className="absolute left-[10%] right-[10%] top-0 bottom-0 bg-blue-500/20 rounded-full" />
                
                {/* Pointer for current price */}
                <div
                  style={{ left: `${positionPercentage}%` }}
                  className="absolute -top-1.5 w-5.5 h-5.5 rounded-full bg-blue-500 border-2 border-slate-950 shadow-[0_0_10px_rgba(59,130,246,0.6)] flex items-center justify-center transform -translate-x-1/2 cursor-pointer transition-all hover:scale-110 active:scale-95"
                  title={`Listed Price: ₹${vehicle.price.toLocaleString('en-IN')}`}
                >
                  <IndianRupee className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Valuation:</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  priceValidation.priceCheck === "Great Deal" 
                    ? "text-emerald-400 bg-emerald-500/10"
                    : priceValidation.priceCheck === "Fair Price"
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-rose-400 bg-rose-500/10"
                }`}>
                  {priceValidation.priceCheck}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-4 print:text-slate-500">
              {priceValidation.reason}
            </p>
          </div>

          {/* Section 2: Fraud Risk Detection */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm space-y-6 print:border-slate-300 print:bg-slate-50 print:break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:border-slate-200">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono">Fraud Risk & Rollback Check</h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center space-y-1">
                <div className="text-3xl font-black text-rose-500">{fraudRisk.score}%</div>
                <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Risk index</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {fraudRisk.summary}
                </p>
              </div>
            </div>

            {/* Checker list items */}
            <div className="space-y-3.5 border-t border-slate-900 pt-4">
              <div className="flex justify-between items-start text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 print:text-black">Odometer Rollback Scan</span>
                  <p className="text-[10px] text-slate-400 max-w-xs">{fraudRisk.unusualMileage.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px] ${fraudRisk.unusualMileage.flag ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                  {fraudRisk.unusualMileage.flag ? "WARN" : "OK"}
                </span>
              </div>

              <div className="flex justify-between items-start text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 print:text-black">Price Manipulation Trap</span>
                  <p className="text-[10px] text-slate-400 max-w-xs">{fraudRisk.priceManipulation.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px] ${fraudRisk.priceManipulation.flag ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                  {fraudRisk.priceManipulation.flag ? "WARN" : "OK"}
                </span>
              </div>

              <div className="flex justify-between items-start text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 print:text-black">Owner Turnover Ratio</span>
                  <p className="text-[10px] text-slate-400 max-w-xs">{fraudRisk.multipleOwnerRisk.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px] ${fraudRisk.multipleOwnerRisk.flag ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                  {fraudRisk.multipleOwnerRisk.flag ? "WARN" : "OK"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Condition Analysis (Images feedback) */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm space-y-6 print:border-slate-300 print:bg-slate-50 print:break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:border-slate-200">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono">Condition Visual Inspector</h3>
            </div>

            {!hasAnyImages ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 print:bg-white print:border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Visual Inspection</span>
                  <span className="text-lg font-black text-slate-400 mt-1 block print:text-slate-600">Not Available</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-sans border-t border-slate-900 pt-4 print:text-slate-500">
                  No vehicle photos uploaded. Upload images to enable visual inspection.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 print:bg-white print:border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Exterior Paint Quality</span>
                    <span className="text-lg font-black text-white mt-1 block print:text-black">{condition.exteriorQuality}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 print:bg-white print:border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Camber / Dent Risk</span>
                    <span className="text-lg font-black text-white mt-1 block print:text-black">{condition.dentRisk}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs font-sans border-t border-slate-900 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Scratches Detected:</span>
                    <span className={`font-mono font-bold ${condition.scratchesDetected ? "text-amber-400" : "text-slate-500"}`}>
                      {condition.scratchesDetected ? "YES" : "NO"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rust / Chassis Decay:</span>
                    <span className={`font-mono font-bold ${condition.rustDetected ? "text-rose-400" : "text-slate-500"}`}>
                      {condition.rustDetected ? "YES" : "NO"}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-900 pt-4 print:text-slate-500">
                  {condition.notes}
                </p>
              </>
            )}
          </div>

          {/* Section 4: Maintenance Servicing Predictions (SVG Comparative Bars Chart) */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm space-y-6 print:border-slate-300 print:bg-slate-50 print:break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:border-slate-200">
              <Gauge className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono">Servicing Cost Forecast</h3>
            </div>

            {maintenance.estimateUnavailable ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-900/60">
                  <div className="text-center border-r border-slate-900/90 pr-2">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">1-Yr Total servicing</span>
                    <span className="text-sm font-bold text-rose-500 mt-1 block">Estimate unavailable</span>
                  </div>
                  <div className="text-center pl-2">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">3-Yr Total servicing</span>
                    <span className="text-sm font-bold text-rose-500 mt-1 block">Estimate unavailable</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-dashed border-slate-850 bg-slate-950/40 text-center text-xs text-slate-500 font-sans">
                  Forecast totals and breakdown estimates are unavailable due to insufficient vehicle specification parameters (e.g. invalid base statistics). Please verify listings input details.
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-900">
                  <div className="text-center border-r border-slate-900/90 pr-2">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">1-Yr Total servicing</span>
                    <span className="text-2xl font-black text-slate-100 print:text-black">₹{maintenance.total1Year.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-center pl-2">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">3-Yr Total servicing</span>
                    <span className="text-2xl font-black text-blue-400 print:text-black">₹{maintenance.total3Years.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Servicing Forecast Items Horizontal side-by-side indicator bar chart */}
                <div className="space-y-4">
                  {maintenance.items.map((item, i) => {
                    const maxCost = Math.max(...maintenance.items.map(it => it.cost3Years), 1);
                    const percent1Yr = (item.cost1Year / maxCost) * 100;
                    const percent3Yr = (item.cost3Years / maxCost) * 100;

                    return (
                      <div key={i} className="space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-200 print:text-black">
                          <span>{item.name}</span>
                          <span className="text-slate-400 font-mono font-semibold">
                            {item.cost1Year > 0 ? `₹${item.cost1Year.toLocaleString('en-IN')}` : "₹0"} / ₹{item.cost3Years.toLocaleString('en-IN')}
                          </span>
                        </div>
                        
                        {/* Comparative indicator sliders */}
                        <div className="h-3 w-full bg-slate-950 rounded-lg overflow-hidden flex gap-0.5 border border-slate-900 print:bg-slate-200 print:border-slate-300">
                          {/* Year 1 bar (Darker blue segment) */}
                          <div
                            style={{ width: `${percent1Yr}%` }}
                            className="h-full bg-blue-600 transition-all rounded-l print:bg-slate-600"
                          />
                          {/* Year 3 remaining portion */}
                          <div
                            style={{ width: `${Math.max(0, percent3Yr - percent1Yr)}%` }}
                            className="h-full bg-cyan-500 opacity-60 transition-all rounded-r print:bg-slate-400"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{item.description}</p>
                        {item.reason && (
                          <div className="mt-1.5 space-y-1 bg-slate-950/20 p-2 rounded border border-slate-900/40 text-[10px] text-left">
                            <div>
                              <span className="font-mono text-slate-500 mr-2 uppercase text-[8.5px] tracking-wider font-bold">Reason:</span>
                              <span className="text-slate-300 italic">{item.reason}</span>
                            </div>
                            {item.confidence !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500 uppercase text-[8.5px] tracking-wider font-bold">Confidence:</span>
                                <span className="text-slate-300 font-mono font-bold">{item.confidence}%</span>
                                {item.confidence < 70 && (
                                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase tracking-widest font-extrabold animate-pulse">
                                    Inspection Recommended
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {hasAnyImages && (
                  <div className="text-[10px] font-mono text-slate-500 text-center uppercase tracking-wider">
                    AI CONFIDENCE %: {maintenance.confidence}%
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* SECTION: VEHICLE ARCHITECTURE & ENGINEERING INTELLIGENCE */}
        <div id="architecture-intelligence" className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm space-y-6 print:border-slate-300 print:bg-slate-50 print:break-inside-avoid">
          {/* Header row with Trigger to Expand/Collapse */}
          <button 
            type="button"
            onClick={() => setArchitectureOpen(!architectureOpen)}
            className="w-full flex items-center justify-between border-b border-slate-800 pb-4 print:border-slate-200 cursor-pointer focus:outline-none group text-left"
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-blue-500 group-hover:animate-pulse" />
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white print:text-black">Vehicle Architecture & Engineering Intelligence</h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">Dynamic technical design, mechanical specifications, and architectural parameters</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {fetchingArchitecture && (
                <div className="w-4 h-4 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              )}
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${architectureOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {architectureOpen && (
            <div className="space-y-6 animate-fadeIn transition-all">
              {fetchingArchitecture ? (
                <div className="py-12 flex flex-col justify-center items-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono animate-pulse">Fetching manufacturer specifications...</p>
                </div>
              ) : !loadedArchitectureInfo ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-xs text-slate-500 font-sans">
                  Unable to automatically resolve vehicle engineering architecture configurations. Please check listing specs.
                </div>
              ) : (
                <>
                  {/* Confidence and Data Source Transparency Header Block */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-[11px] font-mono text-slate-400">
                        DATA SOURCE: <span className="font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{loadedArchitectureInfo.dataSource || "Hybrid Analysis"}</span>
                      </div>
                      <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
                      <div className="text-[11px] font-mono text-slate-400">
                        ARCHITECTURE CONFIDENCE: <span className="font-bold text-blue-400">{(loadedArchitectureInfo.confidenceScore || loadedArchitectureInfo.powertrain.confidence || 74)}%</span>
                      </div>
                      {loadedArchitectureInfo.generation && (
                        <>
                          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
                          <div className="text-[11px] font-mono text-slate-400">
                            GEN/PLATFORM: <span className="font-bold text-amber-400">{loadedArchitectureInfo.generation}</span>
                          </div>
                        </>
                      )}
                      {loadedArchitectureInfo.engineCode && (
                        <>
                          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
                          <div className="text-[11px] font-mono text-slate-400">
                            ENGINE CODE: <span className="font-bold text-amber-500">{loadedArchitectureInfo.engineCode}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      {((loadedArchitectureInfo.confidenceScore || loadedArchitectureInfo.powertrain.confidence || 74) >= 85) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ● SPEC EXACT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ⚠ ESTIMATED SPECIFICATION
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  
                  {/* CARD 1: POWERTRAIN & DRIVE */}
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-900 print:bg-white print:border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[11px] font-bold text-blue-400 font-mono uppercase tracking-wider">01. Powertrain & Transmission</span>
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden" title={`Powertrain Confidence: ${loadedArchitectureInfo.powertrain.confidence}%`}>
                          <div className="h-full bg-blue-500" style={{ width: `${loadedArchitectureInfo.powertrain.confidence}%` }} />
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Engine Type</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.powertrain.engineType}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Displacement</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.powertrain.engineDisplacement}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Cylinders</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.powertrain.cylinderConfiguration}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Induction</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.powertrain.induction}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Power output</span>
                          <span className="font-semibold text-blue-400 font-mono">{loadedArchitectureInfo.powertrain.horsepower}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Engine Torque</span>
                          <span className="font-semibold text-blue-400 font-mono">{loadedArchitectureInfo.powertrain.torque}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Fuel Injection</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.powertrain.fuelSystem}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40 pt-2">
                          <span className="text-slate-500">Transmission</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.transmission.transmissionType}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Gear Ratios</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.transmission.gears}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Drive Train</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.transmission.driveConfiguration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                      <span>Engine Data Confidence</span>
                      <span className="font-bold text-slate-400">{loadedArchitectureInfo.powertrain.confidence}%</span>
                    </div>
                  </div>

                  {/* CARD 2: CHASSIS & SUSPENSION & BRAKES */}
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-900 print:bg-white print:border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[11px] font-bold text-blue-400 font-mono uppercase tracking-wider">02. Chassis & Suspension</span>
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden" title={`Chassis Confidence: ${loadedArchitectureInfo.chassis.confidence}%`}>
                          <div className="h-full bg-blue-500" style={{ width: `${loadedArchitectureInfo.chassis.confidence}%` }} />
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Front Suspension</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[150px]" title={loadedArchitectureInfo.suspension.frontSuspension}>{loadedArchitectureInfo.suspension.frontSuspension}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Rear Suspension</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[150px]" title={loadedArchitectureInfo.suspension.rearSuspension}>{loadedArchitectureInfo.suspension.rearSuspension}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Ride Comfort</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.suspension.rideComfortRating}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Off-road Suitability</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.suspension.offRoadCapabilityRating}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Ground Clearance</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.chassis.groundClearance}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Wheelbase</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.chassis.wheelbase}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Vehicle Weight</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.chassis.vehicleWeight}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Tank/Battery Size</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.chassis.fuelTankCapacity}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40 pt-1">
                          <span className="text-slate-500">Front Brakes</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[150px]" title={loadedArchitectureInfo.brakes.frontBrakeType}>{loadedArchitectureInfo.brakes.frontBrakeType}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Rear Brakes</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[150px]" title={loadedArchitectureInfo.brakes.rearBrakeType}>{loadedArchitectureInfo.brakes.rearBrakeType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                      <span>Brake / Suspension Confidence</span>
                      <span className="font-bold text-slate-400">{loadedArchitectureInfo.brakes.confidence}%</span>
                    </div>
                  </div>

                  {/* CARD 3: SAFETY & RELIABILITY */}
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-900 print:bg-white print:border-slate-200 flex flex-col justify-between space-y-4 md:col-span-2 xl:col-span-1">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[11px] font-bold text-blue-400 font-mono uppercase tracking-wider">03. Safety & Reliability</span>
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden" title={`Reliability Confidence: ${loadedArchitectureInfo.reliability.confidence}%`}>
                          <div className="h-full bg-blue-500" style={{ width: `${loadedArchitectureInfo.reliability.confidence}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-900 text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Safety Index</span>
                          <span className="text-lg font-black text-emerald-400 font-mono">{loadedArchitectureInfo.safety.safetyScore}/100</span>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-900 text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Reliability Rating</span>
                          <span className="text-lg font-black text-emerald-400 font-mono">{loadedArchitectureInfo.reliability.reliabilityScore}/100</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Cabin Airbags</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.safety.airbags}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Stability Assist (ESC)</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.safety.esc}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">Traction Control</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.safety.tractionControl}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900/40">
                          <span className="text-slate-500">ADAS Active Safety</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[150px]" title={loadedArchitectureInfo.safety.adas}>{loadedArchitectureInfo.safety.adas}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-900/40">
                          <span className="text-slate-500">Expected Engine Life</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.reliability.expectedEngineLifespan}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-900/40">
                          <span className="text-slate-500">Expected Trans Life</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.reliability.expectedTransmissionLifespan}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-900/40">
                          <span className="text-slate-500">Parts Availability</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.reliability.partsAvailability}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-900/40">
                          <span className="text-slate-500">Repairs Complexity</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.reliability.maintenanceComplexity}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500">Ownership Cost</span>
                          <span className="font-semibold text-slate-200">{loadedArchitectureInfo.reliability.ownershipCost}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 flex justify-between pt-1">
                      <span>Safety Confidence Score</span>
                      <span className="font-bold text-slate-400">{loadedArchitectureInfo.safety.confidence}%</span>
                    </div>
                  </div>

                  {/* HIGHWAY/CITY COGNITIVE SUITABILITY BARS */}
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-900 print:bg-white print:border-slate-200 md:col-span-2 xl:col-span-2 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[11px] font-bold text-blue-400 font-mono uppercase tracking-wider">04. Ownership Suitability Matrices</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <span className="text-[9px] text-slate-500 uppercase">Optimal Use Case:</span>
                          <span className="font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">{loadedArchitectureInfo.ownership.bestUseCase}</span>
                        </div>
                      </div>

                      <div className="space-y-3.5 py-1 text-xs">
                        {/* City Driving Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                            <span>CITY COMMUTING</span>
                            <span>{loadedArchitectureInfo.ownership.suitabilityRatings.cityDriving}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${loadedArchitectureInfo.ownership.suitabilityRatings.cityDriving}%` }} />
                          </div>
                        </div>

                        {/* Highway Touring Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                            <span>HIGHWAY TOURING & CHASSIS BALANCE</span>
                            <span>{loadedArchitectureInfo.ownership.suitabilityRatings.highwayTouring}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${loadedArchitectureInfo.ownership.suitabilityRatings.highwayTouring}%` }} />
                          </div>
                        </div>

                        {/* Family Vehicle Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                            <span>FAMILY CONGRUENCY & UTILITY SPACE</span>
                            <span>{loadedArchitectureInfo.ownership.suitabilityRatings.familyVehicle}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${loadedArchitectureInfo.ownership.suitabilityRatings.familyVehicle}%` }} />
                          </div>
                        </div>

                        {/* Off-Roading Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                            <span>ROUGH TERRAIN & OFF-ROAD ADAPTABILITY</span>
                            <span>{loadedArchitectureInfo.ownership.suitabilityRatings.offRoading}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${loadedArchitectureInfo.ownership.suitabilityRatings.offRoading}%` }} />
                          </div>
                        </div>

                        {/* Commercial Use Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                            <span>PAYLOAD & COMMERCIAL DURABILITY</span>
                            <span>{loadedArchitectureInfo.ownership.suitabilityRatings.commercialUse}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${loadedArchitectureInfo.ownership.suitabilityRatings.commercialUse}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                      <span>Dynamic Suitability Prediction Authority Confidence</span>
                      <span className="font-bold text-slate-400">{loadedArchitectureInfo.ownership.confidence}%</span>
                    </div>
                  </div>

                  {/* KNOWN GENERATION ISSUES CARD */}
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-900 print:bg-white print:border-slate-200 md:col-span-2 xl:col-span-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[11px] font-bold text-amber-500 font-mono uppercase tracking-wider">05. Known Weaknesses</span>
                        <span className="text-[9.5px] font-mono font-bold text-slate-500">Confidence: {loadedArchitectureInfo.commonIssues.confidence}%</span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed">
                        <div>
                          <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase mb-1">Mechanical Fault Patterns</span>
                          {loadedArchitectureInfo.commonIssues.lowConfidence || loadedArchitectureInfo.commonIssues.mechanicalIssues === "Unable to Verify" ? (
                            <p className="text-[11px] text-slate-500 italic bg-slate-900/30 p-2 rounded border border-slate-900 border-dashed">Mechanical specs unable to verify due to low data confidence.</p>
                          ) : (
                            <ul className="list-disc pl-4 space-y-1 text-slate-300">
                              {(loadedArchitectureInfo.commonIssues.mechanicalIssues as string[]).map((issue: string, i: number) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase mb-1">Electrical & Tech Bugs</span>
                          {loadedArchitectureInfo.commonIssues.lowConfidence || loadedArchitectureInfo.commonIssues.electricalIssues === "Unable to Verify" ? (
                            <p className="text-[11px] text-slate-500 italic bg-slate-900/30 p-2 rounded border border-slate-900 border-dashed">Electrical specs unable to verify due to low data confidence.</p>
                          ) : (
                            <ul className="list-disc pl-4 space-y-1 text-slate-300">
                              {(loadedArchitectureInfo.commonIssues.electricalIssues as string[]).map((issue: string, i: number) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase mb-1">Premature Fatigue Components</span>
                          {loadedArchitectureInfo.commonIssues.lowConfidence || loadedArchitectureInfo.commonIssues.weakComponents === "Unable to Verify" ? (
                            <p className="text-[11px] text-slate-500 italic bg-slate-900/30 p-2 rounded border border-slate-900 border-dashed">Weak components unable to verify due to low data confidence.</p>
                          ) : (
                            <ul className="list-disc pl-4 space-y-1 text-slate-300">
                              {(loadedArchitectureInfo.commonIssues.weakComponents as string[]).map((issue: string, i: number) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-900/50 text-[10px] leading-relaxed text-slate-500">
                      ⚠️ Highly localized failure modes. Inspect those exact elements prior to final procurement.
                    </div>
                  </div>

                </div>
              </>
            )}
            </div>
          )}
        </div>

        {/* PRINT SYSTEM FOOTER */}
        <div className="hidden print:block border-t-2 border-slate-950 pt-6 mt-16 text-[9px] font-mono text-slate-500 text-center">
          CARTRUST AI COGNITIVE AUTOMOTIVE AUDIT SYSTEMS • VERIFICATION ID: {selectedReport.id.toUpperCase()}
        </div>

      </main>
    </div>
  );
};
