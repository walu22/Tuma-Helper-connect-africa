import { Calendar, User, ArrowRight, Search, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Blog = () => {
  const navigate = useNavigate();

  const featuredPost = {
    title: "The Future of Home Services in Namibia",
    excerpt: "Discover how technology is transforming the way we access and deliver home services in Windhoek and beyond.",
    author: "Sarah Mukonda",
    date: "January 15, 2025",
    category: "Industry Insights",
    readTime: "5 min read",
    image: "/api/placeholder/800/400"
  };

  const blogPosts = [
    {
      title: "5 Tips for Choosing the Right Home Cleaning Service",
      excerpt: "What to look for when selecting a professional cleaning service for your home.",
      author: "David Nakale",
      date: "January 12, 2025",
      category: "Home Tips",
      readTime: "3 min read"
    },
    {
      title: "Supporting Local Businesses Through Digital Platforms",
      excerpt: "How platforms like Tuma Helper are empowering local service providers.",
      author: "Maria Santos",
      date: "January 10, 2025",
      category: "Community",
      readTime: "4 min read"
    },
    {
      title: "Safety First: What to Expect from Professional Services",
      excerpt: "Understanding safety standards and what questions to ask service providers.",
      author: "John Williams",
      date: "January 8, 2025",
      category: "Safety",
      readTime: "6 min read"
    },
    {
      title: "The Growing Gig Economy in Windhoek",
      excerpt: "How the service economy is creating new opportunities for entrepreneurs.",
      author: "Anna Shifotoka",
      date: "January 5, 2025",
      category: "Business",
      readTime: "5 min read"
    },
    {
      title: "Seasonal Home Maintenance: A Complete Guide",
      excerpt: "Essential maintenance tasks to keep your home in top condition year-round.",
      author: "Peter Amukugo",
      date: "January 3, 2025",
      category: "Home Tips",
      readTime: "7 min read"
    },
    {
      title: "Building Trust in the Digital Service Economy",
      excerpt: "How technology and transparency are building trust between service providers and customers.",
      author: "Grace Nehoya",
      date: "January 1, 2025",
      category: "Technology",
      readTime: "4 min read"
    }
  ];

  const categories = ["All", "Home Tips", "Community", "Safety", "Business", "Technology", "Industry Insights"];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tuma Helper Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Insights, tips, and stories from the world of local services
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search blog posts..." 
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge 
                  key={index} 
                  variant={index === 0 ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Featured Post</h2>
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="w-full h-64 md:h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">Featured Image</span>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <Badge className="mb-4">{featuredPost.category}</Badge>
                  <h3 className="text-2xl font-bold mb-4">{featuredPost.title}</h3>
                  <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredPost.date}
                    </div>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  
                  <Button className="btn-hero">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Latest Posts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Post Image</span>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="text-lg hover:text-primary cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {post.excerpt}
                    </CardDescription>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      Read More
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Subscribe to our newsletter for the latest tips, insights, and updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="btn-hero">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;