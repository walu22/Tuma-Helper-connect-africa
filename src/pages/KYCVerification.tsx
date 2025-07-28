import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProviderProfile {
  business_name?: string;
  business_registration_number?: string;
  tax_number?: string;
  bank_account_number?: string;
  bank_name?: string;
  id_document_url?: string;
  business_license_url?: string;
  insurance_certificate_url?: string;
  years_of_experience?: number;
  service_areas?: string[];
  bio?: string;
  portfolio_urls?: string[];
  hourly_rate?: number;
}

export default function KYCVerification() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProviderProfile>({
    service_areas: [],
    portfolio_urls: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'provider')) {
      navigate('/auth');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    // Fetch existing provider profile if exists
    const fetchProviderProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setFormData(data);
        }
      }
    };

    fetchProviderProfile();
  }, [user]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Insert or update provider profile
      const { error } = await supabase
        .from('provider_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
        });

      if (error) throw error;

      // Update profile KYC status to submitted
      await supabase
        .from('profiles')
        .update({ kyc_status: 'submitted' })
        .eq('user_id', user.id);

      toast({
        title: "KYC Submitted Successfully",
        description: "Your application is under review. We'll notify you within 24-48 hours.",
      });

      navigate('/');
    } catch (error: unknown) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getKYCStatusBadge = () => {
    switch (profile?.kyc_status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'submitted':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (profile?.kyc_status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">KYC Verification Complete!</h1>
            <p className="text-muted-foreground mb-8">
              Your account has been verified and approved. You can now start providing services on Tuma Helper.
            </p>
            <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          {getKYCStatusBadge()}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Provider Verification</CardTitle>
              <CardDescription>
                Complete your KYC verification to start providing services on Tuma Helper
              </CardDescription>
              <Progress value={(step / 4) * 100} className="mt-4" />
              <div className="text-sm text-muted-foreground mt-2">
                Step {step} of 4
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business/Trading Name</Label>
                    <Input
                      id="business-name"
                      value={formData.business_name || ''}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-number">Registration Number</Label>
                      <Input
                        id="reg-number"
                        value={formData.business_registration_number || ''}
                        onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-number">Tax Number</Label>
                      <Input
                        id="tax-number"
                        value={formData.tax_number || ''}
                        onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select
                      value={formData.years_of_experience?.toString() || ''}
                      onValueChange={(value) => setFormData({ ...formData, years_of_experience: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Less than 1 year</SelectItem>
                        <SelectItem value="2">1-2 years</SelectItem>
                        <SelectItem value="5">3-5 years</SelectItem>
                        <SelectItem value="10">5-10 years</SelectItem>
                        <SelectItem value="15">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">Hourly Rate (NAD)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      value={formData.hourly_rate || ''}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                      placeholder="e.g. 150"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Banking Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Select
                      value={formData.bank_name || ''}
                      onValueChange={(value) => setFormData({ ...formData, bank_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fnb">First National Bank</SelectItem>
                        <SelectItem value="standard">Standard Bank</SelectItem>
                        <SelectItem value="nedbank">Nedbank</SelectItem>
                        <SelectItem value="bank-windhoek">Bank Windhoek</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      value={formData.bank_account_number || ''}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      placeholder="Enter your account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell customers about your experience and specialties..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Document Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Please upload clear photos of your documents
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">ID Document</p>
                      <p className="text-xs text-muted-foreground">Upload a clear photo of your national ID</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Business License (Optional)</p>
                      <p className="text-xs text-muted-foreground">Upload business registration certificate if applicable</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Insurance Certificate (Optional)</p>
                      <p className="text-xs text-muted-foreground">Upload proof of insurance if you have it</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review & Submit</h3>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Business Name:</span>
                      <span>{formData.business_name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Experience:</span>
                      <span>{formData.years_of_experience || 'Not specified'} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Hourly Rate:</span>
                      <span>NAD {formData.hourly_rate || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Bank:</span>
                      <span>{formData.bank_name || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Our team will review your application within 24-48 hours</li>
                      <li>• We may contact you for additional information if needed</li>
                      <li>• Once approved, you can start accepting service requests</li>
                      <li>• You'll receive email notifications about your application status</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < 4 ? (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}