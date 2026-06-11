import { VehicleArchitectureInfo } from "../src/types";

// Schema for our Premium Engineering Database Layer
interface DBArchitectureEntry {
  brands: string[];      // Possible matching strings (lowercase)
  models: string[];      // Possible matching strings (lowercase)
  startYear?: number;
  endYear?: number;
  generation?: string;
  engineCode?: string;
  engineType: string;
  engineCapacity: string;
  horsepower: string;
  torque: string;
  transmissionTypes: string[];
  drivetrain: string;
  chassisType: string;
  frontSuspension: string;
  rearSuspension: string;
  frontBrakeType: string;
  rearBrakeType: string;
  groundClearance: string;
  wheelbase: string;
  vehicleWeight: string;
  fuelTankCapacity: string;
  
  // Safety
  airbags: string;
  esc: string;
  tractionControl: string;
  adas: string;
  safetyScore: number;
  
  // Reliability
  reliabilityScore: number;
  expectedEngineLifespan: string;
  expectedTransmissionLifespan: string;
  partsAvailability: string;
  maintenanceComplexity: string;
  ownershipCost: string;

  // Weaknesses
  mechanicalIssues: string[];
  electricalIssues: string[];
  weakComponents: string[];
  
  // Suitability
  bestUseCase: string;
  cityDriving: number;
  highwayTouring: number;
  familyVehicle: number;
  offRoading: number;
  commercialUse: number;
}

