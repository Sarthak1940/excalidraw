
import Link from "next/link";
import { Pencil, Users, Zap, Globe, Shield, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Pencil className="h-7 w-7 text-blue-600" />
              <span className="text-2xl font-semibold text-slate-900">
                DrawSpace
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/signin"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700 font-medium text-sm">Real-time Collaboration</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Draw, Create, and
            <span className="block text-blue-600">
              Collaborate Together
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            A simple, collaborative drawing tool that brings your ideas to life. 
            Work together in real-time with your team, no matter where they are.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Start Drawing Now
            </Link>
            <Link
              href="/canvas/demo"
              className="w-full sm:w-auto bg-white text-slate-700 px-8 py-3 rounded-lg hover:bg-slate-50 transition-colors font-medium border border-slate-300"
            >
              Try Demo
            </Link>
          </div>

          {/* Hero Image/Animation Placeholder */}
          <div className="mt-20 relative">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto border border-slate-200">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Pencil className="h-20 w-20 text-blue-400 mx-auto mb-4" />
                  <p className="text-xl font-medium text-slate-600">Your Canvas Awaits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-900 mb-3">
              Simple yet powerful
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to collaborate and create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg hover:shadow-md transition-shadow border border-slate-200">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Real-time Collaboration</h3>
              <p className="text-slate-600 leading-relaxed">
                Work together with your team in real-time. See changes instantly as everyone contributes to the canvas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg hover:shadow-md transition-shadow border border-slate-200">
              <div className="bg-amber-50 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Lightning Fast</h3>
              <p className="text-slate-600 leading-relaxed">
                Built for speed and performance. Draw without lag, even with multiple users on the same canvas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg hover:shadow-md transition-shadow border border-slate-200">
              <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Globe className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Anywhere Access</h3>
              <p className="text-slate-600 leading-relaxed">
                Access your drawings from anywhere. Cloud-based solution that works on all devices.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-lg hover:shadow-md transition-shadow border border-slate-200">
              <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data is encrypted and secure. We take privacy seriously and never share your content.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-lg hover:shadow-md transition-shadow border border-slate-200">
              <div className="bg-rose-50 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Pencil className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Intuitive Tools</h3>
              <p className="text-slate-600 leading-relaxed">
                Easy-to-use drawing tools that feel natural. Focus on creating, not learning complex software.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-lg hover:shadow-md transition-shadow border border-slate-200">
              <div className="bg-cyan-50 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Sparkles className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Clean Design</h3>
              <p className="text-slate-600 leading-relaxed">
                Minimal interface that makes drawing enjoyable. Clean and distraction-free workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join teams using DrawSpace to bring their ideas to life.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Pencil className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold text-slate-900">DrawSpace</span>
            </div>
            <p className="text-center md:text-right text-slate-600 text-sm">
              © 2025 DrawSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
