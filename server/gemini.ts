import { GoogleGenAI, Type } from "@google/genai";
import { VehicleInput, VerificationReport, MaintenanceItem, ItemConditionAnalysis, PriceValidation, FraudRisk } from "../src/types";
import { findVehicleArchitecture } from "./architecture";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;

  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY environment variable is not defined or is placeholder. Using smart simulation fallback.");
    return null;
  }

  aiClient = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return aiClient;
}

// Dynamic service and maintenance prediction engine
export function calculateDynamicMaintenance(vehicle: VehicleInput): {
  items: MaintenanceItem[];
  total1Year: number;
  total3Years: number;
  confidence: number;
  estimateUnavailable?: boolean;
} {
  const currentYear = new Date().getFullYear();
  
  // Validate presence of required data. If age is impossible or kilometers is invalid, return "Estimate unavailable"
  if (
    !vehicle.year || 
    vehicle.year <= 1900 || 
    vehicle.year > currentYear + 1 ||
    vehicle.kilometers === undefined || 
    vehicle.kilometers === null || 
    vehicle.kilometers < 0 ||
    !vehicle.brand ||
    !vehicle.model ||
    !vehicle.fuelType ||
    !vehicle.transmission ||
    vehicle.ownerCount === undefined ||
    vehicle.ownerCount === null
  ) {
    return {
      items: [],
      total1Year: 0,
      total3Years: 0,
      confidence: 0,
      estimateUnavailable: true
    };
  }

  const age = Math.max(0, currentYear - vehicle.year);
  const km = vehicle.kilometers;
  
  // Do not assume premium multiplier if brand is empty or standard
  const isPremium = ["bmw", "mercedes", "audi", "porsche", "lexus", "jaguar", "land rover", "tesla"].includes(vehicle.brand.toLowerCase());
  const brandMultiplier = isPremium ? 1.5 : 1.0;
  const ownerMultiplier = 1.0 + Math.max(0, (vehicle.ownerCount - 1) * 0.05);

  // 1. Oil Service: Estimate from mileage.
  let oil1Yr = 0;
  let oil3Yr = 0;
  let oilDesc = "";
  let oilReason = "";
  let oilConfidence = 92;

  if (vehicle.fuelType.toLowerCase() === "electric") {
    oil1Yr = Math.round(2000 * brandMultiplier * (1.0 + (km / 250000)));
    oil3Yr = Math.round(6000 * brandMultiplier * (1.0 + (km / 250000)));
    oilDesc = "Powertrain utilizes non-combustion electric motor fluids. Cost includes cabin safety filtration and coolant audit.";
    oilReason = "Routine checkup recommended based on pure electric drivetrain configuration.";
    oilConfidence = Math.max(70, Math.min(95, Math.round(92 - (vehicle.ownerCount * 1.5))));
  } else {
    // Basic service runs every 10k-15k km. Cost scales with mileage
    const baseOilCost = vehicle.fuelType.toLowerCase() === "diesel" ? 5000 : vehicle.fuelType.toLowerCase() === "hybrid" ? 4500 : 4000;
    const usageFactor = parseFloat((1 + km / 150000).toFixed(2));
    oil1Yr = Math.round(baseOilCost * usageFactor * brandMultiplier * ownerMultiplier);
    oil3Yr = Math.round(oil1Yr * 2.8);
    oilDesc = `Routine micro-synthetic oil fluid, gasket sealant review, and filters matching optimized ${vehicle.fuelType} propulsion rules.`;
    oilReason = `Service timing is dynamically estimated from current odometer mileage of ${km.toLocaleString('en-IN')} km.`;
    oilConfidence = Math.max(70, Math.min(96, Math.round(94 - (km / 200000) - (vehicle.ownerCount * 1.0))));
  }

  // 2. Battery & Electrical: Only recommend if vehicle age justifies replacement (usually 4+ years)
  // Do not assume battery age equals vehicle manufacturing year.
  // Do not force battery replacement.
  let bat1Yr = 0;
  let bat3Yr = 0;
  let batDesc = "";
  let batReason = "";
  let batConfidence = 85;

  // Realistically, the standard 12V battery might have been replaced before, especially if vehicle age is high.
  const isBatteryDueForInspection = age >= 4;
  
  if (isBatteryDueForInspection) {
    // Recommend inspection/preventative diagnostic rather than forcing replacement.
    bat1Yr = Math.round(8500 * brandMultiplier * (1.1 + (km / 250000)));
    bat3Yr = Math.round(bat1Yr * 1.3);
    batDesc = "Auxiliary 12V voltage integrity diagnostic, alternator charging profile, and terminal cleaning.";
    batReason = `Inspection suggested because estimated vehicle age of ${age} years implies original battery may have lost chemical capacity.`;
    batConfidence = Math.max(55, Math.min(90, Math.round(75 - (age * 1.5))));
  } else {
    // New vehicle or low age, replacement not recommended. Only visual diagnostic.
    bat1Yr = 0;
    bat3Yr = Math.round(9200 * brandMultiplier * (1.0 + (km / 300000)));
    batDesc = "Periodic electrical circuit load monitoring, clean connection points checks, and terminal state preservation.";
    batReason = `Replacement not recommended as vehicle age of ${age} years indicates auxiliary system battery remains viable.`;
    batConfidence = Math.max(55, Math.min(90, Math.round(85 - (age * 2))));
  }

  // 3. Brake Pads & Sensors: Estimate using mileage and age
  // Braking wear thresholds typically reached at 42,000 km intervals. Wear recommendation must depend on mileage.
  let brake1Yr = 0;
  let brake3Yr = 0;
  let brakeDesc = "";
  let brakeReason = "";
  let brakeConfidence = 85;

  const standardBrakeCycle = 40000;
  const currentBrakeCycleProgress = km % standardBrakeCycle;
  const isBrakeReplacementDue = currentBrakeCycleProgress > 32000 || (km > 50000 && currentBrakeCycleProgress > 25000);

  if (isBrakeReplacementDue) {
    brake1Yr = Math.round(12000 * brandMultiplier * (1.0 + (km / 160000)));
    brake3Yr = Math.round(brake1Yr * 2.2);
    brakeDesc = "Replacement of friction brake padding, wear warning sensors, caliper piston health check, and hydraulic bleed.";
    brakeReason = `Brake pad monitoring suggested as mileage of ${km.toLocaleString('en-IN')} km is highly correlated with friction material depletion.`;
    brakeConfidence = Math.max(60, Math.min(95, Math.round(88 - (currentBrakeCycleProgress % 5000) / 250)));
  } else {
    // Brake life still remaining, only recommended inspection
    brake1Yr = 0;
    brake3Yr = Math.round(13000 * brandMultiplier * (1.0 + (km / 180000)));
    brakeDesc = "Rotor friction surface audit, padding depth measurement, and brake line fluid inspection.";
    brakeReason = `Operating depth checks as satisfactory for ${km.toLocaleString('en-IN')} km; standard continuous visual logging recommended.`;
    brakeConfidence = 65; 
  }

  // 4. Tyres & Alignment: Recommend only if wear threshold likely reached (e.g. 40,000+ km)
  // Do not recommend tyre replacement only from age.
  let tyre1Yr = 0;
  let tyre3Yr = 0;
  let tyreDesc = "";
  let tyreReason = "";
  let tyreConfidence = 85;

  const standardTyreCycle = 45000;
  const kmSinceTyres = km % standardTyreCycle;
  const areTyresDueForReplacement = kmSinceTyres > 36000 && km >= 15000;

  if (areTyresDueForReplacement) {
    tyre1Yr = Math.round(28000 * brandMultiplier * ownerMultiplier);
    tyre3Yr = Math.round(tyre1Yr + 7000);
    tyreDesc = "Complete premium compound tires set replacement, precise four-wheel computer alignment, and rim safety balancing.";
    tyreReason = `Tyre replacement suggested as vehicle odometer indicates ${km.toLocaleString('en-IN')} km, likely approaching standard tire tread wear depth limits.`;
    tyreConfidence = Math.max(62, Math.min(95, Math.round(84 - (vehicle.ownerCount * 1.5))));
  } else {
    // Tyre rotation and wheel balance only
    tyre1Yr = Math.round(3000 * brandMultiplier);
    tyre3Yr = Math.round((28000 + 3000) * brandMultiplier);
    tyreDesc = "Radial tire rotation, electronic wheel balance preservation, and inflation safety matching.";
    tyreReason = `Replacement not recommended based on current cycle position (${km.toLocaleString('en-IN')} km). Rotation check suggested to balance wear.`;
    tyreConfidence = 68; // Under 70 -> "Inspection Recommended"
  }

  // 5. General Mechanical / Belts: Estimate from age and usage
  // General maintenance should not exceed realistic values
  let gen1Yr = 0;
  let gen3Yr = 0;
  let genDesc = "";
  let genReason = "";
  let genConfidence = 90;

  const drivetrainFactor = vehicle.transmission.toLowerCase() === "automatic" ? 1.12 : 1.0;
  const usageScaleInr = (age * 700) + (km / 60);
  gen1Yr = Math.round(Math.min(18000, 5000 + usageScaleInr) * brandMultiplier * ownerMultiplier * drivetrainFactor);
  gen3Yr = Math.round(gen1Yr * 2.4 + 5000);
  genDesc = "Chassis bushing check, drive belts fatigue analysis, exhaust system mounting clips inspection, and fluid leak tests.";
  genReason = `Drivetrain diagnostics scheduled dynamically matching ${vehicle.transmission} systems, vehicle usage, and age parameters.`;
  genConfidence = Math.round(Math.max(70, Math.min(94, 91 - (age * 1.2) - (vehicle.ownerCount * 1.0))));

  const items: MaintenanceItem[] = [
    { name: "Oil Service & Fluids", cost1Year: oil1Yr, cost3Years: oil3Yr, description: oilDesc, reason: oilConfidence < 70 ? "Inspection Recommended. " + oilReason : oilReason, confidence: oilConfidence },
    { name: "Battery & Electrical", cost1Year: bat1Yr, cost3Years: bat3Yr, description: batDesc, reason: batConfidence < 70 ? "Inspection Recommended. " + batReason : batReason, confidence: batConfidence },
    { name: "Brake Pads & Sensors", cost1Year: brake1Yr, cost3Years: brake3Yr, description: brakeDesc, reason: brakeConfidence < 70 ? "Inspection Recommended. " + brakeReason : brakeReason, confidence: brakeConfidence },
    { name: "Tyres & Alignment", cost1Year: tyre1Yr, cost3Years: tyre3Yr, description: tyreDesc, reason: tyreConfidence < 70 ? "Inspection Recommended. " + tyreReason : tyreReason, confidence: tyreConfidence },
    { name: "General Mechanical / Belts", cost1Year: gen1Yr, cost3Years: gen3Yr, description: genDesc, reason: genConfidence < 70 ? "Inspection Recommended. " + genReason : genReason, confidence: genConfidence }
  ];

  const total1Year = items.reduce((sum, item) => sum + item.cost1Year, 0);
  const total3Years = items.reduce((sum, item) => sum + item.cost3Years, 0);
  const confidence = Math.max(72, Math.min(95, Math.round(95 - (age * 1.2) - (km / 35000))));

  return {
    items,
    total1Year,
    total3Years,
    confidence
  };
}