// PREMIUM STRUCTURED ARCHITECTURE DATABASE LAYER
const ENGINEERING_DATABASE_LAYER: DBArchitectureEntry[] = [
  // 1. HONDA CITY
  {
    brands: ["honda"],
    models: ["city"],
    startYear: 2020,
    endYear: 2027,
    generation: "5th Generation City",
    engineCode: "L15B / L15ZC i-VTEC",
    engineType: "1498cc i-VTEC petrol DOHC Inline-4",
    engineCapacity: "1,498 cc",
    horsepower: "119 HP @ 6600 RPM",
    torque: "145 Nm @ 4300 RPM",
    transmissionTypes: ["CVT", "6-Speed Manual (6MT)"],
    drivetrain: "Front-Wheel Drive (FWD)",
    chassisType: "Monocoque Chassis",
    frontSuspension: "MacPherson Front Suspension",
    rearSuspension: "Torsion Beam Rear Suspension",
    frontBrakeType: "Front Disc",
    rearBrakeType: "Rear Drum",
    groundClearance: "165 mm",
    wheelbase: "2,600 mm",
    vehicleWeight: "1,153 kg",
    fuelTankCapacity: "40 Liters",
    airbags: "6 Airbags",
    esc: "Vehicle Stability Assist (VSA)",
    tractionControl: "Standard TCS",
    adas: "Honda SENSING ADAS (Adaptive Cruise, Lane Assist, Collision Mitigation)",
    safetyScore: 95,
    reliabilityScore: 92,
    expectedEngineLifespan: "300,000+ km under regular maintenance",
    expectedTransmissionLifespan: "250,000+ km",
    partsAvailability: "Excellent. Immense aftermarket and OEM dealer network.",
    maintenanceComplexity: "Low. Easily manageable by independent mechanics.",
    ownershipCost: "Excellent (Very reasonable service costs)",
    mechanicalIssues: [
      "Steering rack noise or play over coarse surfaces",
      "AC compressor wear under extreme hot season run-cycles"
    ],
    electricalIssues: [
      "Infotainment smartphone widget lag or wireless crash",
      "Power window automatic reverse obstruction sensor pinch logic drift"
    ],
    weakComponents: [
      "OEM steering rack gearbox assembly seals",
      "Front bumper lower underbody plastic shield rivets"
    ],
    bestUseCase: "City Driving",
    cityDriving: 95,
    highwayTouring: 85,
    familyVehicle: 80,
    offRoading: 15,
    commercialUse: 45
  },
  {
    brands: ["honda"],
    models: ["city"],
    startYear: 2014,
    endYear: 2019,
    generation: "4th Generation City",
    engineCode: "L15A7 i-VTEC",
    engineType: "1497cc i-VTEC naturally aspirated SOHC Inline-4",
    engineCapacity: "1,497 cc",
    horsepower: "117 HP @ 6600 RPM",
    torque: "145 Nm @ 4600 RPM",
    transmissionTypes: ["CVT", "5-Speed Manual (5MT)"],
    drivetrain: "Front-Wheel Drive (FWD)",
    chassisType: "Monocoque Chassis",
    frontSuspension: "MacPherson Front Suspension",
    rearSuspension: "Torsion Beam Rear Suspension",
    frontBrakeType: "Front Disc",
    rearBrakeType: "Rear Drum",
    groundClearance: "165 mm",
    wheelbase: "2,600 mm",
    vehicleWeight: "1,100 kg",
    fuelTankCapacity: "40 Liters",
    airbags: "2 to 6 Airbags (variant dependent)",
    esc: "ABS with EBD standard",
    tractionControl: "Equipped on top-tier trims only",
    adas: "None",
    safetyScore: 84,
    reliabilityScore: 88,
    expectedEngineLifespan: "280,000+ km",
    expectedTransmissionLifespan: "220,000 km (CVT requires premium fluid intervals)",
    partsAvailability: "Exceptional. Every distributor stocks parts.",
    maintenanceComplexity: "Low. Highly serviceable architecture.",
    ownershipCost: "Outstandingly Low.",
    mechanicalIssues: [
      "Steering rack rattle over high-frequency gravel bumps",
      "AC condenser assembly oxidation and slow refrigerant weepage"
    ],
    electricalIssues: [
      "Touch-panel automatic climate control system screen dimming",
      "ORVM auto-fold electronic actuators binding under dust"
    ],
    weakComponents: [
      "Front suspension lower control arm rubber bushes",
      "OE brake dust shielding plates"
    ],
    bestUseCase: "City Driving",
    cityDriving: 94,
    highwayTouring: 80,
    familyVehicle: 78,
    offRoading: 10,
    commercialUse: 50
  },
  // 2. TOYOTA FORTUNER
  {
    brands: ["toyota"],
    models: ["fortuner"],
    startYear: 2022,
    endYear: 2027,
    generation: "2nd Gen Facelift (AN120)",
    engineCode: "1GD-FTV",
    engineType: "2755cc GD Diesel VNT Intercooled Inline-4",
    engineCapacity: "2,755 cc",
    horsepower: "201 HP @ 3400 RPM",
    torque: "500 Nm @ 1600-2800 RPM",
    transmissionTypes: ["6-Speed Automatic", "6-Speed Manual"],
    drivetrain: "Rear-Wheel Drive (RWD) or 4x4 with High/Low Range",
    chassisType: "Ladder Frame Chassis",
    frontSuspension: "Double Wishbone Front",
    rearSuspension: "Multi-link Rear",
    frontBrakeType: "Ventilated Discs",
    rearBrakeType: "Ventilated Discs",
    groundClearance: "225 mm",
    wheelbase: "2,745 mm",
    vehicleWeight: "2,180 kg",
    fuelTankCapacity: "80 Liters",
    airbags: "7 Airbags standard",
    esc: "Vehicle Stability Control (VSC)",
    tractionControl: "Active Traction Control (A-TRC)",
    adas: "Toyota Safety Sense (PCS, LDA, DRCC on export models)",
    safetyScore: 96,
    reliabilityScore: 96,
    expectedEngineLifespan: "450,000+ km under heavy load",
    expectedTransmissionLifespan: "400,000+ km",
    partsAvailability: "Excellent globally. Highly standardized parts pipeline.",
    maintenanceComplexity: "Moderate (DPF requires correct exhaust cycling)",
    ownershipCost: "Moderate (Premium utility servicing tariff)",
    mechanicalIssues: [
      "Steering feedback vibration or jitter at speeds near 110-120 km/h",
      "DPF particulate clog/regeneration issues on persistent short urban drives"
    ],
    electricalIssues: [
      "Tailgate automatic obstacle pinch detection slow reset",
      "Infotainment interface pairing dropping intermittently"
    ],
    weakComponents: [
      "OEM brake pads and front rotor flatness under extreme towing loads",
      "Diesel fuel-line return vibration clamps"
    ],
    bestUseCase: "Off-Roading",
    cityDriving: 60,
    highwayTouring: 88,
    familyVehicle: 84,
    offRoading: 95,
    commercialUse: 85
  },
  {
    brands: ["toyota"],
    models: ["fortuner"],
    startYear: 2015,
    endYear: 2021,
    generation: "2nd Generation (Pre-facelift)",
    engineCode: "1GD-FTV / 2GD-FTV",
    engineType: "2755cc GD Diesel Turbo Inline-4",
    engineCapacity: "2,755 cc",
    horsepower: "174 HP @ 3400 RPM",
    torque: "450 Nm @ 1600-2400 RPM",
    transmissionTypes: ["6-Speed Automatic", "6-Speed Manual"],
    drivetrain: "Rear-Wheel Drive (RWD) or 4x4 Transfer Case",
    chassisType: "Ladder Frame Chassis",
    frontSuspension: "Double Wishbone Front",
    rearSuspension: "Multi-link Rear",
    frontBrakeType: "Ventilated Discs",
    rearBrakeType: "Ventilated Discs",
    groundClearance: "220 mm",
    wheelbase: "2,745 mm",
    vehicleWeight: "2,135 kg",
    fuelTankCapacity: "80 Liters",
    airbags: "7 Airbags",
    esc: "VSC (Stability Assist)",
    tractionControl: "Standard A-TRC",
    adas: "None standard",
    safetyScore: 92,
    reliabilityScore: 95,
    expectedEngineLifespan: "400,000+ km",
    expectedTransmissionLifespan: "350,000+ km",
    partsAvailability: "Excellent. Universal.",
    maintenanceComplexity: "Moderate.",
    ownershipCost: "Moderate.",
    mechanicalIssues: [
      "Steering wheel shake when cruising at highway speed limits",
      "Diesel injector noise / rattle under full throttle loads"
    ],
    electricalIssues: [
      "Keyless comfort access entry button weathering failures on door handles",
      "Trailer socket ground wiring corrosion"
    ],
    weakComponents: [
      "Front propeller shaft sliding yoke (requires prompt greasing)",
      "AdBlue heater element elements pre-mature calcification"
    ],
    bestUseCase: "Off-Roading",
    cityDriving: 62,
    highwayTouring: 86,
    familyVehicle: 82,
    offRoading: 92,
    commercialUse: 80
  },
  // 3. HYUNDAI I20
  {
    brands: ["hyundai"],
    models: ["i20", "elite i20"],
    startYear: 2020,
    endYear: 2027,
    generation: "3rd Generation (BC3)",
    engineCode: "1.2L Kappa II MPi",
    engineType: "1197cc Kappa Petrol Naturally Aspirated",
    engineCapacity: "1,197 cc",
    horsepower: "83 HP @ 6000 RPM (IVT/CVT)",
    torque: "115 Nm @ 4200 RPM",
    transmissionTypes: ["IVT/CVT", "5-Speed Manual (5MT)"],
    drivetrain: "Front-Wheel Drive (FWD)",
    chassisType: "Monocoque Chassis",
    frontSuspension: "MacPherson Strut Front Suspension",
    rearSuspension: "Torsion Beam Rear Suspension",
    frontBrakeType: "Front Disc",
    rearBrakeType: "Rear Drum",
    groundClearance: "170 mm",
    wheelbase: "2,580 mm",
    vehicleWeight: "1,040 kg",
    fuelTankCapacity: "37 Liters",
    airbags: "6 Airbags",
    esc: "Electronic Stability Control (ESC)",
    tractionControl: "Standard",
    adas: "None standard (only on high export specs)",
    safetyScore: 81,
    reliabilityScore: 84,
    expectedEngineLifespan: "220,000+ km",
    expectedTransmissionLifespan: "180,000+ km",
    partsAvailability: "Superb. Extensive dealership inventory.",
    maintenanceComplexity: "Low. Easy electrical wiring diagrams.",
    ownershipCost: "Low to Moderate.",
    mechanicalIssues: [
      "Premature Clutch wear on busy bumper-to-bumper metropolitan commutes",
      "Suspension bush wear causing mild thuds on sharp potholes"
    ],
    electricalIssues: [
      "Infotainment screen freeze during engine startup voltage drops",
      "Reverse parking distance sensor terminal wiring corrosion under splash guard"
    ],
    weakComponents: [
      "Manual gear shift shift coupling bush wear",
      "Front stabilizer end link ball-joint seals"
    ],
    bestUseCase: "City Driving",
    cityDriving: 95,
    highwayTouring: 75,
    familyVehicle: 74,
    offRoading: 12,
    commercialUse: 35
  },
  // 4. MARUTI SWIFT
  {
    brands: ["maruti", "suzuki", "maruti suzuki"],
    models: ["swift"],
    startYear: 2018,
    endYear: 2027,
    generation: "3rd/4th Gen (HEARTECT)",
    engineCode: "K12M / K12N DualJet",
    engineType: "1197cc DualJet Petrol naturally aspirated Inline-4",
    engineCapacity: "1,197 cc",
    horsepower: "89 HP @ 6000 RPM",
    torque: "113 Nm @ 4400 RPM",
    transmissionTypes: ["5-Speed MT", "5-Speed AMT"],
    drivetrain: "Front-Wheel Drive (FWD)",
    chassisType: "HEARTECT Monocoque",
    frontSuspension: "MacPherson Strut with Coil Spring",
    rearSuspension: "Torsion Beam Rear Suspension",
    frontBrakeType: "Front Ventilated Disc",
    rearBrakeType: "Rear Drum",
    groundClearance: "163 mm",
    wheelbase: "2,450 mm",
    vehicleWeight: "875 kg",
    fuelTankCapacity: "37 Liters",
    airbags: "2 to 6 Airbags",
    esc: "Electronic Stability Program (ESP) with Hill Hold",
    tractionControl: "Equipped on newer models",
    adas: "None",
    safetyScore: 78,
    reliabilityScore: 94,
    expectedEngineLifespan: "300,000+ km with standard oil intervals",
    expectedTransmissionLifespan: "250,000+ km (highly robust MT, AMT needs occasional rebuilds)",
    partsAvailability: "Outstanding. Parts are cheap and sold everywhere.",
    maintenanceComplexity: "Lowest.",
    ownershipCost: "Lowest.",
    mechanicalIssues: [
      "AMT automation actuator shudder on high thermal clutch loading",
      "Front brake caliper sliding pin rattling or grease run-out"
    ],
    electricalIssues: [
      "Instrument cluster retro backlight bulbs flashing",
      "SmartPlay touchscreen pairing drops on hot cabin temps"
    ],
    weakComponents: [
      "Ultra-thin cosmetic body paneling/paint prone to gravel dings",
      "Lower suspension arm rear vertical bushes"
    ],
    bestUseCase: "City Driving",
    cityDriving: 98,
    highwayTouring: 72,
    familyVehicle: 68,
    offRoading: 10,
    commercialUse: 60
  },
  // 5. MARUTI BALENO
  {
    brands: ["maruti", "suzuki", "maruti suzuki"],
    models: ["baleno"],
    startYear: 2015,
    endYear: 2027,
    generation: "HEARTECT Baleno Series",
    engineCode: "K12N / DualJet",
    engineType: "1197cc Smart Hybrid Petrol Inline-4",
    engineCapacity: "1,197 cc",
    horsepower: "89 HP @ 6000 RPM",
    torque: "113 Nm @ 4400 RPM",
    transmissionTypes: ["5-Speed MT", "CVT", "5-Speed AMT"],
    drivetrain: "Front-Wheel Drive (FWD)",
    chassisType: "HEARTECT Chassis",
    frontSuspension: "MacPherson Strut",
    rearSuspension: "Torsion Beam Rear",
    frontBrakeType: "Front Disc",
    rearBrakeType: "Rear Drum",
    groundClearance: "170 mm",
    wheelbase: "2,520 mm",
    vehicleWeight: "950 kg",
    fuelTankCapacity: "37 Liters",
    airbags: "6 Airbags (latest trims) / 2 basic",
    esc: "ESP with Hill Hold standard on later years",
    tractionControl: "Standard on newer variants",
    adas: "None",
    safetyScore: 80,
    reliabilityScore: 92,
    expectedEngineLifespan: "280,000+ km",
    expectedTransmissionLifespan: "240,000 km",
    partsAvailability: "Infinite.",
    maintenanceComplexity: "Minimal.",
    ownershipCost: "Outstandingly Low.",
    mechanicalIssues: [
      "Suspension thud or dry mechanical groan over high speed bumps",
      "Clutch pressure plate premature juddling under severe urban usage"
    ],
    electricalIssues: [
      "HUD (Heads Up Display) stepper motor grinding when raising",
      "360 camera stitch processing feed showing grey boxes"
    ],
    weakComponents: [
      "Bumper corner locking brackets",
      "Horn diaphragm lifespan"
    ],
    bestUseCase: "City Driving",
    cityDriving: 96,
    highwayTouring: 76,
    familyVehicle: 82,
    offRoading: 8,
    commercialUse: 50
  },
  // 6. HYUNDAI CRETA / KIA SELTOS
  {
    brands: ["hyundai", "kia"],
    models: ["creta", "seltos"],
    startYear: 2020,
    endYear: 2027,
    generation: "2nd Gen SU2 / Kia SP2",
    engineCode: "1.5L CRDi VGT",
    engineType: "1493cc U2 Diesel VGT Inline-4 DOHC",
    engineCapacity: "1,493 cc",
    horsepower: "113 HP @ 4000 RPM",
    torque: "250 Nm @ 1500-2700 RPM",
    transmissionTypes: ["6-Speed MT", "6-Speed Automatic Torque Converter"],
    drivetrain: "Front-Wheel Drive (FWD)",
    chassisType: "K2 Platform Monocoque",
    frontSuspension: "MacPherson Strut with Coil Spring",
    rearSuspension: "Coupled Torsion Beam Axle with Coil Spring",
    frontBrakeType: "Ventilated Discs",
    rearBrakeType: "Solid Discs",
    groundClearance: "190 mm",
    wheelbase: "2,610 mm",
    vehicleWeight: "1,340 kg",
    fuelTankCapacity: "50 Liters",
    airbags: "6 Airbags featured standard",
    esc: "Electronic Stability Control (ESC)",
    tractionControl: "Equipped with drive modes",
    adas: "Standard SmartSense level 2 (in higher trims since 2023)",
    safetyScore: 84,
    reliabilityScore: 85,
    expectedEngineLifespan: "260,000+ km",
    expectedTransmissionLifespan: "230,000 km",
    partsAvailability: "Highly available. Very popular crossover base.",
    maintenanceComplexity: "Moderate (DPF filter regeneration constraints)",
    ownershipCost: "Moderate.",
    mechanicalIssues: [
      "Front suspension lower wishbone bushes cracking prematurely",
      "Spongy or wooden feel in brake pedal response during extreme heat periods"
    ],
    electricalIssues: [
      "10.25-inch infotainment tablet screen boots to blank logo",
      "Ambient lighting cluster module losing calibration sync"
    ],
    weakComponents: [
      "DPF (Diesel Particulate Filter) soot clogging on repetitive 3km trips",
      "Panoramic sunroof sunshade retraction cable tensioners"
    ],
    bestUseCase: "Family Vehicle",
    cityDriving: 88,
    highwayTouring: 86,
    familyVehicle: 90,
    offRoading: 40,
    commercialUse: 40
  },
  // 7. MAHINDRA THAR
  {
    brands: ["mahindra"],
    models: ["thar"],
    startYear: 2020,
    endYear: 2027,
    generation: "2nd Gen Offroader",
    engineCode: "mHawk130 CRDe",
    engineType: "2184cc mHawk Diesel Variable Geometry Turbochargers",
    engineCapacity: "2,184 cc",
    horsepower: "130 HP @ 3750 RPM",
    torque: "300 Nm @ 1600-2800 RPM",
    transmissionTypes: ["6-Speed MT", "6-Speed AT Torque Converter"],
    drivetrain: "Shift-on-the-fly 4WD with mechanical low-ratio transfer",
    chassisType: "3rd-Gen High Tensile Ladder Frame",
    frontSuspension: "Independent Double Wishbone Front",
    rearSuspension: "Multi-link Solid Live Rear Axle with Coil Spring",
    frontBrakeType: "Ventilated Discs",
    rearBrakeType: "Drums",
    groundClearance: "226 mm",
    wheelbase: "2,450 mm",
    vehicleWeight: "1,750 kg",
    fuelTankCapacity: "57 Liters",
    airbags: "2 Airbags standard",
    esc: "Electronic Stability Program (ESP) with roll-mitigation",
    tractionControl: "Standard electronic traction control (BLD)",
    adas: "None standard",
    safetyScore: 82,
    reliabilityScore: 80,
    expectedEngineLifespan: "350,000+ km with diligent fluid care",
    expectedTransmissionLifespan: "280,000+ km",
    partsAvailability: "Excellent across India. Highly active service networks.",
    maintenanceComplexity: "Moderate.",
    ownershipCost: "Moderate to High.",
    mechanicalIssues: [
      "Severe wind noise whistling past soft/hardtops above 90 km/h",
      "Brake pedal mushy reaction during repetitive off-road descent runs"
    ],
    electricalIssues: [
      "Instrument cluster multi-info display screen reboots in intense summer",
      "Roof-speaker pods audio wire cuts caused by hardtop canopy roll flex"
    ],
    weakComponents: [
      "Outdoor rear-view side mirrors locking joints fracture",
      "Factory front bumper underbelly protective cover"
    ],
    bestUseCase: "Off-Roading",
    cityDriving: 55,
    highwayTouring: 68,
    familyVehicle: 50,
    offRoading: 96,
    commercialUse: 45
  }
];

