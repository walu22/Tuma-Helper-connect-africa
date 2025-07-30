import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Home, 
  Wrench, 
  Zap, 
  Scissors, 
  Car, 
  Sparkles,
  ArrowRight,
  Users,
  Clock,
  Shield,
  Flower,
  Heart,
  Camera,
  BookOpen,
  Laptop,
  Truck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  serviceCount?: number;
}

  const iconMap: { [key: string]: React.ComponentType } = {
  home: Home,
  car: Car,
  scissors: Scissors,
  sparkles: Sparkles,
  laptop: Laptop,
  truck: Truck,
  wrench: Wrench,
  flower: Flower,
  heart: Heart,
  camera: Camera,
  'book-open': BookOpen,
  zap: Zap,
};

const colorMap: { [key: string]: string } = {
  'Home Services': 'from-blue-500 to-blue-600',
  'Beauty & Wellness': 'from-pink-500 to-pink-600',
  'Automotive': 'from-purple-500 to-purple-600',
  'Delivery & Moving': 'from-orange-500 to-orange-600',
  'Tech Support': 'from-cyan-500 to-cyan-600',
  'Gardening': 'from-green-500 to-green-600',
  'Tutoring': 'from-indigo-500 to-indigo-600',
  'Events': 'from-red-500 to-red-600',
  'Pet Services': 'from-yellow-500 to-yellow-600',
  'Handyman': 'from-gray-500 to-gray-600',
};

const ServiceCategories = () => {
  const navigate = useNavigate();

  const serviceCategories = [
    { name: "Handyperson", icon: "🔨", color: "bg-red-100 text-red-600" },
    { name: "Landscaping", icon: "🌿", color: "bg-green-100 text-green-600" },
    { name: "Plumbing", icon: "🔧", color: "bg-blue-100 text-blue-600" },
    { name: "Electrical", icon: "⚡", color: "bg-yellow-100 text-yellow-600" },
    { name: "Remodeling", icon: "⚒️", color: "bg-purple-100 text-purple-600" },
    { name: "Roofing", icon: "🏠", color: "bg-orange-100 text-orange-600" },
    { name: "Painting", icon: "🎨", color: "bg-pink-100 text-pink-600" },
    { name: "Cleaning", icon: "🧽", color: "bg-cyan-100 text-cyan-600" },
    { name: "HVAC", icon: "🌡️", color: "bg-indigo-100 text-indigo-600" },
    { name: "Windows", icon: "🪟", color: "bg-teal-100 text-teal-600" },
    { name: "Concrete", icon: "🏗️", color: "bg-gray-100 text-gray-600" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4 md:gap-6">
          {serviceCategories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/services?category=${encodeURIComponent(category.name)}`)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${category.color} group-hover:scale-110 transition-transform`}>
                <span className="text-xl">{category.icon}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;