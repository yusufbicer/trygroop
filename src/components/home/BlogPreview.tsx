
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomCard, CustomCardHeader, CustomCardContent, CustomCardFooter } from '../ui/CustomCard';
import { CustomButton } from '../ui/CustomButton';

const blogPosts = [
  {
    id: 1,
    title: 'Optimizing Container Space: How Consolidation Saves Money',
    excerpt: 'Learn how properly consolidated shipments can reduce your shipping costs by up to 40% while ensuring timely delivery.',
    author: 'Murat Kaya',
    date: 'Aug 15, 2023',
    category: 'Shipping',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'The Complete Guide to Turkish Import Documentation',
    excerpt: 'Navigate the complex world of Turkish export documentation with our comprehensive guide for international importers.',
    author: 'Ayşe Demir',
    date: 'Jul 28, 2023',
    category: 'Documentation',
    readTime: '8 min read',
  },
  {
    id: 3,
    title: 'Streamlining Payments for Multiple Turkish Suppliers',
    excerpt: 'Discover how payment consolidation can simplify your accounting, reduce transaction fees, and improve supplier relationships.',
    author: 'Kerem Yılmaz',
    date: 'Jun 12, 2023',
    category: 'Payments',
    readTime: '6 min read',
  },
];

const BlogPreview = () => {
  return (
    <section id="blog" className="py-20 bg-groop-darker relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-groop-blue/10 border border-groop-blue/20 text-sm text-groop-blue mb-6">
              Latest Articles
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Insights & Resources
            </h2>
            <p className="text-white/70 max-w-2xl">
              Explore our latest articles on shipping consolidation, documentation, and international trade.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link to="#" className="text-groop-blue hover:text-groop-blue-light transition-colors flex items-center gap-2">
              <span>View all articles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CustomCard interactive glassEffect className="h-full flex flex-col">
                <CustomCardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-groop-blue/10 text-groop-blue">
                      {post.category}
                    </span>
                    <span className="text-white/50 text-sm">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                </CustomCardHeader>
                <CustomCardContent className="flex-grow">
                  <p className="text-white/70 mb-4">{post.excerpt}</p>
                </CustomCardContent>
                <CustomCardFooter>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-groop-blue/20 flex items-center justify-center">
                      <span className="text-white font-medium">{post.author.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{post.author}</p>
                      <p className="text-white/50 text-xs">{post.date}</p>
                    </div>
                  </div>
                  <CustomButton variant="ghost" size="sm">
                    Read more
                  </CustomButton>
                </CustomCardFooter>
              </CustomCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
