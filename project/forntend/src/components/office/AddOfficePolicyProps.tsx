// src/components/OfficePolicy/AddOfficePolicyComponent.tsx
import React, { useState, useEffect } from "react";
import { officeService, Office } from "@/services/office/officeService";
import { officeRoleService } from "@/services/office/officeRoleService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AddOfficePolicyProps {
  officeId: string;
  userId: string;
}

export const AddOfficePolicyComponent: React.FC<AddOfficePolicyProps> = ({
  officeId,
  userId,
}) => {
  const [office, setOffice] = useState<Office | null>(null);
  const [policy, setPolicy] = useState<string>("");
  const [canAddPolicy, setCanAddPolicy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOfficeDetails = async () => {
      try {
        // Fetch office details
        const officeDetails = await officeService.getOffice(officeId);
        setOffice(officeDetails);

        // Check if user has admin role
        const hasAdminRole = await officeRoleService.hasMemberRole(
          userId,
          101, // Admin role ID
          officeId
        );
        setCanAddPolicy(hasAdminRole);
      } catch (err) {
        setError("Failed to fetch office details");
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeDetails();
  }, [officeId, userId]);

  const handlePolicySubmit = async () => {
    if (!policy.trim()) {
      setError("Policy cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await officeService.addOfficePolicy(officeId, policy);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError("Failed to add office policy");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!canAddPolicy) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unauthorized</AlertTitle>
        <AlertDescription>
          You do not have permission to add an office policy.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Office Policy for {office?.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 bg-green-100">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Office policy has been successfully added.
            </AlertDescription>
          </Alert>
        )}

        {office?.officePolicy && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Current Office Policy:
            </h3>
            <div className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap">
              {office.officePolicy}
            </div>
          </div>
        )}

        <Textarea
          placeholder="Enter new office policy..."
          value={policy}
          onChange={(e) => setPolicy(e.target.value)}
          className="w-full mb-4 min-h-[200px]"
        />

        <Button
          onClick={handlePolicySubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Submitting..." : "Add Office Policy"}
        </Button>
      </CardContent>
    </Card>
  );
};
