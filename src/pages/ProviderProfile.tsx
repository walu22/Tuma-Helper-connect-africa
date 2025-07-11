import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Star, 
  Award,
  DollarSign,
  MapPin,
  Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Skill {
  id?: string;
  skill_name: string;
  skill_category: string;
  proficiency_level: string;
  certification_url?: string;
  verified_by_admin: boolean;
}

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const skillCategories = [
  'Home Services',
  'Beauty & Wellness',
  'Automotive',
  'Tech Support',
  'Delivery & Moving',
  'Gardening',
  'Tutoring',
  'Events',
  'Pet Services',
  'Handyman'
];

const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const ProviderProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Skills state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    skill_name: '',
    skill_category: '',
    proficiency_level: 'beginner'
  });

  // Availability state
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  // Profile state
  const [profileData, setProfileData] = useState({
    bio: '',
    hourly_rate: 0,
    service_areas: [] as string[],
    portfolio_urls: [] as string[],
    years_of_experience: 0
  });

  useEffect(() => {
    if (!user || profile?.role !== 'provider') {
      navigate('/auth');
      return;
    }
    fetchProviderData();
  }, [user, profile, navigate]);

  const fetchProviderData = async () => {
    if (!user) return;

    try {
      // Fetch provider profile
      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerProfile) {
        setProfileData({
          bio: providerProfile.bio || '',
          hourly_rate: providerProfile.hourly_rate || 0,
          service_areas: providerProfile.service_areas || [],
          portfolio_urls: providerProfile.portfolio_urls || [],
          years_of_experience: providerProfile.years_of_experience || 0
        });
      }

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('provider_skills')
        .select('*')
        .eq('provider_id', user.id);

      if (skillsData) {
        setSkills(skillsData);
      }

      // Fetch availability
      const { data: availabilityData } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', user.id)
        .order('day_of_week');

      if (availabilityData) {
        setAvailability(availabilityData);
      }

    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!user || !newSkill.skill_name || !newSkill.skill_category) {
      toast({
        title: "Invalid skill",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('provider_skills')
        .insert({
          provider_id: user.id,
          skill_name: newSkill.skill_name,
          skill_category: newSkill.skill_category,
          proficiency_level: newSkill.proficiency_level || 'beginner',
          certification_url: newSkill.certification_url
        })
        .select()
        .single();

      if (error) throw error;

      setSkills([...skills, data]);
      setNewSkill({
        skill_name: '',
        skill_category: '',
        proficiency_level: 'beginner'
      });

      toast({
        title: "Skill added",
        description: "Your skill has been added successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error adding skill",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('provider_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      setSkills(skills.filter(skill => skill.id !== skillId));

      toast({
        title: "Skill removed",
        description: "Your skill has been removed successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error removing skill",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAvailability = async (dayOfWeek: number, startTime: string, endTime: string, isAvailable: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('provider_availability')
        .upsert({
          provider_id: user.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable
        });

      if (error) throw error;

      // Update local state
      const updatedAvailability = availability.filter(a => a.day_of_week !== dayOfWeek);
      if (isAvailable) {
        updatedAvailability.push({
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable
        });
      }
      setAvailability(updatedAvailability);

    } catch (error: any) {
      toast({
        title: "Error updating availability",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('provider_profiles')
        .upsert({
          user_id: user.id,
          bio: profileData.bio,
          hourly_rate: profileData.hourly_rate,
          service_areas: profileData.service_areas,
          portfolio_urls: profileData.portfolio_urls,
          years_of_experience: profileData.years_of_experience
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Provider Profile</h1>
          <p className="text-muted-foreground">
            Manage your professional profile, skills, and availability
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell customers about your experience and expertise..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate (N$)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={profileData.hourly_rate}
                      onChange={(e) => setProfileData(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profileData.years_of_experience}
                      onChange={(e) => setProfileData(prev => ({ ...prev, years_of_experience: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Skills Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new skill */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Add New Skill</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Skill Name</Label>
                      <Input
                        value={newSkill.skill_name}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, skill_name: e.target.value }))}
                        placeholder="e.g., Plumbing, Hairstyling"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={newSkill.skill_category} 
                        onValueChange={(value) => setNewSkill(prev => ({ ...prev, skill_category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Proficiency Level</Label>
                      <Select 
                        value={newSkill.proficiency_level} 
                        onValueChange={(value) => setNewSkill(prev => ({ ...prev, proficiency_level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {proficiencyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Certification URL (Optional)</Label>
                      <Input
                        value={newSkill.certification_url || ''}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, certification_url: e.target.value }))}
                        placeholder="Link to certification"
                      />
                    </div>
                  </div>
                  <Button onClick={addSkill} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>

                {/* Current skills */}
                <div className="space-y-2">
                  <h4 className="font-medium">Your Skills</h4>
                  {skills.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No skills added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{skill.skill_name}</span>
                              <Badge variant="secondary">{skill.skill_category}</Badge>
                              <Badge variant="outline">{skill.proficiency_level}</Badge>
                              {skill.verified_by_admin && (
                                <Badge variant="secondary">Verified</Badge>
                              )}
                            </div>
                            {skill.certification_url && (
                              <a 
                                href={skill.certification_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                View Certification
                              </a>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => skill.id && removeSkill(skill.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Availability Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Availability Schedule
                </CardTitle>
                <CardDescription>
                  Set your working hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day, index) => {
                  const dayAvailability = availability.find(a => a.day_of_week === index);
                  return (
                    <AvailabilityDay
                      key={index}
                      day={day}
                      dayOfWeek={index}
                      availability={dayAvailability}
                      onUpdate={updateAvailability}
                    />
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{skills.length}</p>
                    <p className="text-sm text-muted-foreground">Skills Listed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profileData.years_of_experience}</p>
                    <p className="text-sm text-muted-foreground">Years Experience</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">N${profileData.hourly_rate}/hour</p>
                  <p className="text-sm text-muted-foreground">Current Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Availability Day Component
interface AvailabilityDayProps {
  day: string;
  dayOfWeek: number;
  availability?: AvailabilitySlot;
  onUpdate: (dayOfWeek: number, startTime: string, endTime: string, isAvailable: boolean) => void;
}

const AvailabilityDay = ({ day, dayOfWeek, availability, onUpdate }: AvailabilityDayProps) => {
  const [isAvailable, setIsAvailable] = useState(availability?.is_available || false);
  const [startTime, setStartTime] = useState(availability?.start_time || '09:00');
  const [endTime, setEndTime] = useState(availability?.end_time || '17:00');

  const handleUpdate = () => {
    onUpdate(dayOfWeek, startTime, endTime, isAvailable);
  };

  useEffect(() => {
    if (availability) {
      setIsAvailable(availability.is_available);
      setStartTime(availability.start_time);
      setEndTime(availability.end_time);
    }
  }, [availability]);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-20">
          <span className="font-medium">{day}</span>
        </div>
        <Switch
          checked={isAvailable}
          onCheckedChange={(checked) => {
            setIsAvailable(checked);
            setTimeout(() => onUpdate(dayOfWeek, startTime, endTime, checked), 100);
          }}
        />
      </div>
      {isAvailable && (
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            onBlur={handleUpdate}
            className="w-24"
          />
          <span>to</span>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            onBlur={handleUpdate}
            className="w-24"
          />
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;