// Determine realistic baseline new MSRP in INR for major brands/models
function getNewMSRPInr(brand: string, model: string): number {
  const b = brand.toLowerCase();
  const m = model.toLowerCase();
  
  if (m.includes("fortuner")) return 4200000;
  if (m.includes("city")) return 1400000;
  if (m.includes("swift")) return 750000;
  if (m.includes("baleno")) return 800000;
  if (m.includes("i20") || m.includes("verna")) return 1100000;
  if (m.includes("creta") || m.includes("seltos")) return 1600000;
  if (m.includes("thar") || m.includes("scorpion") || m.includes("scorpio")) return 1700000;
  if (m.includes("civic")) return 2000000;
  if (m.includes("camry")) return 4500000;
  if (m.includes("corolla")) return 1800000;
  if (m.includes("model 3")) return 4100000;
  if (m.includes("model y")) return 5500000;
  if (m.includes("3-series") || m.includes("3 series") || m.includes("bmw 3")) return 5500000;
  if (m.includes("5-series") || m.includes("5 series") || m.includes("bmw 5")) return 7000000;
  if (m.includes("c-class") || m.includes("c class")) return 6000000;
  if (m.includes("e-class") || m.includes("e class")) return 7500000;
  if (m.includes("f-150") || m.includes("f150")) return 5000000;

  if (["bmw", "mercedes", "audi", "porsche", "lexus", "jaguar", "land rover"].includes(b)) {
    return 6000000;
  }
  
  if (["hyundai", "honda", "toyota", "skoda", "volkswagen", "tata", "mahindra"].includes(b)) {
    return 1500000;
  }
  
  return 800000;
}

