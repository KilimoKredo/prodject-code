import { Schema, model, models } from 'mongoose';
import { ILoanApplication, IFarmer } from './types';

// --- NEW FARMER SCHEMA ---
// Based on your SignUpForm.tsx
const FarmerSchema = new Schema<IFarmer>({
  farmerName: { type: Schema.Types.Mixed },
  email: { type: Schema.Types.Mixed },
  password: { type: Schema.Types.Mixed },
  farmSize: { type: Number }, // in acres
  farmLocation: {
    lat: { type: Schema.Types.Mixed },
    lng: { type: Schema.Types.Mixed },
  },
  phoneNumber: { type: Schema.Types.Mixed },
});

export const Farmer = models.Farmer || model<IFarmer>('Farmer', FarmerSchema);

const FarmerInputSchema = new Schema({
  location: { type: Schema.Types.Mixed },
  crop_type: { type: Schema.Types.Mixed },
  price_of_crop: { type: Schema.Types.Mixed },
  farm_size_sqm: { type: Schema.Types.Mixed },
  previous_loans_count: { type: Schema.Types.Mixed },
  defaulted_loans_count: { type: Schema.Types.Mixed },
  crop_yield_per_sqm: { type: Schema.Types.Mixed },
  total_yield_ksh: { type: Schema.Types.Mixed },
  seasonal_expense: { type: Schema.Types.Mixed },
});

const ModelPredictionsSchema = new Schema({
  predicted_credict_score: { type: Schema.Types.Mixed },
  predicted_interest_rate: { type: Schema.Types.Mixed },
  predicted_loan_duration: { type: Schema.Types.Mixed },
  predicted_loan_limit: { type: Schema.Types.Mixed },
});

const ModelFeaturesSchema = new Schema({
  NDVI: { type: Schema.Types.Mixed },
  avg_rainfall: { type: Schema.Types.Mixed },
  avg_temp: { type: Schema.Types.Mixed },
  crop_type: { type: Schema.Types.Mixed },
  crop_yield_per_sqm: { type: Schema.Types.Mixed },
  default_rate: { type: Schema.Types.Mixed },
  defaulted_loans_count: { type: Schema.Types.Mixed },
  expense_per_sqm: { type: Schema.Types.Mixed },
  expense_ratio: { type: Schema.Types.Mixed },
  farm_size_sqm: { type: Schema.Types.Mixed },
  latitude: { type: Schema.Types.Mixed },
  longitude: { type: Schema.Types.Mixed },
  ndvi_x_rainfall: { type: Schema.Types.Mixed },
  net_income: { type: Schema.Types.Mixed },
  previous_loans_count: { type: Schema.Types.Mixed },
  price_of_crop: { type: Schema.Types.Mixed },
  price_x_yield: { type: Schema.Types.Mixed },
  profit_margin: { type: Schema.Types.Mixed },
  seasonal_expense: { type: Schema.Types.Mixed },
  temp_x_rainfall: { type: Schema.Types.Mixed },
  total_yield_ksh: { type: Schema.Types.Mixed },
  yield_value_per_sqm: { type: Schema.Types.Mixed },
});

const LoanApplicationSchema = new Schema<ILoanApplication>({
  user: { type: FarmerInputSchema },
  farmerId: { type: Schema.Types.Mixed },
  output: {
    features_used_by_model: { type: ModelFeaturesSchema },
    predictions: { type: ModelPredictionsSchema },
  },
  others: {
    loanAmountRequested: { type: Schema.Types.Mixed },
    loanStatus: { type: Schema.Types.Mixed, enum: ['Approved', 'Pending', 'Rejected'] },
  },
});

export const LoanApplication = models.LoanApplication || model<ILoanApplication>('LoanApplication', LoanApplicationSchema);