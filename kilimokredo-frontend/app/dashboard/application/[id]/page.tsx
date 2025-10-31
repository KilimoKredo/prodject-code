import { ILoanApplication } from "@/lib/types";
import { Suspense } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { PredictionGauge } from "@/components/dashboard/PredictionGauge";
import { FeatureHighlight } from "@/components/dashboard/FeatureHighlight";
import { Badge } from "@/components/ui/Badge";
import { AgronomyData } from "@/components/dashboard/agronomyData";
import { ApplicationActions } from "@/components/dashboard/ApplicationActions";
import { StaticFarmMap } from "@/components/staticFarmMap";

// Helper function to fetch a single application
async function getApplication(id: string): Promise<ILoanApplication | null> {
  const res = await fetch(`http://localhost:3000/api/applications/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getApplication(id);

  if (!app) {
    return <p>Application not found.</p>;
  }

  const { predictions, features_used_by_model } = app.output;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Loan Application Review
        </h1>
        <Badge status={app.others.loanStatus} />
      </div>

      {/* Top Prediction Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <PredictionGauge score={predictions.predicted_credict_score} />
        </div>
        <StatCard
          title="Model's Recommended Loan Limit"
          value={`Ksh ${Math.round(
            predictions.predicted_loan_limit
          ).toLocaleString()}`}
        />
        <StatCard
          title="Recommended Interest Rate"
          value={`${(predictions.predicted_interest_rate / 100).toFixed(2)}%`}
        />
        <StatCard
          title="Recommended Loan Duration"
          value={`${Math.round(
            predictions.predicted_loan_duration / 30
          )} months`}
        />
      </div>

      <div className="pb-2">
        <AgronomyData features={app.output.features_used_by_model} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: What-If Simulator */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">
            "What-If" Scenario Simulator
          </h2>
          <p className="text-gray-600 mb-6">
            Use the sliders to adjust the farmer's inputs and see how it affects
            their predicted score in real-time.
          </p>
          <Suspense fallback={<p>Loading simulator...</p>}>
            <WhatIfSimulator
              initialData={app.user}
              initialFeatures={app.output.features_used_by_model}
            />
          </Suspense>
        </div>

        {/* Right Column: Explainability */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Key Risk Drivers</h2>
          <p className="text-gray-600 mb-6">
            The model's decision was based on these key engineered features.
          </p>
          <FeatureHighlight features={features_used_by_model} />
        </div>


        {/* --- THIS IS WHERE YOU ADD IT --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
          <h2 className="text-2xl font-semibold mb-4">Loan Decision</h2>
          {/* Wrap client components in Suspense for best practice */}
          <Suspense
            fallback={
              <p className="text-sm text-gray-500">Loading actions...</p>
            }
          >
            <ApplicationActions
              applicationId={app._id}
              currentStatus={app.others.loanStatus}
            />
          </Suspense>
        </div>
      </div>

       <StaticFarmMap locationString={app.user.location} height="400px" />
    </div>
  );
}