// Get realistic market boundaries in INR based on year, kilometers, and ownership
export function getRealisticBoundaries(
  brand: string,
  model: string,
  year: number,
  kilometers: number,
  ownerCount: number,
  fuelType: string = "Petrol",
  transmission: string = "Automatic"
) {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);
  const b = brand.toLowerCase();
  const m = model.toLowerCase();
  const fuel = fuelType.toLowerCase();
  const trans = transmission.toLowerCase();

  const msrp = getNewMSRPInr(brand, model);
  
  // Brand Strength & Reliability Index (0-100 scales)
  let reliabilityIndex = 78; // average baseline
  if (b.includes("toyota")) reliabilityIndex = 96;
  else if (b.includes("maruti") || b.includes("suzuki")) reliabilityIndex = 92;
  else if (b.includes("honda")) reliabilityIndex = 90;
  else if (b.includes("hyundai")) reliabilityIndex = 86;
  else if (b.includes("mahindra")) reliabilityIndex = 82;
  else if (["bmw", "mercedes", "audi", "porsche", "lexus"].some(x => b.includes(x))) reliabilityIndex = 74;

  const strongBrand = ["toyota", "maruti", "maruti suzuki", "mahindra", "honda", "hyundai"].some(x => b.includes(x));
  const luxuryBrand = ["bmw", "mercedes", "audi", "porsche", "lexus", "jaguar", "land rover", "jlr"].some(x => b.includes(x));

  // Determine depreciation rate modifier based on reliability and brand strength
  let modifier = (82 - reliabilityIndex) / 1000; // e.g. for Toyota: -0.014 (1.4% slower depreciation)
  if (luxuryBrand) modifier += 0.025; // Luxury cars lose value significantly faster is India due to high upkeep
  if (strongBrand) modifier -= 0.01;

  // Fuel Type & Transmission adjustments for India
  if (trans.includes("automatic")) {
    modifier -= 0.005; // automatics preserve slightly better value
  }
  const isSUV = ["fortuner", "thar", "scorpio", "creta", "seltos"].some(n => m.includes(n));
  if (isSUV && fuel.includes("diesel")) {
    modifier -= 0.015; // diesel SUVs hold massive resale value in India
  } else if (!isSUV && fuel.includes("diesel")) {
    // 10-year diesel rule in Delhi NCR causes faster depreciation for standard sedans/hatchbacks
    modifier += 0.015;
  }

  // Compound year-by-year depreciation
  let depreciatedValue = msrp;
  for (let yr = 1; yr <= age; yr++) {
    let rate = 0.12; 
    if (yr >= 1 && yr <= 3) {
      rate = 0.125 + modifier; // 10% to 15% rate range
      if (rate < 0.10) rate = 0.10;
      if (rate > 0.15) rate = 0.15;
    } else if (yr >= 4 && yr <= 7) {
      rate = 0.10 + modifier * 0.8; // 8% to 12% rate range
      if (rate < 0.08) rate = 0.08;
      if (rate > 0.12) rate = 0.12;
    } else if (yr >= 8 && yr <= 12) {
      rate = 0.08 + modifier * 0.6; // 6% to 10% rate range
      if (rate < 0.06) rate = 0.06;
      if (rate > 0.10) rate = 0.10;
    } else {
      rate = 0.05; // slow down after 12 years to approach floor
    }
    depreciatedValue *= (1 - rate);
  }

  // Mileage Adjustment: compare to standard 12,000 km per year cumulative
  const standardCumulativeKm = age * 12000;
  let mileageFactor = 1.0;
  if (kilometers > standardCumulativeKm) {
    const excessKm = kilometers - standardCumulativeKm;
    mileageFactor = Math.max(0.78, 1.0 - (excessKm / 180000) * 0.12);
  } else if (kilometers < standardCumulativeKm && age > 0) {
    const deficiencyKm = standardCumulativeKm - kilometers;
    mileageFactor = Math.min(1.08, 1.0 + (deficiencyKm / 180000) * 0.05);
  }
  depreciatedValue *= mileageFactor;

  // Ownership Turnaround Penalty
  let ownerFactor = 1.0;
  if (ownerCount > 1) {
    ownerFactor = Math.max(0.75, 1.10 - (ownerCount * 0.08));
  }
  depreciatedValue *= ownerFactor;

  // Market Floor Valuation (12+ years or low-end floor)
  let floorPct = 0.12;
  if (strongBrand) floorPct = 0.15;
  if (luxuryBrand) floorPct = 0.08;
  let floorValue = msrp * floorPct;

  // absolute segment block floor values in India
  let absoluteFloor = 110000;
  if (isSUV) {
    absoluteFloor = 480000;
  } else if (["city", "verna", "civic"].some(n => m.includes(n))) {
    absoluteFloor = 180000;
  }
  if (floorValue < absoluteFloor) floorValue = absoluteFloor;

  let expectedMiddle = Math.round(depreciatedValue);
  if (age >= 12 || expectedMiddle < floorValue) {
    expectedMiddle = Math.round(floorValue);
  }

  // Establish base boundaries
  let minBound = Math.round(expectedMiddle * 0.85);
  let maxBound = Math.round(expectedMiddle * 1.15);

  // SANITY CHECK LAYER & RECALCULATION
  // Prevents unrealistic boundaries on major models like Honda City and Toyota Fortuner
  if (m.includes("city")) {
    if (year <= 2013) {
      // 2013 or older Honda City should never exceed realistic used market levels
      minBound = 180000;
      maxBound = 360000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 270000;
    } else if (year >= 2019 && year <= 2022) {
      minBound = 750000;
      maxBound = 1200000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 950000;
    } else if (year >= 2023) {
      minBound = 1050000;
      maxBound = 1550000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 1250000;
    }
  }

  if (m.includes("fortuner")) {
    if (year <= 2013) {
      minBound = 850000;
      maxBound = 1450000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 1150000;
    } else if (year >= 2022) {
      // 2023 Fortuner should not collapse to unrealistic low values
      minBound = 3250000;
      maxBound = 4550000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 3850000;
    }
  }

  if (m.includes("i20")) {
    if (year <= 2013) {
      minBound = 160000;
      maxBound = 270000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 210000;
    } else if (year >= 2020 && year <= 2023) {
      minBound = 520000;
      maxBound = 840000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 670000;
    }
  }

  if (m.includes("swift")) {
    if (year <= 2013) {
      minBound = 150000;
      maxBound = 250000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 1950000;
    } else if (year >= 2020 && year <= 2023) {
      minBound = 460000;
      maxBound = 690000;
      if (expectedMiddle < minBound || expectedMiddle > maxBound) expectedMiddle = 560000;
    }
  }

  return { expectedMiddle, minBound, maxBound };
}