// Map brands to standardized lower-case keys for easy lookup
export function findVehicleArchitecture(
  brandInput: string,
  modelInput: string,
  year: number,
  fuelTypeInput: string = "Petrol",
  transmissionInput: string = "Automatic"
): VehicleArchitectureInfo {
  const brand = brandInput.trim().toLowerCase();
  const model = modelInput.trim().toLowerCase();
  const fuelType = fuelTypeInput.trim().toLowerCase();
  const isElectric = fuelType === "electric" || brand === "tesla";

  // Default baseline layout structure
  const defaultInfo: VehicleArchitectureInfo = {
    dataSource: "AI Estimated",
    confidenceScore: 74,
    powertrain: {
      engineType: isElectric ? "AC Synchronous Permanent Magnet Electric Motor" : "Double Overhead Cam (DOHC) Inline-4 Engine",
      engineDisplacement: isElectric ? "N/A" : "1.5L to 2.0L",
      cylinderConfiguration: isElectric ? "N/A" : "Inline 4-Cylinder",
      induction: isElectric ? "N/A" : "Naturally Aspirated or Turbocharged",
      horsepower: "130 - 188 HP",
      torque: "170 - 250 Nm",
      fuelSystem: isElectric ? "High Voltage Traction Battery Pack" : "Direct Fuel Injection",
      confidence: 72,
    },
    transmission: {
      transmissionType: transmissionInput,
      gears: isElectric ? "1-Speed" : "CVT or 6-Speed Automatic",
      driveConfiguration: "Front-Wheel Drive (FWD)",
      confidence: 70,
    },
    brakes: {
      frontBrakeType: "Ventilated Discs",
      rearBrakeType: year >= 2012 ? "Solid Discs" : "Drums / Solid Discs depending on trim",
      absAvailability: "4-Wheel ABS with Electronic Brakeforce Distribution (EBD)",
      reliabilityAssessment: "Standard OEM factory brakes; wear life behaves reliably.",
      confidence: 70,
    },
    suspension: {
      frontSuspension: "MacPherson Strut Front Suspension",
      rearSuspension: "Torsion Beam Rear Suspension",
      rideComfortRating: "Standard Ride Comfort (75/100)",
      offRoadCapabilityRating: "City commuter focus (25/100)",
      confidence: 68,
    },
    chassis: {
      groundClearance: "165 mm",
      wheelbase: "2,600 mm",
      vehicleWeight: "1,250 kg",
      fuelTankCapacity: isElectric ? "N/A" : "45 Liters",
      confidence: 65,
    },
    safety: {
      airbags: year >= 2020 ? "6 Airbags" : "2 to 4 Airbags",
      esc: "Electronic Stability Control (ESC) equipped base",
      tractionControl: "Standard Traction Control System (TCS)",
      adas: year >= 2022 ? "Active radar assist functions available on higher trims" : "None",
      safetyScore: 80,
      confidence: 70,
    },
    reliability: {
      reliabilityScore: 82,
      expectedEngineLifespan: isElectric ? "300,000+ km" : "240,000+ km under proper routine lubrication",
      expectedTransmissionLifespan: "220,000+ km",
      partsAvailability: "Highly available through standard automotive networks",
      maintenanceComplexity: "Moderate. Standard diagnostics compatible.",
      ownershipCost: "Predictable maintenance patterns.",
      confidence: 72,
    },
    commonIssues: {
      mechanicalIssues: ["Standard wear of brake rotors", "Front belt/tensioner inspections near 100k km"],
      electricalIssues: ["Standard accessory wire routing switches aging", "Odometer display bulb decay"],
      weakComponents: ["OEM suspension rubber isolators", "Plastic fluid reservoir brackets"],
      confidence: 60,
      lowConfidence: true,
    },
    ownership: {
      bestUseCase: "City Driving",
      suitabilityRatings: {
        cityDriving: 85,
        highwayTouring: 80,
        familyVehicle: 75,
        offRoading: 20,
        commercialUse: 30,
      },
      confidence: 75,
    },
  };

  // DATABASE MATCHING LOOP
  for (const entry of ENGINEERING_DATABASE_LAYER) {
    const brandMatches = entry.brands.some(b => brand.includes(b));
    const modelMatches = entry.models.some(m => model.includes(m) || m.includes(model));
    let yearMatches = true;
    if (entry.startYear && year < entry.startYear) yearMatches = false;
    if (entry.endYear && year > entry.endYear) yearMatches = false;

    if (brandMatches && modelMatches && yearMatches) {
      // Exceeds 85% requirement -> 95% Confidence match
      return {
        dataSource: "Database Match",
        confidenceScore: 96,
        generation: entry.generation,
        engineCode: entry.engineCode,
        chassisType: entry.chassisType,
        powertrain: {
          engineType: entry.engineType,
          engineDisplacement: entry.engineCapacity,
          cylinderConfiguration: "Inline-4 layout",
          induction: entry.engineType.toLowerCase().includes("turbo") ? "Turbocharged" : "Naturally Aspirated",
          horsepower: entry.horsepower,
          torque: entry.torque,
          fuelSystem: entry.engineType.toLowerCase().includes("diesel") ? "Common Rail Direct Diesel Injection" : "Smart Multi-Point Fuel Injection",
          confidence: 96,
        },
        transmission: {
          transmissionType: transmissionInput,
          gears: entry.transmissionTypes.join(" or "),
          driveConfiguration: entry.drivetrain,
          confidence: 95,
        },
        brakes: {
          frontBrakeType: entry.frontBrakeType,
          rearBrakeType: entry.rearBrakeType,
          absAvailability: "ABS with EBD standard",
          reliabilityAssessment: "Excellent mechanical integrity under extreme load cycles.",
          confidence: 94,
        },
        suspension: {
          frontSuspension: entry.frontSuspension,
          rearSuspension: entry.rearSuspension,
          rideComfortRating: `High (comfort rating ${entry.brands.includes("toyota") ? "78" : "86"}/100)`,
          offRoadCapabilityRating: `Suitability (${entry.bestUseCase === "Off-Roading" ? "92" : "25"}/100)`,
          confidence: 93,
        },
        chassis: {
          groundClearance: entry.groundClearance,
          wheelbase: entry.wheelbase,
          vehicleWeight: entry.vehicleWeight,
          fuelTankCapacity: entry.fuelTankCapacity,
          confidence: 95,
        },
        safety: {
          airbags: entry.airbags,
          esc: entry.esc,
          tractionControl: entry.tractionControl,
          adas: entry.adas,
          safetyScore: entry.safetyScore,
          confidence: 92,
        },
        reliability: {
          reliabilityScore: entry.reliabilityScore,
          expectedEngineLifespan: entry.expectedEngineLifespan,
          expectedTransmissionLifespan: entry.expectedTransmissionLifespan,
          partsAvailability: entry.partsAvailability,
          maintenanceComplexity: entry.maintenanceComplexity,
          ownershipCost: entry.ownershipCost,
          confidence: 90,
        },
        commonIssues: {
          mechanicalIssues: entry.mechanicalIssues,
          electricalIssues: entry.electricalIssues,
          weakComponents: entry.weakComponents,
          confidence: 91,
          lowConfidence: false,
        },
        ownership: {
          bestUseCase: entry.bestUseCase,
          suitabilityRatings: {
            cityDriving: entry.cityDriving,
            highwayTouring: entry.highwayTouring,
            familyVehicle: entry.familyVehicle,
            offRoading: entry.offRoading,
            commercialUse: entry.commercialUse,
          },
          confidence: 95,
        },
      };
    }
  }

  // ALGORITHMIC FALLBACK AS HYBRID OR DYNAMIC ESTIMATION
  // We can do a broader brand/model category analysis
  const knownJapanese = ["toyota", "honda", "nissan", "suzuki", "mazda", "lexus"].includes(brand);
  const knownGerman = ["bmw", "mercedes", "audi", "porsche", "volkswagen", "skoda"].includes(brand);
  const isHeavyDutyRange = model.includes("safari") || model.includes("cruiser") || model.includes("scorpio") || model.includes("thar") || model.includes("f-150") || model.includes("truck") || model.includes("duster") || model.includes("suv") || model.includes("creta");

  let computedEngineType = defaultInfo.powertrain.engineType;
  let computedEngineDisp = defaultInfo.powertrain.engineDisplacement;
  let computedHorsepower = defaultInfo.powertrain.horsepower;
  let computedTorque = defaultInfo.powertrain.torque;
  let computedGroundClearance = defaultInfo.chassis.groundClearance;
  let computedChassisType = "Monocoque Chassis";
  
  if (isHeavyDutyRange) {
    computedEngineType = fuelTypeInput.toLowerCase() === "diesel" ? "Variable Turbocharged Diesel" : "V6 or Large Displacement inline engine";
    computedEngineDisp = fuelTypeInput.toLowerCase() === "diesel" ? "2.0L to 2.5L" : "2.0L to 3.5L";
    computedHorsepower = "140 - 195 HP";
    computedTorque = "320 - 450 Nm";
    computedGroundClearance = "190 mm to 215 mm";
    computedChassisType = "Ladder Frame / Rugged Monocoque";
  }

  // Set as "Hybrid Analysis" since we can infer some details but don't do full DB match
  const hybridResponse: VehicleArchitectureInfo = {
    dataSource: "Hybrid Analysis",
    confidenceScore: 78, // less than 85, so displays "Estimated Specification"
    generation: "Generic Generation",
    chassisType: computedChassisType,
    powertrain: {
      ...defaultInfo.powertrain,
      engineType: computedEngineType,
      engineDisplacement: computedEngineDisp,
      horsepower: computedHorsepower,
      torque: computedTorque,
      confidence: 78,
    },
    transmission: {
      ...defaultInfo.transmission,
      confidence: 76,
    },
    brakes: {
      ...defaultInfo.brakes,
      confidence: 75,
    },
    suspension: {
      ...defaultInfo.suspension,
      frontSuspension: isHeavyDutyRange ? "Double Wishbone Front suspension" : "MacPherson Struts with stabilizer bar",
      rearSuspension: isHeavyDutyRange ? "Multi-link live suspension" : "Torsion Beam Rear suspension",
      confidence: 74,
    },
    chassis: {
      ...defaultInfo.chassis,
      groundClearance: computedGroundClearance,
      confidence: 75,
    },
    safety: {
      ...defaultInfo.safety,
      confidence: 76,
    },
    reliability: {
      ...defaultInfo.reliability,
      reliabilityScore: knownJapanese ? 90 : knownGerman ? 82 : 78,
      partsAvailability: knownJapanese ? "Excellent parts pipeline" : "Moderate to High availability",
      confidence: 75,
    },
    commonIssues: {
      mechanicalIssues: knownJapanese 
        ? ["AC cooling performance loss after high seasonal loading", "Thermostat housing seal inspection recommended"]
        : ["Oil coolant gasket fatigue weepage near older timelines", "Plastic engine deck covers rattle"],
      electricalIssues: knownJapanese
        ? ["Slight cluster widget dimming", "Power cabin locks bind under dust"]
        : ["Interior ambient switch fatigue", "Auxiliary battery drop alerts"],
      weakComponents: ["OEM suspension bushes", "Front plastic underbody clips"],
      confidence: 68,
      lowConfidence: true,
    },
    ownership: {
      ...defaultInfo.ownership,
      bestUseCase: isHeavyDutyRange ? "Family Vehicle" : "City Driving",
      suitabilityRatings: {
        cityDriving: isHeavyDutyRange ? 65 : 90,
        highwayTouring: isHeavyDutyRange ? 80 : 78,
        familyVehicle: isHeavyDutyRange ? 85 : 72,
        offRoading: isHeavyDutyRange ? 60 : 15,
        commercialUse: isHeavyDutyRange ? 70 : 35,
      },
      confidence: 78,
    },
  };

  return hybridResponse;
}
