import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnhancedProviderDashboard from '@/components/EnhancedProviderDashboard';

const ProviderDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    if (!user || profile?.role !== 'provider') {
      navigate('/auth');
      return;
    }
    fetchDashboardData();

  const fetchDashboardData = async () => {
  return (
    <div className="min-h-screen">
      <Header />
      <EnhancedProviderDashboard />
      <Footer />
    </div>
  );
};

export default ProviderDashboard;