// Sophisticated simulation engine if Gemini is offline/not key-integrated
function runMockAnalysis(vehicle: VehicleInput, hasImages: { front?: boolean; back?: boolean; side?: boolean; interior?: boolean }): Partial<VerificationReport> {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - vehicle.year);
  
  // Base calculations
  // Average standard driving is 12,000 to 15,000 km per year
  const expectedMileage = age * 13500;
  const mileageCap = Math.max(vehicle.kilometers, 100);
  
  // 1. Fraud Checks
  const unusualMileageFlag = age > 2 && vehicle.kilometers < age * 2500;
  const unusualMileageDesc = unusualMileageFlag 
    ? `Odometer reads extremely low (${vehicle.kilometers.toLocaleString('en-IN')} km in ${age} years). Potential odometer rollback or long-term storage.`
    : `Odometer verification: Unable to verify complete dashboard history. Current readout (${vehicle.kilometers.toLocaleString('en-IN')} km) aligns with baseline expectations.`;

  const priceDeviationPct = Math.min(1.5, Math.max(0.4, 1.0 - (age * 0.08) - (vehicle.kilometers / 250000)));
  let estimatedMarketBase = Math.round(vehicle.price * priceDeviationPct);
  
  // Check if result falls within realistic used-car market boundaries and trigger recalculation if outside
  const { expectedMiddle, minBound, maxBound } = getRealisticBoundaries(vehicle.brand, vehicle.model, vehicle.year, vehicle.kilometers, vehicle.ownerCount, vehicle.fuelType, vehicle.transmission);
  if (estimatedMarketBase < minBound || estimatedMarketBase > maxBound) {
    estimatedMarketBase = expectedMiddle;
  }
  
  const priceManipulationFlag = vehicle.price < estimatedMarketBase * 0.6 || vehicle.price > estimatedMarketBase * 1.5;
  const priceManipulationDesc = priceManipulationFlag
    ? `Seller price of ₹${vehicle.price.toLocaleString('en-IN')} deviates significantly from the model estimates. High risk of hidden issues.`
    : `Listing price verification: Unable to verify presence of hidden broker commissions or private seller collusion. Price matches standard models.`;

  const multipleOwnerRiskFlag = vehicle.ownerCount >= 3 && age <= 4;
  const multipleOwnerRiskDesc = multipleOwnerRiskFlag
    ? `Vehicle had ${vehicle.ownerCount} owners in just ${age} years. Frequent turnover points to potential chronic issues.`
    : `Registry turnaround check: Unable to verify full chain of custody history. Present user states ${vehicle.ownerCount} previous owner(s).`;

  let fraudScore = 5;
  if (unusualMileageFlag) fraudScore += 45;
  if (priceManipulationFlag) fraudScore += 25;
  if (multipleOwnerRiskFlag) fraudScore += 20;

  // 2. Trust Score
  let trustScore = 95;
  // Age penalty: -3% per year
  trustScore -= age * 3.5;
  // Mileage penalty: -1% per 10k km
  trustScore -= (vehicle.kilometers / 8000);
  // Owner Count penalty: -8% per owner beyond 1
  if (vehicle.ownerCount > 1) {
    trustScore -= (vehicle.ownerCount - 1) * 7.5;
  }
  // Fraud score penalty
  trustScore -= (fraudScore * 0.4);

  trustScore = Math.max(10, Math.min(99, Math.round(trustScore)));

  let trustCategory: "Excellent" | "Good" | "Risky" | "Avoid" = "Good";
  if (trustScore >= 80) trustCategory = "Excellent";
  else if (trustScore >= 60) trustCategory = "Good";
  else if (trustScore >= 40) trustCategory = "Risky";
  else trustCategory = "Avoid";

  // 3. Maintenance Cost Simulation
  const maintenance = calculateDynamicMaintenance(vehicle);

  // 4. Item Condition mock
  const hasAnyImages = !!(hasImages && (hasImages.front || hasImages.back || hasImages.side || hasImages.interior));
  let condition: ItemConditionAnalysis;

  if (!hasAnyImages) {
    condition = {
      exteriorQuality: "Not Available",
      scratchesDetected: null,
      dentRisk: "Not Available",
      rustDetected: null,
      notes: "No vehicle photos uploaded. Upload images to enable visual inspection."
    };
  } else {
    let dentRiskValue: "None" | "Low" | "Medium" | "High" = "None";
    if (age > 8) dentRiskValue = "Medium";
    else if (age > 3) dentRiskValue = "Low";

    let extQuality: "Excellent" | "Average" | "Poor" = "Excellent";
    if (age > 10 || vehicle.kilometers > 160000) extQuality = "Poor";
    else if (age > 5 || vehicle.kilometers > 80000) extQuality = "Average";

    condition = {
      exteriorQuality: extQuality,
      scratchesDetected: age >= 4,
      dentRisk: dentRiskValue,
      rustDetected: age > 10,
      notes: `Simulated inspection indicates normal cosmetic wear for ${age} years of age. Underbody examination exhibits minor wear but solid chassis.`
    };
  }

  // 5. Price Check
  const midMarket = estimatedMarketBase;
  const marketMin = Math.round(midMarket * 0.9);
  const marketMax = Math.round(midMarket * 1.1);
  let priceCheck: "Great Deal" | "Fair Price" | "Overpriced" = "Fair Price";
  
  if (vehicle.price < marketMin) priceCheck = "Great Deal";
  else if (vehicle.price > marketMax) priceCheck = "Overpriced";

  const priceReason = priceCheck === "Great Deal" 
    ? `The vehicle is priced at ₹${vehicle.price.toLocaleString('en-IN')} which is below the estimated market range of ₹${marketMin.toLocaleString('en-IN')} - ₹${marketMax.toLocaleString('en-IN')}. Excellent pricing window.`
    : priceCheck === "Overpriced"
    ? `The seller's pricing is significantly above similar localized listings. Recommended target value is ₹${midMarket.toLocaleString('en-IN')}.`
    : `Priced fairly within standard market bandwidths (₹${marketMin.toLocaleString('en-IN')} - ₹${marketMax.toLocaleString('en-IN')}).`;

  // Final recommendation
  let recommendation: "BUY" | "NEGOTIATE" | "AVOID" = "BUY";
  if (trustScore < 45 || fraudScore > 50) {
    recommendation = "AVOID";
  } else if (trustScore < 75 || priceCheck === "Overpriced" || vehicle.ownerCount >= 3) {
    recommendation = "NEGOTIATE";
  }

  const recommendationReason = recommendation === "BUY"
    ? `The ${vehicle.brand} ${vehicle.model} represents an excellent deal. Solid score of ${trustScore}%, reasonable mileage, minimal fraud signals, and healthy market valuation.`
    : recommendation === "NEGOTIATE"
    ? `A solid car but requires price adjustments and a physical test drive. Price check is ${priceCheck} and owner history (${vehicle.ownerCount} owners) or future servicing cost recommends negotiating toward ₹${marketMin.toLocaleString('en-IN')}.`
    : `Avoid this purchase. The high fraud score (${fraudScore}%) paired with an aging frame and high owner turnaround represents excessive financial and structural risk.`;

  return {
    trustScore,
    trustCategory,
    trustReason: `Based on chronological parameters, this ${vehicle.brand} ${vehicle.model} displays reliable indicators. Odometer records average ${Math.round(vehicle.kilometers / (age || 1)).toLocaleString('en-IN')} km/year. Final calculations weight depreciation curves smoothly.`,
    maintenance,
    condition,
    priceValidation: {
      estimatedMarketPrice: midMarket,
      priceCheck,
      marketMin,
      marketMax,
      reason: priceReason
    },
    fraudRisk: {
      score: fraudScore,
      unusualMileage: { flag: unusualMileageFlag, description: unusualMileageDesc },
      priceManipulation: { flag: priceManipulationFlag, description: priceManipulationDesc },
      multipleOwnerRisk: { flag: multipleOwnerRiskFlag, description: multipleOwnerRiskDesc },
      summary: "Unable to verify accident history, hidden damage history, or complete title background. Fraud projection index calculated at " + fraudScore + "/100 based on price deviations and odometer consistency."
    },
    recommendation,
    recommendationReason
  };
}

