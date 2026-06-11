/**
 * Core type definitions for CarTrust AI
 */

export interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  role: "user" | "admin" | "guest";
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface VehicleInput {
  brand: string;
  model: string;
  year: number;
  kilometers: number;
  fuelType: string;
  transmission: string;
  ownerCount: number;
  price: number;
  location: string;
}

export interface VehicleImages {
  front?: string; // base64
  back?: string; // base64
  side?: string; // base64
  interior?: string; // base64
}

export interface MaintenanceItem {
  name: string;
  cost1Year: number;
  cost3Years: number;
  description: string;
  reason?: string;
  confidence?: number;
}

export interface MaintenancePrediction {
  items: MaintenanceItem[];
  total1Year: number;
  total3Years: number;
  confidence: number;
  estimateUnavailable?: boolean;
}

export interface ItemConditionAnalysis {
  exteriorQuality?: "Excellent" | "Average" | "Poor" | "Not Available" | null;
  scratchesDetected?: boolean | null;
  dentRisk?: "None" | "Low" | "Medium" | "High" | "Not Available" | null;
  rustDetected?: boolean | null;
  notes: string;
}

export interface PriceValidation {
  estimatedMarketPrice: number;
  priceCheck: "Great Deal" | "Fair Price" | "Overpriced";
  marketMin: number;
  marketMax: number;
  reason: string;
}

export interface FraudRisk {
  score: number; // 0 to 100
  unusualMileage: { flag: boolean; description: string };
  priceManipulation: { flag: boolean; description: string };
  multipleOwnerRisk: { flag: boolean; description: string };
  summary: string;
}

export interface VerificationReport {
  id: string;
  userId: string;
  vehicle: VehicleInput;
  images: {
    front?: boolean;
    back?: boolean;
    side?: boolean;
    interior?: boolean;
  };
  trustScore: number; // 0 to 100
  trustCategory: "Excellent" | "Good" | "Risky" | "Avoid";
  trustReason: string;
  maintenance: MaintenancePrediction;
  condition: ItemConditionAnalysis;
  priceValidation: PriceValidation;
  fraudRisk: FraudRisk;
  recommendation: "BUY" | "NEGOTIATE" | "AVOID";
  recommendationReason: string;
  overallConfidence?: number;
  categoryConfidence?: {
    price: number;
    maintenance: number;
    visual: number;
    fraud: number;
  };
  reasonsList?: string[];
  architectureInfo?: VehicleArchitectureInfo;
  createdAt: string;
}

export interface VehicleArchitectureInfo {
  dataSource?: "Database Match" | "AI Estimated" | "Hybrid Analysis";
  confidenceScore?: number;
  generation?: string;
  engineCode?: string;
  chassisType?: string;
  powertrain: {
    engineType: string;
    engineDisplacement: string;
    cylinderConfiguration: string;
    induction: string;
    horsepower: string;
    torque: string;
    fuelSystem: string;
    confidence: number;
  };
  transmission: {
    transmissionType: string;
    gears: string;
    driveConfiguration: string;
    confidence: number;
  };
  brakes: {
    frontBrakeType: string;
    rearBrakeType: string;
    absAvailability: string;
    reliabilityAssessment: string;
    confidence: number;
  };
  suspension: {
    frontSuspension: string;
    rearSuspension: string;
    rideComfortRating: string;
    offRoadCapabilityRating: string;
    confidence: number;
  };
  chassis: {
    groundClearance: string;
    wheelbase: string;
    vehicleWeight: string;
    fuelTankCapacity: string;
    confidence: number;
  };
  safety: {
    airbags: string;
    esc: string;
    tractionControl: string;
    adas: string;
    safetyScore: number;
    confidence: number;
  };
  reliability: {
    reliabilityScore: number;
    expectedEngineLifespan: string;
    expectedTransmissionLifespan: string;
    partsAvailability: string;
    maintenanceComplexity: string;
    ownershipCost: string;
    confidence: number;
  };
  commonIssues: {
    mechanicalIssues: string[] | "Unable to Verify";
    electricalIssues: string[] | "Unable to Verify";
    weakComponents: string[] | "Unable to Verify";
    confidence: number;
    lowConfidence?: boolean;
  };
  ownership: {
    bestUseCase: string;
    suitabilityRatings: {
      cityDriving: number;
      highwayTouring: number;
      familyVehicle: number;
      offRoading: number;
      commercialUse: number;
    };
    confidence: number;
  };
}
