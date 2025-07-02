import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, User, ArrowRight, Clock, Share2, Bookmark, ThumbsUp, MessageCircle, ExternalLink, Heart } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface Article {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  author: string;
  image_url?: string;
  source: string;
  url: string;
  triggerAuth?: boolean;
}

interface RegenXProps {
  onTriggerAuth: () => void;
}

const RegenX: React.FC<RegenXProps> = ({ onTriggerAuth }) => {
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentArticle();
    loadRelatedArticles();
  }, []);

  const loadCurrentArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/regenx/post`);
      setCurrentArticle(response.data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedArticles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/regenx/related`);
      setRelatedArticles(response.data);
    } catch (error) {
      console.error('Error loading related articles:', error);
    }
  };

  const handleContinue = async () => {
    try {
      const response = await axios.get(`${API_BASE}/regenx/next`);
      setCurrentArticle(response.data);
      loadRelatedArticles(); // Refresh related articles
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading next article:', error);
    }
  };

  const handleHeartClick = async () => {
    try {
      const response = await axios.get(`${API_BASE}/regenx/last`);
      setCurrentArticle(response.data);
      
      if (response.data.triggerAuth) {
        setTimeout(() => {
          onTriggerAuth();
        }, 1000);
      }
    } catch (error) {
      console.error('Error loading last article:', error);
    }
  };

  const handleRelatedArticleClick = (article: Article) => {
    setCurrentArticle(article);
    loadRelatedArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">RegenX</h1>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Technology</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Innovation</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Future</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 size={20} />
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <Bookmark size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Featured Article
            </span>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Exploring the Digital Frontier
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover groundbreaking insights, emerging technologies, and revolutionary ideas that are reshaping our world. 
              Join us on a journey through the most fascinating developments in science, technology, and human innovation.
            </p>
            <div className="flex items-center justify-center space-x-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>15 min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <ThumbsUp size={16} />
                <span>2.4k likes</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle size={16} />
                <span>156 comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {currentArticle && (
            <article className="prose prose-xl max-w-none">
              {/* Post Meta */}
              <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-6 text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} />
                    <span className="text-lg">{new Date(currentArticle.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User size={18} />
                    <span className="text-lg font-medium">By {currentArticle.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{currentArticle.source}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                    Follow
                  </button>
                  <a 
                    href={currentArticle.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <span>Source</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              {/* Post Title */}
              <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                {currentArticle.title}
              </h1>

              {/* Featured Image */}
              <div className="w-full h-96 mb-12 rounded-xl overflow-hidden shadow-lg">
                {currentArticle.image_url ? (
                  <img 
                    src={currentArticle.image_url} 
                    alt={currentArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 flex items-center justify-center ${currentArticle.image_url ? 'hidden' : ''}`}>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                      <span className="text-3xl">📰</span>
                    </div>
                    <span className="text-gray-600 text-lg font-medium">Featured Article</span>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="bg-gray-50 p-8 rounded-xl mb-12 border-l-4 border-blue-500">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    {currentArticle.content}
                  </p>
                  
                  {/* Extended content for longer articles */}
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    In today's rapidly evolving technological landscape, we find ourselves at the intersection of unprecedented innovation and transformative change. 
                    The digital revolution has fundamentally altered how we communicate, work, learn, and interact with the world around us. From artificial intelligence 
                    and machine learning to blockchain technology and quantum computing, these emerging technologies are not just changing individual industries—they're 
                    reshaping the very fabric of society itself.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    Consider the profound impact that cloud computing has had on businesses worldwide. What once required massive infrastructure investments and 
                    dedicated IT teams can now be accomplished with a few clicks and a credit card. This democratization of technology has enabled startups to 
                    compete with established corporations, fostering innovation and entrepreneurship on a global scale.
                  </p>

                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-semibold text-blue-900 mb-3">Key Insights</h4>
                    <ul className="space-y-2 text-blue-800">
                      <li>• Technology continues to accelerate at an unprecedented pace</li>
                      <li>• Digital transformation is reshaping every industry</li>
                      <li>• Innovation requires both technical expertise and creative thinking</li>
                      <li>• The future belongs to those who can adapt and evolve</li>
                    </ul>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    Artificial Intelligence represents perhaps the most significant technological advancement of our time. From natural language processing that 
                    enables seamless human-computer interaction to computer vision systems that can diagnose diseases with superhuman accuracy, AI is transforming 
                    every aspect of our lives. The recent breakthroughs in large language models and generative AI have opened up possibilities that seemed like 
                    science fiction just a few years ago.
                  </p>

                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    Machine learning algorithms are now capable of analyzing vast datasets to identify patterns and make predictions that would be impossible for 
                    human analysts to detect. In healthcare, AI systems are helping doctors diagnose rare diseases, predict patient outcomes, and develop 
                    personalized treatment plans. In finance, algorithmic trading and fraud detection systems process millions of transactions in real-time, 
                    protecting consumers and institutions alike.
                  </p>

                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    The Internet of Things (IoT) has transformed our physical world into a network of interconnected devices, sensors, and systems. From smart 
                    homes that adjust temperature and lighting based on our preferences to industrial sensors that predict equipment failures before they occur, 
                    IoT technology is creating a more responsive and intelligent environment around us.
                  </p>

                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    Smart cities are leveraging IoT technology to optimize traffic flow, reduce energy consumption, and improve public safety. Sensors embedded 
                    in roads can detect traffic patterns and automatically adjust signal timing, while smart streetlights can dim or brighten based on pedestrian 
                    activity. These innovations not only improve quality of life for residents but also contribute to environmental sustainability.
                  </p>

                  <div className="bg-green-50 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-semibold text-green-900 mb-3">Future Implications</h4>
                    <p className="text-green-800">
                      As we look toward the future, it's clear that the pace of technological innovation will only continue to accelerate. 
                      Quantum computing promises to solve complex problems that are currently impossible for classical computers. Augmented reality 
                      will blur the lines between digital and physical experiences. And advances in biotechnology will enable us to address some 
                      of humanity's greatest challenges.
                    </p>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-lg">
                    The key to navigating this rapidly changing landscape is to remain curious, adaptable, and committed to lifelong learning. 
                    By embracing these technologies while being mindful of their implications, we can work together to create a future that 
                    benefits all of humanity. The journey ahead is filled with both opportunities and challenges, but with the right approach, 
                    we can harness the power of technology to build a better world for generations to come.
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-3 mt-16 pt-8 border-t border-gray-200">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">Technology</span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Innovation</span>
                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">Future</span>
                <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">AI</span>
                <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium">Digital Transformation</span>
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">News</span>
              </div>

              {/* Continue Button */}
              <div className="flex justify-center pt-12 mt-12 border-t border-gray-200">
                <button
                  onClick={handleContinue}
                  className="flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="text-lg">Continue Reading</span>
                  <ArrowRight size={24} />
                </button>
              </div>
            </article>
          )}
        </div>

        {/* Related Articles */}
        <section className="max-w-6xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedArticles.map((article) => (
              <article 
                key={article.id} 
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleRelatedArticleClick(article)}
              >
                <div className="h-48 overflow-hidden">
                  {article.image_url ? (
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${article.image_url ? 'hidden' : ''}`}>
                    <span className="text-4xl">📰</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {article.author}</span>
                    <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="max-w-4xl mx-auto mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with RegenX</h2>
          <p className="text-xl mb-8 opacity-90">Get the latest insights delivered directly to your inbox</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">RegenX</h3>
              <p className="text-gray-400 mb-4">
                Exploring the frontiers of technology and innovation to shape a better tomorrow.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Innovation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI & Machine Learning</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blockchain</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <p className="text-gray-400 mb-4">
                Join our community of innovators and thought leaders.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Join Community
              </button>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <p className="text-gray-400">© 2025 RegenX. All rights reserved. Designed with</p>
              <button
                onClick={handleHeartClick}
                className="text-red-500 hover:text-red-400 transition-colors transform hover:scale-110 duration-200"
                title="Continue to Last"
              >
                <Heart size={24} fill="currentColor" />
              </button>
              <p className="text-gray-400">for the future.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegenX;