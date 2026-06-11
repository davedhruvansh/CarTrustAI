import React, { useState } from "react";
import { useCarTrust } from "../context/CarTrustContext";
import { ArrowLeft, ShieldCheck, UploadCloud, FileImage, ClipboardCopy, X, Cpu } from "lucide-react";
import { VehicleInput } from "../types";
import { Logo } from "./Logo";

export const CarInputForm: React.FC = () => {
  const { setCurrentPage, analyzeCar, loading } = useCarTrust();

  // Controlled states for input parameters
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [kilometers, setKilometers] = useState<number | "">("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [transmission, setTransmission] = useState("Automatic");
  const [ownerCount, setOwnerCount] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [location, setLocation] = useState("");

  // Four custom uploads
  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string>("");
  const [sideImage, setSideImage] = useState<string>("");
  const [interiorImage, setInteriorImage] = useState<string>("");

  const [activeDrag, setActiveDrag] = useState<string | null>(null);

  // File loading utility. Converts to base64.
  const handleFile = (file: File, key: string) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Invalid format. Please supply a standard image asset file (JPEG / PNG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (key === "front") setFrontImage(base64);
      if (key === "back") setBackImage(base64);
      if (key === "side") setSideImage(base64);
      if (key === "interior") setInteriorImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setActiveDrag(key);
  };

  const handleDragLeave = () => {
    setActiveDrag(null);
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setActiveDrag(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], key);
    }
  };

  // Quick Mock Autofill for testing/showcasing
  const handleAutofill = () => {
    setBrand("Maruti Suzuki");
    setModel("Swift VXI");
    setYear(2021);
    setKilometers(43200);
    setFuelType("Petrol");
    setTransmission("Automatic");
    setOwnerCount(1);
    setPrice(685000);
    setLocation("Ahmedabad, Gujarat");
    
    // Set simulated tiny image indicators (compact color block base64s)
    setFrontImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAD0lEQVR42mNkSDv6HwAEDAHUvI0hCAAAAABJRU5ErkJggg==");
    setBackImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAD0lEQVR42mPkj7b/DwADOQHUL0A54AAAAABJRU5ErkJggg==");
    setSideImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAD0lEQVR42mNk+M/wHwAEfAHUtmZpIQAAAABJRU5ErkJggg==");
    setInteriorImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAD0lEQVR42mNkaMv9DwAEFAHUshhXkQAAAABJRU5ErkJggg==");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !year || kilometers === "" || price === "" || !location) {
      alert("Please populate all outstanding mandatory text fields.");
      return;
    }

    const inputData: VehicleInput = {
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      kilometers: Number(kilometers),
      fuelType,
      transmission,
      ownerCount: Number(ownerCount),
      price: Number(price),
      location: location.trim()
    };

    const imageMap = {
      front: frontImage || undefined,
      back: backImage || undefined,
      side: sideImage || undefined,
      interior: interiorImage || undefined
    };

    await analyzeCar(inputData, imageMap);
  };

  const renderUploadSlot = (key: string, title: string, imgData: string, setImgData: (val: string) => void) => {
    const isOver = activeDrag === key;
    return (
      <div
        onDragOver={(e) => handleDragOver(e, key)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, key)}
        className={`relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
          imgData 
            ? "border-blue-500/50 bg-slate-900/60" 
            : isOver
            ? "border-blue-500 bg-blue-500/10 scale-95"
            : "border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40"
        }`}
      >
        {imgData ? (
          <>
            <img src={imgData} alt={title} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40" />
            <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center">
              <FileImage className="w-8 h-8 text-blue-400 mb-1" />
              <span className="text-xs font-mono text-slate-300 font-semibold truncate max-w-[150px]">{title} Attached</span>
              <button
                type="button"
                onClick={() => setImgData("")}
                className="mt-2.5 p-1 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 select-none min-h-[44px]">
            <UploadCloud className={`w-8 h-8 text-slate-500 mb-2 transition-all ${isOver ? "text-blue-400 scale-110" : "group-hover:text-slate-400"}`} />
            <span className="text-[11px] font-sans font-bold text-slate-300 text-center">{title} Photo</span>
            <span className="text-[9px] text-slate-500 font-mono mt-1 text-center">Drag or click to attach</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0], key);
                }
              }}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-100 bg-slate-900 flex flex-col relative font-sans">
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Primary header bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div className="flex items-center gap-2.5 animate-pulse-subtle">
              <Logo variant="square" className="w-[30px] h-[30px]" />
              <span className="font-sans font-bold text-lg text-white">Car Analysis Lab</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="px-3.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(37,99,235,0.2)]"
          >
            <ClipboardCopy className="w-3.5 h-3.5" /> Autofill Mock Data
          </button>
        </div>
      </header>

      {/* Workspace container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 relative z-10">
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative">
          
          <div className="border-b border-slate-800/80 pb-6 mb-8">
            <h2 className="text-xl font-extrabold text-white">Automotive Inspection Characteristics</h2>
            <p className="text-xs text-slate-400 mt-1">Please populate the vehicle specifications and upload standard photographs where available.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Split layout: Text fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Manufacturer / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Honda, Toyota, BMW"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Vehicle Model</label>
                <input
                  type="text"
                  placeholder="e.g. Civic Sport, Camry SE, 3-Series"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Manufacturing Year</label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  placeholder="e.g. 2021"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Kilometers Driven</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 43000"
                  value={kilometers}
                  onChange={(e) => setKilometers(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Fuel Configuration</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer"
                >
                  <option value="Petrol">Petrol / gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid (HEV/PHEV)</option>
                  <option value="Electric">Electric (BEV)</option>
                  <option value="LPG">LPG / gas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Transmission</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransmission("Automatic")}
                    className={`py-3 rounded-xl border text-xs font-semibold font-sans transition-all cursor-pointer ${
                      transmission === "Automatic"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    Automatic
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransmission("Manual")}
                    className={`py-3 rounded-xl border text-xs font-semibold font-sans transition-all cursor-pointer ${
                      transmission === "Manual"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Previous Owner Count</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setOwnerCount(count)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        ownerCount === count
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOwnerCount(5)}
                    className={`flex-1 py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      ownerCount >= 5
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    5+
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Seller Listing Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    placeholder="685000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad, Gujarat"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

            </div>

            {/* Split layout: Picture Upload slots */}
            <div className="space-y-4 pt-6 border-t border-slate-900">
              <div>
                <h3 className="text-sm font-bold text-slate-300 font-sans">Multimodal Inspect Photography (Optional)</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-sans">Attaching pictures allows Gemini to audit damages, scratches, paint fade, and underbody wear.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderUploadSlot("front", "Front Exterior", frontImage, setFrontImage)}
                {renderUploadSlot("back", "Rear Exterior", backImage, setBackImage)}
                {renderUploadSlot("side", "Side Exterior", sideImage, setSideImage)}
                {renderUploadSlot("interior", "Interior Cabin", interiorImage, setInteriorImage)}
              </div>
            </div>

            {/* Form actions */}
            <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage("dashboard")}
                className="px-5 py-3 rounded-xl hover:bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 transform hover:scale-[1.01] cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Report...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5" /> Confirm & Inspect Car
                  </span>
                )}
              </button>
            </div>

          </form>

        </div>
      </main>
    </div>
  );
};
