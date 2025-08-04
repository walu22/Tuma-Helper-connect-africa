import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PopularProjects = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: "Decks & Porches",
      rating: 3.7,
      reviews: "1k+",
      price: "from N$1,890",
      icon: "🏗️",
      color: "bg-red-100"
    },
    {
      title: "Home Cleaning",
      rating: 4.5,
      reviews: "414k+",
      price: "from N$85",
      icon: "🧽",
      color: "bg-red-100"
    },
    {
      title: "Roof Repair",
      rating: 4.7,
      reviews: "83k+",
      price: "from N$584",
      icon: "🏠",
      color: "bg-red-100"
    },
    {
      title: "Fence Repair",
      rating: 4.2,
      reviews: "8k+",
      price: "from N$380",
      icon: "🏘️",
      color: "bg-red-100"
    },
    {
      title: "Appliance Repair",
      rating: 4.7,
      reviews: "74k+",
      price: "from N$504",
      icon: "🔧",
      color: "bg-red-100"
    },
    {
      title: "Pest Control",
      rating: 4.8,
      reviews: "377k+",
      price: "from N$196",
      icon: "🐛",
      color: "bg-red-100"
    },
    {
      title: "Gutter Services",
      rating: 4.0,
      reviews: "47k+",
      price: "from N$575",
      icon: "🏠",
      color: "bg-red-100"
    },
    {
      title: "Plumbing Services",
      rating: 4.4,
      reviews: "287k+",
      price: "from N$210",
      icon: "🔧",
      color: "bg-red-100"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Popular projects near you
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white"
              onClick={() => navigate(`/services?search=${encodeURIComponent(project.title)}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${project.color} rounded-lg flex items-center justify-center shrink-0`}>
                    <span className="text-2xl">{project.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-900">{project.rating}</span>
                        <span>({project.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {project.price}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Price shown is the national median price of minimum job size for Angi's pre-priced offering. Actual pricing may vary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PopularProjects;