export async function generateVerificationReport(
  vehicle: VehicleInput,
  images: { front?: string; back?: string; side?: string; interior?: string }
): Promise<VerificationReport> {
  const hasImages = {
    front: !!images.front,
    back: !!images.back,
    side: !!images.side,
    interior: !!images.interior
  };

  const ai = getGeminiClient();
  const id = "rep_" + Math.random().toString(36).substring(2, 11);
  const createdAt = new Date().toISOString();

  const { expectedMiddle, minBound, maxBound } = getRealisticBoundaries(vehicle.brand, vehicle.model, vehicle.year, vehicle.kilometers, vehicle.ownerCount, vehicle.fuelType, vehicle.transmission);

  // If no AI available, run the smart mock immediately
  if (!ai) {
    const mockData = runMockAnalysis(vehicle, hasImages);
    const report: VerificationReport = {
      id,
      userId: "",
      vehicle,
      images: hasImages,
      createdAt,
      trustScore: mockData.trustScore!,
      trustCategory: mockData.trustCategory!,
      trustReason: mockData.trustReason!,
      maintenance: mockData.maintenance!,
      condition: mockData.condition!,
      priceValidation: mockData.priceValidation!,
      fraudRisk: mockData.fraudRisk!,
      recommendation: mockData.recommendation!,
      recommendationReason: mockData.recommendationReason!
    };
    enrichReportWithConfidenceAndReasons(vehicle, report, hasImages.front || hasImages.back || hasImages.side || hasImages.interior);
    return report;
  }

  try {
    const prompt = `You are CarTrust AI, an elite automotive verification system. Return a comprehensive evaluation report in JSON format based on the following vehicle:
Brand: ${vehicle.brand}
Model: ${vehicle.model}
Year: ${vehicle.year}
Kilometers Driven: ${vehicle.kilometers.toLocaleString('en-IN')}
Fuel Type: ${vehicle.fuelType}
Transmission: ${vehicle.transmission}
Owner Count: ${vehicle.ownerCount}
Seller Listed Price: ₹${vehicle.price.toLocaleString('en-IN')} INR
Location: ${vehicle.location}

Note: For Segment / Valuation Calibration Validation, realistic used-car market price range boundaries for this vehicle segment in India are roughly ₹${minBound.toLocaleString('en-IN')} to ₹${maxBound.toLocaleString('en-IN')} INR. Ensure your estimatedMarketPrice fits realistically within these boundaries.

Images provided: ${Object.keys(images).filter(k => !!images[k as keyof typeof images]).join(", ") || "None"}

Requirements for the generated JSON properties:
- trustScore: integer between 0 and 100.
- trustCategory: One of: "Excellent", "Good", "Risky", "Avoid". (80-100 = Excellent, 60-79 = Good, 40-59 = Risky, 0-39 = Avoid).
- trustReason: detailed paragraph summarizing why this score was designated, inspecting mileage, age, owners, etc.
- maintenance: {
    items: Array of 5 items with: { name, cost1Year (int), cost3Years (int), description }. Include Oil service, Battery, Brake, Tyres, General maintenance. All pricing must be in INR (Indian Rupee) with realistic Indian servicing costs (e.g. Oil Service approx ₹4,000, Battery approx ₹8,500, Brake Pads approx ₹12,000, Tyres approx ₹28,000).
    total1Year: sum of 1 year maintenance costs in INR.
    total3Years: sum of 3 year maintenance costs in INR.
    confidence: integer 0-100 of prediction confidence.
  }
- condition: {
    exteriorQuality: "Excellent", "Average", "Poor", or "Not Available". (If no images are provided, set to "Not Available" or null).
    scratchesDetected: boolean or null. (If no images are provided, set to null).
    dentRisk: "None", "Low", "Medium", "High", or "Not Available". (If no images are provided, set to "Not Available" or null).
    rustDetected: boolean or null. (If no images are provided, set to null).
    notes: Detailed paragraph summarizing visual elements found from the images. If images are absent, MUST set to "No vehicle photos uploaded. Upload images to enable visual inspection."
  }
- priceValidation: {
    estimatedMarketPrice: fair market middle-point price in INR.
    priceCheck: "Great Deal", "Fair Price", or "Overpriced".
    marketMin: low-end market price in INR.
    marketMax: high-end market price in INR.
    reason: short explanation analyzing the valuation (all numeric responses and explanations must refer to Indian Rupees with prefix ₹).
  }
- fraudRisk: {
    score: integer 0-100 indicating fraud probability.
    unusualMileage: { flag (boolean), description (string) }. (Flag true if odometer rollback is highly probable e.g. <3000 km per year).
    priceManipulation: { flag (boolean), description (string) }. (Flag true if overpriced or suspiciously underpriced).
    multipleOwnerRisk: { flag (boolean), description (string) }. (Flag true if owners > 3).
    summary: high-level fraud summary paragraph.
  }
- recommendation: "BUY", "NEGOTIATE", or "AVOID".
- recommendationReason: clear rationale justifying the final procurement status.

Evaluate the attached images for dynamic condition analysis. If no vehicle photographs are provided, do NOT run visual analysis, never assume or Guess paint quality, dents, scratches, or rust, and set all those parameters to null or "Not Available" as instructed. Do not declare real government inspections! Give estimated predictions.

Response MUST be a single valid JSON object matching the properties. Do not wrap in markdown \`\`\`json blocks outside the core response schema.`;

    const contents: any[] = [prompt];

    // Add inline image data components if available to pass to Gemini
    Object.entries(images).forEach(([key, base64Str]) => {
      if (base64Str) {
        // Strip out base64 header if exists e.g. "data:image/jpeg;base64,"
        const match = base64Str.match(/^data:([^;]+);base64,(.+)$/);
        const mimeType = match ? match[1] : "image/jpeg";
        const data = match ? match[2] : base64Str;
        
        contents.push({
          inlineData: {
            mimeType,
            data
          }
        });
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trustScore: { type: Type.INTEGER, description: "Composite score 0-100" },
            trustCategory: { type: Type.STRING, enum: ["Excellent", "Good", "Risky", "Avoid"] },
            trustReason: { type: Type.STRING },
            maintenance: {
              type: Type.OBJECT,
              properties: {
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      cost1Year: { type: Type.INTEGER },
                      cost3Years: { type: Type.INTEGER },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "cost1Year", "cost3Years", "description"]
                  }
                },
                total1Year: { type: Type.INTEGER },
                total3Years: { type: Type.INTEGER },
                confidence: { type: Type.INTEGER }
              },
              required: ["items", "total1Year", "total3Years", "confidence"]
            },
            condition: {
              type: Type.OBJECT,
              properties: {
                exteriorQuality: { type: Type.STRING, enum: ["Excellent", "Average", "Poor"] },
                scratchesDetected: { type: Type.BOOLEAN },
                dentRisk: { type: Type.STRING, enum: ["None", "Low", "Medium", "High"] },
                rustDetected: { type: Type.BOOLEAN },
                notes: { type: Type.STRING }
              },
              required: ["exteriorQuality", "scratchesDetected", "dentRisk", "rustDetected", "notes"]
            },
            priceValidation: {
              type: Type.OBJECT,
              properties: {
                estimatedMarketPrice: { type: Type.INTEGER },
                priceCheck: { type: Type.STRING, enum: ["Great Deal", "Fair Price", "Overpriced"] },
                marketMin: { type: Type.INTEGER },
                marketMax: { type: Type.INTEGER },
                reason: { type: Type.STRING }
              },
              required: ["estimatedMarketPrice", "priceCheck", "marketMin", "marketMax", "reason"]
            },
            fraudRisk: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                unusualMileage: {
                  type: Type.OBJECT,
                  properties: { flag: { type: Type.BOOLEAN }, description: { type: Type.STRING } },
                  required: ["flag", "description"]
                },
                priceManipulation: {
                  type: Type.OBJECT,
                  properties: { flag: { type: Type.BOOLEAN }, description: { type: Type.STRING } },
                  required: ["flag", "description"]
                },
                multipleOwnerRisk: {
                  type: Type.OBJECT,
                  properties: { flag: { type: Type.BOOLEAN }, description: { type: Type.STRING } },
                  required: ["flag", "description"]
                },
                summary: { type: Type.STRING }
              },
              required: ["score", "unusualMileage", "priceManipulation", "multipleOwnerRisk", "summary"]
            },
            recommendation: { type: Type.STRING, enum: ["BUY", "NEGOTIATE", "AVOID"] },
            recommendationReason: { type: Type.STRING }
          },
          required: [
            "trustScore",
            "trustCategory",
            "trustReason",
            "maintenance",
            "condition",
            "priceValidation",
            "fraudRisk",
            "recommendation",
            "recommendationReason"
          ]
        }
      }
    });

    const reportJSON = JSON.parse(response.text || "{}");
    const hasAnyImages = hasImages.front || hasImages.back || hasImages.side || hasImages.interior;

    const report: VerificationReport = {
      id,
      userId: "",
      vehicle,
      images: hasImages,
      trustScore: reportJSON.trustScore ?? 75,
      trustCategory: reportJSON.trustCategory ?? "Good",
      trustReason: reportJSON.trustReason ?? "Standard automated evaluation complete.",
      maintenance: calculateDynamicMaintenance(vehicle),
      condition: !hasAnyImages ? {
        exteriorQuality: "Not Available",
        scratchesDetected: null,
        dentRisk: "Not Available",
        rustDetected: null,
        notes: "No vehicle photos uploaded. Upload images to enable visual inspection."
      } : (reportJSON.condition ?? { exteriorQuality: "Average", scratchesDetected: false, dentRisk: "Low", rustDetected: false, notes: "" }),
      priceValidation: (() => {
        const pVal = reportJSON.priceValidation ?? { estimatedMarketPrice: vehicle.price, priceCheck: "Fair Price", marketMin: vehicle.price * 0.9, marketMax: vehicle.price * 1.1, reason: "" };
        let finalEst = pVal.estimatedMarketPrice ?? vehicle.price;
        
        // Recalculate using realistic boundaries if outside target ranges
        if (finalEst < minBound || finalEst > maxBound) {
          finalEst = expectedMiddle;
        }
        
        const finalMin = Math.round(finalEst * 0.9);
        const finalMax = Math.round(finalEst * 1.1);
        let finalCheck = pVal.priceCheck || "Fair Price";
        
        if (vehicle.price < finalMin) finalCheck = "Great Deal";
        else if (vehicle.price > finalMax) finalCheck = "Overpriced";
        else finalCheck = "Fair Price";
        
        const finalReason = finalCheck === "Great Deal" 
          ? `The vehicle is priced at ₹${vehicle.price.toLocaleString('en-IN')} which is below the estimated market range of ₹${finalMin.toLocaleString('en-IN')} - ₹${finalMax.toLocaleString('en-IN')}. Excellent pricing window.`
          : finalCheck === "Overpriced"
          ? `The seller's pricing is significantly above similar localized listings. Recommended target value is ₹${finalEst.toLocaleString('en-IN')}.`
          : `Priced fairly within standard market bandwidths (₹${finalMin.toLocaleString('en-IN')} - ₹${finalMax.toLocaleString('en-IN')}).`;

        return {
          estimatedMarketPrice: finalEst,
          priceCheck: finalCheck,
          marketMin: finalMin,
          marketMax: finalMax,
          reason: finalReason
        };
      })(),
      fraudRisk: reportJSON.fraudRisk ?? { score: 10, unusualMileage: { flag: false, description: "" }, priceManipulation: { flag: false, description: "" }, multipleOwnerRisk: { flag: false, description: "" }, summary: "" },
      recommendation: reportJSON.recommendation ?? "NEGOTIATE",
      recommendationReason: reportJSON.recommendationReason ?? "",
      architectureInfo: findVehicleArchitecture(vehicle.brand, vehicle.model, vehicle.year, vehicle.fuelType, vehicle.transmission),
      createdAt
    };
    enrichReportWithConfidenceAndReasons(vehicle, report, hasAnyImages);
    return report;
  } catch (err) {
    console.error("Gemini Live report generation failed. Using simulation fallback:", err);
    const mockData = runMockAnalysis(vehicle, hasImages);
    const report: VerificationReport = {
      id,
      userId: "",
      vehicle,
      images: hasImages,
      createdAt,
      trustScore: mockData.trustScore!,
      trustCategory: mockData.trustCategory!,
      trustReason: `(Fallback Analyzer Active) ${mockData.trustReason!}`,
      maintenance: mockData.maintenance!,
      condition: mockData.condition!,
      priceValidation: mockData.priceValidation!,
      fraudRisk: mockData.fraudRisk!,
      recommendation: mockData.recommendation!,
      recommendationReason: mockData.recommendationReason!,
      architectureInfo: findVehicleArchitecture(vehicle.brand, vehicle.model, vehicle.year, vehicle.fuelType, vehicle.transmission)
    };
    enrichReportWithConfidenceAndReasons(vehicle, report, hasImages.front || hasImages.back || hasImages.side || hasImages.interior);
    return report;
  }
}

