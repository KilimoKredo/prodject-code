import { Document, Schema } from 'mongoose';

// Data from the farmer's form
export interface FarmerInput {
  [key: string]: any;
}

// NEW: Interface for your Farmer
export interface IFarmer extends Document {
  farmerName: any;
  email: any;
  password?: any; // Will be hashed, never returned
  farmSize: any; // in acres, from your signup
  farmLocation:  {
  [key: string]: any;
};
  phoneNumber: any;
}



// The "predictions" object from your model
export interface ModelPredictions  {
  [key: string]: any;
}

// The "features_used_by_model" object
export interface ModelFeatures  {
  [key: string]: any;
}

// The final object stored in MongoDB
export interface ILoanApplication extends Document {
  user: FarmerInput;
  farmerId: string;
  output: {
    features_used_by_model: ModelFeatures;
    predictions: ModelPredictions;
  };
  others: {
  [key: string]: any;
};
}