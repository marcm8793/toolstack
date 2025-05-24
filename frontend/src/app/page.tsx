import { ArrowRight, Code, Zap, Search } from "lucide-react";
import Link from "next/link";
import TourGuide from "@/components/tour-guide";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform">
    <Icon className="w-12 h-12 text-indigo-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const HomePage = () => {
  return (
    <div className="container min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center p-4 rounded-3xl relative">
      <div className="w-full max-w-6xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Welcome to ToolStack
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4">
              Your comprehensive platform for discovering developer tools,
              libraries, and components
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-4xl mx-auto">
              Find the perfect tools, libraries, frameworks, and components for
              your software engineering projects. From authentication solutions
              and UI libraries to analytics tools and payment integrations -
              explore our curated collection organized by categories and
              technology ecosystems.
            </p>
            <Link
              href="/tools"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition duration-300"
            >
              Explore Developer Tools
              <ArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={Search}
              title="Discover & Search"
              description="Browse through hundreds of carefully curated developer tools, libraries, and components across multiple categories like UI libraries, authentication, analytics, and more."
            />
            <FeatureCard
              icon={Code}
              title="Compare & Evaluate"
              description="Compare GitHub stars, features, and community feedback to choose the right tools for your tech stack. Filter by ecosystem (React, Vue, Node.js, etc.) and category."
            />
            <FeatureCard
              icon={Zap}
              title="Accelerate Development"
              description="Save time on research and boost your productivity by finding battle-tested tools and libraries that fit your project requirements and technology preferences."
            />
          </div>

          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Built for Developers, by Developers
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6">
              Whether you&apos;re building a new project or enhancing an
              existing one, ToolStack helps you discover the right tools for
              authentication, UI components, data visualization, payment
              processing, documentation, and dozens of other categories. Our
              integrated <strong>AI Chatbot</strong> is always available to
              provide personalized recommendations based on your specific needs.
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Click the chat icon at the bottom‑right to get AI-powered tool
              recommendations!
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">
              Ready to find your next favorite developer tool?
            </h2>
            <Link
              href="/tools"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-indigo-600 border-2 border-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition duration-300"
            >
              Start Exploring Tools
              <ArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      <TourGuide />
    </div>
  );
};

export default HomePage;
