'use client';

import React, { useState, useRef, ClipboardEvent, DragEvent, ChangeEvent, useEffect } from "react";
import { Button, Card, Alert } from "@heroui/react";
import html2canvas from 'html2canvas-pro';
import { jsPDF } from "jspdf";
import { Upload, X, ClipboardPlus, RefreshCw, Camera } from "lucide-react";
import ReactMarkdown from 'react-markdown'; // 👈 Formats markdown response safely
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/auth-client";

interface ScanResponse {
  success: boolean;
  message?: string;
  data?: {
    recordId: string;
    reportMarkdown: string;
    plantName: string;
    diseaseName: string;
  };
}

export default function DiseaseCheckPage() {
  const { data: session } = useSession();
  const [image, setImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [plantName, setPlantName] = useState<string | null>(null);
  const [diseaseName, setDiseaseName] = useState<string | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch scan count on mount or session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetch("http://localhost:5000/api/diseases/count", {
        headers: {
          "x-user-id": session.user.id,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setScanCount(data.count);
          }
        })
        .catch((err) => console.error("Error fetching scan count:", err));
    } else {
      setScanCount(null);
    }
  }, [session]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    if (!session?.user) {
      toast.error("You cannot upload an image without login.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setIsCameraActive(true);
      setError(null);
      // Wait for ref connection
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera access failed:", err);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImage(dataUrl);
        
        // Convert to file
        const blobBin = atob(dataUrl.split(',')[1]);
        const array = [];
        for (let i = 0; i < blobBin.length; i++) {
          array.push(blobBin.charCodeAt(i));
        }
        const file = new File([new Uint8Array(array)], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
        setRawFile(file);
        
        // Stop stream
        stopCamera();
      }
    }
  };

  const processFile = (file: File) => {
    if (!session?.user) {
      toast.error("You cannot upload an image without login.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Unsupported format. Please supply a valid image document (PNG, JPG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds the maximum threshold limit of 10MB.");
      return;
    }

    setRawFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    if (!session?.user) {
      toast.error("You cannot upload an image without login.");
      return;
    }
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          break;
        }
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!session?.user) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!session?.user) {
      toast.error("You cannot upload an image without login.");
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const resetUploadState = () => {
    setImage(null);
    setRawFile(null);
    setReport(null);
    setError(null);
    setPlantName(null);
    setDiseaseName(null);
  };

  const handleScanExecute = async () => {
    if (!rawFile || !image) return;
    if (!session?.user) {
      toast.error("You cannot upload an image without login.");
      return;
    }

    setIsScanning(true);
    setReport(null);
    setError(null);
    setPlantName(null);
    setDiseaseName(null);

    try {
      // Extract the base64 string safely out of the data URL
      const base64Data = image.split(",")[1];

      const response = await fetch("http://localhost:5000/api/diseases/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.user.id,
          "x-user-name": session.user.name || "User",
          "x-user-email": session.user.email || "",
          "x-user-image": session.user.image || ""
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: rawFile.type,
        }),
      });

      const result: ScanResponse = await response.json();

      if (response.ok && result.success && result.data) {
        setReport(result.data.reportMarkdown);
        setPlantName(result.data.plantName || "Plant");
        setDiseaseName(result.data.diseaseName || "Disease");
        setScanCount((prev) => (prev !== null ? prev + 1 : 1));
        toast.success("Scan completed successfully!");
      } else {
        setError(result.message || "Visual analysis was unable to generate a conclusive report.");
        toast.error(result.message || "Scan failed.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network or parsing failure encountered during scanning sequence.");
      }
      toast.error("Network error during scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const downloadPDFReport = async () => {
    if (!reportRef.current) return;

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const formattedPlant = (plantName || "Plant").trim().replace(/\s+/g, "_");
      const formattedDisease = (diseaseName || "Disease").trim().replace(/\s+/g, "_");
      pdf.save(`${formattedPlant}_${formattedDisease}-report.pdf`);
      toast.success("PDF report downloaded!");
    } catch (err) {
      console.error("PDF engine crash:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">🌿 AI Plant Disease Check</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Upload, drag, or paste a photograph of a plant leaf or structure to diagnose stresses and target treatment solutions instantly.
        </p>
        {scanCount !== null && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-[#244D3F] dark:text-emerald-400 rounded-full text-xs font-semibold mt-4">
            📊 You have performed {scanCount} disease checks
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
        <div
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="focus:outline-none outline-none"
          tabIndex={0}
        >
          <Card
            className={`border-2 border-dashed rounded-2xl shadow-none bg-transparent transition-all duration-200 ${isDragging
              ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 scale-[1.01]"
              : "border-slate-200 dark:border-slate-800"
              }`}
          >
            <div className="flex flex-col items-center justify-center p-6 min-h-[320px]">
              {isCameraActive ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="w-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      onClick={stopCamera}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-[#244D3F] text-white flex items-center justify-center gap-2"
                      onClick={capturePhoto}
                    >
                      <Camera className="w-4 h-4" />
                      Capture Photo
                    </Button>
                  </div>
                </div>
              ) : image ? (
                <div className="w-full h-full flex flex-col gap-4">
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-900">
                    <img src={image} alt="Target leaf upload" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={resetUploadState}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black/90 transition"
                      title="Clear image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="w-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      onClick={resetUploadState}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-[#244D3F] text-white flex items-center justify-center gap-2"
                      isDisabled={isScanning}
                      onClick={handleScanExecute}
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        "Run Diagnostics"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center">
                  <label 
                    className="flex flex-col items-center justify-center cursor-pointer text-center group w-full py-8"
                    onClick={(e) => {
                      if (!session?.user) {
                        e.preventDefault();
                        toast.error("You cannot upload an image without login.");
                      }
                    }}
                  >
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-[#244D3F] mb-4 group-hover:scale-105 transition-transform flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Browse, drag & drop, or paste image
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-md">
                      <ClipboardPlus className="w-3.5 h-3.5" />
                      <span>Press Ctrl+V or Cmd+V to paste</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2">Supports PNG, JPG up to 10MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!session?.user} />
                  </label>

                  {session?.user && (
                    <Button
                      size="sm"
                      className="mt-2 text-xs flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-[#244D3F] dark:text-emerald-400 font-semibold"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4" />
                      Use Camera Stream
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="h-full min-h-[320px] flex items-center justify-center border border-slate-100 dark:border-slate-900 shadow-md">
          <div className="p-6 flex flex-col justify-center items-center w-full">
            {isScanning && (
              <div className="w-full text-center space-y-4">
                <RefreshCw className="w-8 h-8 mx-auto text-[#244D3F] animate-spin" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  Cross-Referencing Pathogens...
                </h3>
                <div className="w-full max-w-xs mx-auto bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#244D3F] h-full animate-pulse w-full" />
                </div>
              </div>
            )}

            {error && (
              <Alert color="danger">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-bold text-sm text-red-800 dark:text-red-200">Diagnostic Flag</span>
                  <span className="text-xs text-red-700 dark:text-red-300">{error}</span>
                </div>
              </Alert>
            )}

            {!isScanning && !report && !error && (
              <p className="text-sm text-slate-400 text-center italic max-w-[240px]">
                Awaiting content... Upload or paste your asset to initialize diagnostic sequence.
              </p>
            )}

            {report && !isScanning && (
              <div className="w-full">
                <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
                  <span>✓</span> Analysis Framework Ready
                </div>
                <p className="text-xs text-slate-500">
                  Scroll down to examine the pathological report architecture or download the official print profile.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Note: Added explicit print overrides here to bypass layout adjustments when rendering the PDF */}
          <div ref={reportRef} className="p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:p-0 print:border-none">
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Botanical Diagnostic Report</h2>
                <p className="text-xs text-slate-400 mt-1">Processed via Gemini Pathogen Verification Engine</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-[#244D3F] rounded-full text-xs font-semibold tracking-wide uppercase">
                Match Verified
              </span>
            </div>

            {/* Changed raw rendering block to ReactMarkdown format */}
            <div className="prose max-w-none text-sm text-slate-700 space-y-2 dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" className="bg-[#244D3F] text-white font-medium" onClick={downloadPDFReport}>
              📥 Download Diagnostic PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}