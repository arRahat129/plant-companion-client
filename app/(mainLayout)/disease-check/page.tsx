'use client';

import React, { useState, useRef, ClipboardEvent, DragEvent, ChangeEvent, useEffect } from "react";
import { Button, Card, Alert } from "@heroui/react";
import html2canvas from 'html2canvas-pro';
import { jsPDF } from "jspdf";
import { Upload, X, ClipboardPlus, RefreshCw, Camera, FileDown, RotateCcw, Scan, Shield, Activity, Leaf } from "lucide-react";
import ReactMarkdown from 'react-markdown';
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
  const [scanStage, setScanStage] = useState<string>("");

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch scan count on mount or session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/diseases/count`, {
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

        const blobBin = atob(dataUrl.split(',')[1]);
        const array = [];
        for (let i = 0; i < blobBin.length; i++) {
          array.push(blobBin.charCodeAt(i));
        }
        const file = new File([new Uint8Array(array)], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
        setRawFile(file);
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
    setScanStage("");
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

    // Animated scan stages
    setScanStage("Uploading image data...");
    await new Promise(r => setTimeout(r, 600));
    setScanStage("Running AI image classification...");
    await new Promise(r => setTimeout(r, 800));
    setScanStage("Generating pathology report...");

    try {
      const base64Data = image.split(",")[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/diseases/scan`, {
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
        setScanStage("Analysis complete ✓");
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
          <Shield className="w-3.5 h-3.5" />
          AI-Powered Plant Pathology
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-white">
          Plant Disease Scanner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Upload or capture a photo of your plant leaf. Our AI will identify diseases, assess severity, and recommend treatment solutions.
        </p>
        {scanCount !== null && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium mt-4">
            <Activity className="w-3 h-3" />
            {scanCount} scan{scanCount !== 1 ? 's' : ''} performed
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-10">
        {/* Left: Upload Zone */}
        <div
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="focus:outline-none outline-none"
          tabIndex={0}
        >
          <div
            className={`border-2 border-dashed rounded-2xl transition-all duration-200 ${isDragging
              ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 scale-[1.01]"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
          >
            <div className="flex flex-col items-center justify-center p-6 min-h-[360px]">
              {isCameraActive ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-xl pointer-events-none" />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      onClick={stopCamera}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 text-white flex items-center justify-center gap-2 font-medium"
                      onClick={capturePhoto}
                    >
                      <Camera className="w-4 h-4" />
                      Capture
                    </Button>
                  </div>
                </div>
              ) : image ? (
                <div className="w-full h-full flex flex-col gap-4">
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-950">
                    <img src={image} alt="Uploaded plant" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={resetUploadState}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition backdrop-blur-sm"
                      title="Clear image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {rawFile && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white/80">
                        {rawFile.name} · {(rawFile.size / 1024).toFixed(0)}KB
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center gap-2"
                      onClick={resetUploadState}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 font-medium transition-colors"
                      isDisabled={isScanning}
                      onClick={handleScanExecute}
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Scan className="w-4 h-4" />
                          <span>Run Diagnostics</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center">
                  <label
                    className="flex flex-col items-center justify-center cursor-pointer text-center group w-full py-10"
                    onClick={(e) => {
                      if (!session?.user) {
                        e.preventDefault();
                        toast.error("You cannot upload an image without login.");
                      }
                    }}
                  >
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Browse, drag & drop, or paste image
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg">
                      <ClipboardPlus className="w-3.5 h-3.5" />
                      <span>Press Ctrl+V or Cmd+V to paste</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2.5">Supports PNG, JPG up to 10MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={!session?.user}
                    />
                  </label>

                  {session?.user && (
                    <Button
                      size="sm"
                      className="text-xs flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4" />
                      Use Camera
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[360px] flex items-center justify-center">
          <div className="p-6 flex flex-col justify-center items-center w-full">
            {isScanning && (
              <div className="w-full text-center space-y-5">
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100 dark:border-emerald-900/30" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-t-emerald-500 animate-spin" />
                  <Leaf className="absolute inset-0 m-auto w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Scanning in Progress
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                    {scanStage}
                  </p>
                </div>
                <div className="w-full max-w-xs mx-auto bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full animate-[scan-progress_3s_ease-in-out_infinite]"
                    style={{ animation: 'scan-progress 3s ease-in-out infinite', width: '70%' }} />
                </div>
              </div>
            )}

            {error && (
              <Alert color="danger">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-bold text-sm text-red-800 dark:text-red-200">Diagnostic Error</span>
                  <span className="text-xs text-red-700 dark:text-red-300">{error}</span>
                </div>
              </Alert>
            )}

            {!isScanning && !report && !error && (
              <div className="text-center space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl inline-flex">
                  <Scan className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 max-w-[240px]">
                  Upload or capture a plant image to start the AI diagnostic analysis.
                </p>
              </div>
            )}

            {report && !isScanning && (
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Analysis Complete</p>
                    <p className="text-xs text-slate-500">{plantName} · {diseaseName}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Scroll down to review the full diagnostic report or download it as PDF.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Section */}
      {report && (
        <div className="space-y-6">
          <div ref={reportRef} className="p-6 sm:p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Botanical Diagnostic Report</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {plantName} · {diseaseName} · Processed via AI Pathology Engine
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold tracking-wide uppercase shrink-0">
                Verified
              </span>
            </div>

            <div className="prose max-w-none text-sm text-slate-700 space-y-2 prose-headings:font-bold prose-p:leading-relaxed prose-h3:text-base prose-h3:mt-4 prose-ul:mt-1 prose-li:mt-0">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 transition-colors"
              onClick={downloadPDFReport}
            >
              <FileDown className="w-4 h-4" />
              Download Report PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}