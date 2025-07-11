import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award,
  BarChart3,
  Star,
  Lock,
  Unlock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content_url: string | null;
  duration_minutes: number | null;
  difficulty_level: string;
  category: string;
  is_mandatory: boolean;
  created_at: string;
}

interface TrainingProgress {
  id: string;
  module_id: string;
  status: string;
  progress_percentage: number;
  score: number | null;
  completed_at: string | null;
}

const TrainingCenter = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: TrainingProgress }>({});
  const [stats, setStats] = useState({
    completedModules: 0,
    totalModules: 0,
    averageScore: 0,
    totalHours: 0
  });

  useEffect(() => {
    if (!user || profile?.role !== 'provider') {
      navigate('/auth');
      return;
    }
    fetchTrainingData();
  }, [user, profile, navigate]);

  const fetchTrainingData = async () => {
    if (!user) return;

    try {
      // Fetch all training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select('*')
        .order('category', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch user's progress
      const { data: progressData, error: progressError } = await supabase
        .from('provider_training_progress')
        .select('*')
        .eq('provider_id', user.id);

      if (progressError) throw progressError;

      setModules(modulesData || []);

      // Convert progress array to object for easy lookup
      const progressMap: { [key: string]: TrainingProgress } = {};
      progressData?.forEach(p => {
        progressMap[p.module_id] = p;
      });
      setProgress(progressMap);

      // Calculate stats
      const completedModules = progressData?.filter(p => p.status === 'completed').length || 0;
      const totalModules = modulesData?.length || 0;
      const averageScore = progressData?.length 
        ? progressData.filter(p => p.score !== null).reduce((sum, p) => sum + (p.score || 0), 0) / progressData.filter(p => p.score !== null).length
        : 0;
      const totalHours = progressData?.filter(p => p.status === 'completed').reduce((sum, p) => {
        const module = modulesData?.find(m => m.id === p.module_id);
        return sum + (module?.duration_minutes || 0);
      }, 0) || 0;

      setStats({
        completedModules,
        totalModules,
        averageScore,
        totalHours: Math.round(totalHours / 60 * 10) / 10 // Convert to hours with 1 decimal
      });

    } catch (error: any) {
      toast({
        title: "Error loading training data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startModule = async (moduleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('provider_training_progress')
        .upsert({
          provider_id: user.id,
          module_id: moduleId,
          status: 'in_progress',
          progress_percentage: 0
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => ({
        ...prev,
        [moduleId]: {
          id: '',
          module_id: moduleId,
          status: 'in_progress',
          progress_percentage: 0,
          score: null,
          completed_at: null
        }
      }));

      toast({
        title: "Module started",
        description: "You have started this training module",
      });

    } catch (error: any) {
      toast({
        title: "Error starting module",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeModule = async (moduleId: string, score: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('provider_training_progress')
        .upsert({
          provider_id: user.id,
          module_id: moduleId,
          status: 'completed',
          progress_percentage: 100,
          score: score,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          status: 'completed',
          progress_percentage: 100,
          score: score,
          completed_at: new Date().toISOString()
        }
      }));

      toast({
        title: "Module completed!",
        description: `You scored ${score}% on this module`,
      });

      // Refresh stats
      fetchTrainingData();

    } catch (error: any) {
      toast({
        title: "Error completing module",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (moduleId: string) => {
    const moduleProgress = progress[moduleId];
    if (!moduleProgress) return <Lock className="w-4 h-4 text-gray-400" />;
    
    switch (moduleProgress.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Unlock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (moduleId: string) => {
    const moduleProgress = progress[moduleId];
    if (!moduleProgress) return <Badge variant="outline">Not Started</Badge>;
    
    switch (moduleProgress.status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as { [key: string]: TrainingModule[] });

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Training Center</h1>
          <p className="text-muted-foreground">
            Enhance your skills and stay certified with our comprehensive training modules
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Modules</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedModules}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalModules} total modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                across completed modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours}h</div>
              <p className="text-xs text-muted-foreground">
                total training completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalModules > 0 ? Math.round((stats.completedModules / stats.totalModules) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                of all modules
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryModules.map((module) => (
                    <TrainingModuleCard
                      key={module.id}
                      module={module}
                      progress={progress[module.id]}
                      onStart={() => startModule(module.id)}
                      onComplete={(score) => completeModule(module.id, score)}
                      getStatusIcon={getStatusIcon}
                      getStatusBadge={getStatusBadge}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="mandatory">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.filter(m => m.is_mandatory).map((module) => (
                <TrainingModuleCard
                  key={module.id}
                  module={module}
                  progress={progress[module.id]}
                  onStart={() => startModule(module.id)}
                  onComplete={(score) => completeModule(module.id, score)}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                  getDifficultyColor={getDifficultyColor}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.filter(m => progress[m.id]?.status === 'completed').map((module) => (
                <TrainingModuleCard
                  key={module.id}
                  module={module}
                  progress={progress[module.id]}
                  onStart={() => startModule(module.id)}
                  onComplete={(score) => completeModule(module.id, score)}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                  getDifficultyColor={getDifficultyColor}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.filter(m => progress[m.id]?.status === 'in_progress').map((module) => (
                <TrainingModuleCard
                  key={module.id}
                  module={module}
                  progress={progress[module.id]}
                  onStart={() => startModule(module.id)}
                  onComplete={(score) => completeModule(module.id, score)}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                  getDifficultyColor={getDifficultyColor}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

// Training Module Card Component
interface TrainingModuleCardProps {
  module: TrainingModule;
  progress?: TrainingProgress;
  onStart: () => void;
  onComplete: (score: number) => void;
  getStatusIcon: (moduleId: string) => React.ReactNode;
  getStatusBadge: (moduleId: string) => React.ReactNode;
  getDifficultyColor: (level: string) => string;
}

const TrainingModuleCard = ({ 
  module, 
  progress, 
  onStart, 
  onComplete, 
  getStatusIcon, 
  getStatusBadge, 
  getDifficultyColor 
}: TrainingModuleCardProps) => {
  
  const handleAction = () => {
    if (!progress || progress.status === 'not_started') {
      onStart();
    } else if (progress.status === 'in_progress') {
      // Simulate completing with a random score for demo
      const score = Math.floor(Math.random() * 30) + 70; // 70-100%
      onComplete(score);
    }
  };

  return (
    <Card className="hover-scale service-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(module.id)}
              <CardTitle className="text-lg line-clamp-1">{module.title}</CardTitle>
              {module.is_mandatory && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${getDifficultyColor(module.difficulty_level)}`}></div>
              <span className="text-xs text-muted-foreground capitalize">{module.difficulty_level}</span>
              {module.duration_minutes && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{module.duration_minutes} min</span>
                </>
              )}
            </div>
          </div>
          {getStatusBadge(module.id)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {module.description}
        </CardDescription>

        {progress && progress.status === 'in_progress' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.progress_percentage}%</span>
            </div>
            <Progress value={progress.progress_percentage} className="h-2" />
          </div>
        )}

        {progress && progress.status === 'completed' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score:</span>
            <span className="font-medium text-green-600">{progress.score}%</span>
          </div>
        )}

        <Button 
          onClick={handleAction}
          className="w-full"
          variant={progress?.status === 'completed' ? 'outline' : 'default'}
        >
          {!progress || progress.status === 'not_started' ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Module
            </>
          ) : progress.status === 'in_progress' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Module
            </>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" />
              Retake Module
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainingCenter;