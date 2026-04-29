import { useEffect, useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { articleAPI } from "@/lib/api";
import { BookOpen } from "lucide-react";

export const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await articleAPI.getPublic();
        setFeaturedArticles(response.data.articles?.slice(0, 3) || []);
      } catch (error) {
        console.error("Failed to fetch featured articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const weeklySchedule = {
    Monday: [{ title: "Journal of South Asian Studies", subtitle: "Vol. 11" }],
    Tuesday: [{ title: "Quiet Library", subtitle: "Morgan Nichols" }],
    Wednesday: [{ title: "The Human Review", subtitle: "Spring Issue" }],
    Thursday: [{ title: "The Quiet Library", subtitle: "Alan's Beasts" }],
    Friday: [
      { title: "Journal of South Asian Studies", subtitle: "Vol. 12" },
      { title: "The European Review", subtitle: "Spring Issue" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Stories that shape minds
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our collection of academic journals, literary works, and
            cultural publications
          </p>
        </div>
      </section>

      {/* Featured Releases */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Featured Releases
          </h2>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.length > 0 ? (
                featuredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                    <div className="p-6">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded mb-3">
                        {article.type}
                      </span>
                      <h3 className="text-xl font-semibold mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        by {article.author}
                      </p>
                      <p className="text-blue-600 font-bold">
                        ₹{article.price}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                    <div className="p-6">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded mb-3">
                        Journal
                      </span>
                      <h3 className="text-xl font-semibold mb-2">
                        Journal of South Asian Studies
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        by Multiple Authors
                      </p>
                      <p className="text-blue-600 font-bold">₹49.99</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                    <div className="p-6">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded mb-3">
                        Book
                      </span>
                      <h3 className="text-xl font-semibold mb-2">
                        The Quiet Library
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        by Alan Beasts
                      </p>
                      <p className="text-purple-600 font-bold">₹24.99</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                    <div className="p-6">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-green-600 bg-green-50 rounded mb-3">
                        Journal
                      </span>
                      <h3 className="text-xl font-semibold mb-2">
                        The European Review
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        by European Press
                      </p>
                      <p className="text-green-600 font-bold">₹39.99</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="py-16 bg-gray-100">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Weekly Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(weeklySchedule).map(([day, items]) => (
              <div key={day} className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-blue-600 mb-3">
                  {day.toUpperCase()}
                </h3>
                {items.map((item, idx) => (
                  <div key={idx} className="mb-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
