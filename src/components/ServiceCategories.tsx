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
    { name: "Interior Design", icon: "🏠", color: "bg-primary/10 text-primary", category: "interior" },
    { name: "Painting", icon: "🎨", color: "bg-primary/10 text-primary", category: "interior" },
    { name: "Flooring", icon: "📐", color: "bg-primary/10 text-primary", category: "interior" },
    { name: "Lawn & Garden", icon: "🌱", color: "bg-success/10 text-success", route: "/lawn-garden" },
    { name: "Plumbing", icon: "🔧", color: "bg-secondary/10 text-secondary", category: "interior" },
    { name: "Electrical", icon: "⚡", color: "bg-warning/10 text-warning", category: "interior" },
    { name: "Remodeling", icon: "⚒️", color: "bg-primary/10 text-primary", category: "interior" },
    { name: "Exterior Services", icon: "🏗️", color: "bg-accent/10 text-accent", route: "/exterior" },
    { name: "Cleaning", icon: "🧽", color: "bg-success/10 text-success", category: "interior" },
    { name: "HVAC", icon: "🌡️", color: "bg-secondary/10 text-secondary", category: "interior" },
    { name: "Windows", icon: "🪟", color: "bg-primary/10 text-primary", category: "interior" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4 md:gap-6">
          {serviceCategories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group"
              onClick={() => {
                if (category.route) {
                  navigate(category.route);
                } else {
                  const categoryParam = category.category || category.name.toLowerCase();
                  navigate(`/services?category=${encodeURIComponent(categoryParam)}`);
                }
              }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${category.color} group-hover:scale-110 transition-transform`}>
                <span className="text-xl">{category.icon}</span>
              </div>
              <span className="text-sm font-medium text-foreground text-center leading-tight">
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