export function enrichReportWithConfidenceAndReasons(
  vehicle: VehicleInput,
  report: any,
  hasAnyImages: boolean
) {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - vehicle.year);
  const km = vehicle.kilometers;
  
  // Calculate category confidences
  const priceConf = Math.round(95 - (vehicle.ownerCount * 1.5) - (km > 120000 ? 4 : 0));
  const maintenanceConf = report.maintenance?.confidence ?? 85;
  const visualConf = hasAnyImages ? 92 : 0; 
  const fraudConf = Math.round(90 - (vehicle.ownerCount * 2) - (km > 150000 ? 5 : 0));

  // Overall Confidence is a blended rating of active parameters
  const overallConfidence = Math.round(
    hasAnyImages 
      ? (priceConf + maintenanceConf + visualConf + fraudConf) / 4
      : (priceConf + maintenanceConf + fraudConf) / 3
  );

  // Generate dynamic Reason Summary list based on actual vehicle attributes
  const reasonsList: string[] = [];
  
  // Ownership Reason
  if (vehicle.ownerCount === 1) {
    reasonsList.push("Single owner pedigree minimizes usage anomaly risk");
  } else if (vehicle.ownerCount <= 2) {
    reasonsList.push("Low owner turnaround (2 recorded owners)");
  } else {
    reasonsList.push("Multiple ownership transfers require title verification");
  }

  // Pricing Reason
  const priceCheck = report.priceValidation?.priceCheck ?? "Fair Price";
  if (priceCheck === "Great Deal") {
    reasonsList.push("Highly attractive listing price below current market average");
  } else if (priceCheck === "Fair Price") {
    reasonsList.push("Listing price is congruent with current market valuations");
  } else {
    reasonsList.push("Listed above recommended market pricing bands");
  }

  // Maintenance Reason
  const mainEst1Yr = report.maintenance?.total1Year ?? 0;
  if (mainEst1Yr === 0) {
    reasonsList.push("Maintenance projections unavailable");
  } else if (mainEst1Yr < 12500) {
    reasonsList.push("Extremely low predicted Year 1 servicing requirements");
  } else if (mainEst1Yr < 33000) {
    reasonsList.push("Manageable short-term scheduled servicing overheads");
  } else {
    reasonsList.push("Elevated maintenance costs predicted within Year 1");
  }

  // Usage indicator
  const yearlyKm = age > 0 ? km / age : km;
  if (km > 165000) {
    reasonsList.push("High cumulative odometer reading indicates chassis aging");
  } else if (yearlyKm < 6000) {
    reasonsList.push("Virtually preserved low annual driving mileage");
  } else if (yearlyKm <= 16000) {
    reasonsList.push("Standard moderate annual driving profile");
  } else {
    reasonsList.push("Above-average high annual mileage wear profile");
  }

  report.overallConfidence = overallConfidence;
  report.categoryConfidence = {
    price: priceConf,
    maintenance: maintenanceConf,
    visual: visualConf,
    fraud: fraudConf
  };
  report.reasonsList = reasonsList.slice(0, 3);
}
