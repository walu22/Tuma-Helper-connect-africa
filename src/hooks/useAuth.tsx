import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  phone?: string;
  role: 'customer' | 'provider' | 'admin';
  avatar_url?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  is_verified?: boolean;
  kyc_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  corporate_account_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isProvider: boolean;
  isCustomer: boolean;
  isCorporate: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('Profile fetch result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('No profile data found for user:', userId);
        return null;
      }

      // Transform the data to match our Profile interface
      const profile: Profile = {
        id: data.id,
        user_id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        display_name: data.display_name,
        phone: data.phone,
        role: data.role as 'customer' | 'provider' | 'admin',
        avatar_url: data.avatar_url,
        date_of_birth: data.date_of_birth,
        address: data.address,
        city: data.city,
        country: data.country,
        is_verified: data.is_verified,
        kyc_status: data.kyc_status as 'pending' | 'submitted' | 'approved' | 'rejected',
        corporate_account_id: data.corporate_account_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      console.log('Successfully created profile object:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', { event, user: session?.user?.id, email: session?.user?.email });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User logged in, fetching profile...');
          // Fetch user profile
          const profileData = await fetchProfile(session.user.id);
          console.log('Profile data received:', profileData);
          setProfile(profileData);
        } else {
          console.log('No user session, clearing profile');
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('Starting signup process:', { email, userData });
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });

    console.log('Signup response:', { data, error });

    if (error) {
      console.error('Signup error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('Signup successful, user:', data.user);
      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Starting sign in process for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in result:', { data, error });

      if (error) {
        console.error('Sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        let errorMessage = error.message;
        let title = "Sign In Failed";
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Incorrect email or password. Please check your credentials.";
        } else if (error.message.includes('Email not confirmed') || error.message.includes('signup_disabled')) {
          title = "Email Confirmation Required";
          errorMessage = "Please check your email and click the confirmation link before signing in. Check your spam folder if you don't see it.";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        } else if (error.message.includes('User not found')) {
          errorMessage = "No account found with this email. Please sign up first.";
        }
        
        toast({
          title,
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Sign in successful, user data:', data);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }

      return { error };
    } catch (err) {
      console.error('Sign in exception:', err);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Google Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Facebook Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Starting sign out process...');
    console.log('Current session:', session);
    console.log('Current user:', user);
    
    try {
      // Clear local state first
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Then try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', { error });
      
      if (error) {
        console.warn('Sign out warning (but local state cleared):', error);
        // Don't show error toast since we cleared local state successfully
      }
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      return { error: null }; // Always return success since we cleared local state
    } catch (err) {
      console.error('Sign out exception:', err);
      // Still clear local state even if there's an exception
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      return { error: null };
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for reset instructions.",
      });
    }

    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Resend Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email (including spam folder) for the confirmation link.",
      });
    }

    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Profile Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      await refreshProfile();
    }

    return { error };
  };

  const isAdmin = profile?.role === 'admin';
  const isProvider = profile?.role === 'provider';
  const isCustomer = profile?.role === 'customer';
  const isCorporate = Boolean(profile?.corporate_account_id);

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
    resendConfirmation,
    updateProfile,
    refreshProfile,
    isAdmin,
    isProvider,
    isCustomer,
    isCorporate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};