import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Brain,
  Eye,
  Heart,
  Box,
  Share2,
  Target,
  TrendingUp,
  Clock,
  Users,
  Search,
  Plus,
  Upload,
  Send,
  ExternalLink,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import { RedditIcon } from "../components/BrandIcons";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import PortfolioHealthScore from "../components/PortfolioHealth/PortfolioHealthScore";
import { UnifiedSidebar } from "../components/UnifiedSidebar";
import { usePortfolioHealth } from "../hooks/usePortfolioHealth";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  interface ProjectItem {
    id: string;
    _id?: string;
    name?: string;
    title?: string;
    description?: string;
    status?: string;
    visibility?: string;
    technologies?: string[];
    githubUrl?: string;
    liveUrl?: string;
    imageUrl?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }

  const [analytics, setAnalytics] = useState<{
    totalReach: number;
    engagement: number;
    totalViews: number;
    recentProjects: ProjectItem[];
    publishedProjects: number;
    socialMediaPosts?: number;
    socialMediaReach?: number;
  }>({
    totalReach: 0,
    engagement: 0,
    totalViews: 0,
    recentProjects: [],
    publishedProjects: 0,
    socialMediaPosts: 0,
    socialMediaReach: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    email?: string;
    avatar?: string;
    username?: string;
    bio?: string;
    techStack?: string[];
    platformPreferences?: string[];
  } | null>(null);
  
  const [recentPublishedPosts, setRecentPublishedPosts] = useState<Array<{
    id: string;
    projectName: string;
    projectImage?: string;
    platforms: string[];
    publishedAt: string;
    results: Array<{ platform: string; url?: string }>;
  }>>([]);

  // Portfolio health hook
  const {
    health: portfolioHealth,
    loading: healthLoading,
    refresh: refreshHealth,
    recompute: recomputeHealth,
  } = usePortfolioHealth();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserProfile({
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.avatar,
              username: data.user.username,
              bio: data.user.bio,
              techStack: data.user.techStack,
              platformPreferences: data.user.platformPreferences,
            });
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Re-fetch projects on dashboard mount
  useEffect(() => {
    const getProjects = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/projects`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.projects) {
            const apiProjects = data.data.projects.map((project: any) => ({
              id: project.id || project._id?.toString() || '',
              name: project.name || project.title || 'Untitled Project',
              description: project.description || '',
              status: project.status?.toLowerCase() || 'draft',
              visibility: project.visibility?.toLowerCase() || 'private',
              technologies: project.technologies || [],
              githubUrl: project.githubUrl || '',
              liveUrl: project.liveUrl || '',
              imageUrl: project.imageUrl || project.image || '',
              createdAt: project.createdAt || new Date(),
              updatedAt: project.updatedAt || new Date(),
            }));

            const publishedProjects = apiProjects.filter(
              (project: any) =>
                project.status === "published" ||
                !project.status ||
                project.visibility === "public"
            );

            setAnalytics((prev) => ({
              ...prev,
              recentProjects: publishedProjects.slice(0, 5),
              publishedProjects: publishedProjects.length,
            }));
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    getProjects();
  }, [location.pathname]);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [analyticsResponse, socialMediaResponse, publishedPostsResponse] = await Promise.allSettled([
          fetch("/api/dashboard/portfolio-metrics", { credentials: "include" }),
          fetch("/api/analytics/social-media-overview", { credentials: "include" }),
          fetch("/api/analytics/published-posts?limit=10", { credentials: "include" }),
        ]);

        if (analyticsResponse.status === "fulfilled" && analyticsResponse.value.ok) {
          const analyticsData = await analyticsResponse.value.json();
          setAnalytics((prev) => ({
            ...prev,
            totalReach: analyticsData.data?.totalReach || 0,
            engagement: analyticsData.data?.engagementRate || 0,
            totalViews: analyticsData.data?.profileViews || 0,
            ...(analyticsData.data?.socialMedia && {
              socialMediaReach: analyticsData.data.socialMedia.totalReach || 0,
              socialMediaPosts: analyticsData.data.socialMedia.totalPosts || 0,
            }),
          }));
        }

        if (socialMediaResponse.status === "fulfilled" && socialMediaResponse.value.ok) {
          const socialData = await socialMediaResponse.value.json();
          if (socialData.success) {
            setAnalytics((prev) => ({
              ...prev,
              totalReach: (prev.totalReach || 0) + (socialData.overview?.totalReach || 0),
              socialMediaPosts: socialData.overview?.totalPosts || 0,
            }));
          }
        }

        if (publishedPostsResponse.status === "fulfilled" && publishedPostsResponse.value.ok) {
          const postsData = await publishedPostsResponse.value.json();
          if (postsData.success && postsData.posts) {
            setRecentPublishedPosts(postsData.posts || []);
          }
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      }
    };

    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <UnifiedSidebar currentPage="dashboard" />

      <div className="flex-1 overflow-hidden relative flex flex-col h-screen">
        {userProfile && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md hover:shadow-lg transition-all backdrop-blur-sm">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  {(userProfile.name || userProfile.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {userProfile.name || userProfile.email || "User"}
                </p>
                {userProfile.username && (
                  <p className="text-xs text-gray-600">@{userProfile.username}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col w-full h-full p-6 bg-white overflow-y-auto">
          <div className="flex flex-col gap-3 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-500">Your portfolio performance and AI-driven insights.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-48 md:w-56">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 bg-white focus-visible:border-blue-500 focus-visible:ring-blue-500 w-full"
                />
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => navigate("/showcase/add")}
                  className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Projects
                </Button>
                <Button
                  onClick={() => navigate("/content")}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              <div className="grid grid-cols-4 gap-3 flex-shrink-0">
                {[
                  {
                    title: "Total Reach",
                    value: analytics.totalReach.toLocaleString(),
                    change: "+12%",
                    icon: <Eye className="text-blue-500 w-5 h-5" />,
                  },
                  {
                    title: "Engagement",
                    value: `${analytics.engagement.toFixed(1)}%`,
                    change: "+8%",
                    icon: <Heart className="text-pink-500 w-5 h-5" />,
                  },
                  {
                    title: "Active Projects",
                    value: (analytics.publishedProjects || 0).toString(),
                    change: `${analytics.publishedProjects || 0} active`,
                    icon: <Box className="text-green-600 w-5 h-5" />,
                  },
                  {
                    title: "Published Posts",
                    value: (analytics.socialMediaPosts || analytics.publishedProjects || 0).toString(),
                    change: (analytics.socialMediaPosts || analytics.publishedProjects) ? `+${analytics.socialMediaPosts || analytics.publishedProjects}` : "0",
                    icon: <Share2 className="text-purple-500 w-5 h-5" />,
                  },
                ].map((item, idx) => (
                  <Card key={idx} className="rounded-xl hover:shadow-sm transition-all border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">{item.title}</p>
                        <div className="p-1.5 bg-gray-50 rounded-lg">
                          <div className="w-4 h-4">{item.icon}</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-0.5">{item.value}</h3>
                      <span className="text-xs font-medium text-green-600">{item.change}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <PortfolioHealthScore
                  health={portfolioHealth}
                  loading={healthLoading}
                  onRefresh={refreshHealth}
                  onRecompute={recomputeHealth}
                />

                <Card className="rounded-2xl hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-gray-900">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {analytics.recentProjects.length > 0 ? (
                      <div className="space-y-1.5">
                        {analytics.recentProjects.slice(0, 3).map((project, index) => (
                          <div key={index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Box className="w-3 h-3 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-xs truncate">
                                  {project.name || project.title}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">{project.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/showcase/view/${project._id || project.id}`)}
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium flex-shrink-0 ml-2"
                            >
                              View
                            </button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full mt-1 text-xs h-7" onClick={() => navigate("/showcase")}>
                          View All Projects
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[100px] text-gray-400">
                        <Box className="h-5 w-5 mb-1 text-gray-300" />
                        <p className="text-xs">No projects yet</p>
                        <Button size="sm" className="mt-1 text-xs h-7" onClick={() => navigate("/showcase")}>
                          Create Project
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
                <Card className="rounded-2xl hover:shadow-md transition-all">
                  <CardHeader className="flex items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-xs font-semibold text-gray-900">AI Insights</CardTitle>
                      <p className="text-xs text-gray-500">Smart recommendations</p>
                    </div>
                    <Brain className="w-4 h-4 text-purple-600" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1.5">
                      <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-2">
                          <Target className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <p className="text-xs text-blue-800">Add more React projects to increase visibility</p>
                        </div>
                      </div>
                      <div className="p-1.5 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <p className="text-xs text-green-800">Your JavaScript skills are trending - showcase more!</p>
                        </div>
                      </div>
                      <div className="p-1.5 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                          <p className="text-xs text-yellow-800">Update your profile description for better SEO</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-gray-900">Network Activity</CardTitle>
                    <p className="text-xs text-gray-500">Recent connections and interactions</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 p-1.5 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">New Connection</p>
                          <p className="text-xs text-gray-600 truncate">John Doe connected with you</p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">2h ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

