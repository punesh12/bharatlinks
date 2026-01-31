import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  QrCode,
  Smartphone,
  Zap,
  BarChart3,
  Globe2,
  IndianRupee,
  Link2,
  Tag,
  Users,
  Shield,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";

const Home = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navigation */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg p-1.5">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Bharat<span className="text-blue-600">Links</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            href="#pricing"
          >
            Pricing
          </Link>
          <Link
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            href="#faq"
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block"
          >
            Log in
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="container mx-auto relative px-4 md:px-6 z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                v1.0 is now live for India 🇮🇳
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-slate-900">
                Supercharge your <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  WhatsApp Business
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl leading-relaxed">
                Create smart links that open directly in apps. Track every click, capture leads, and
                accept UPI payments seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 rounded-full text-lg shadow-lg shadow-blue-600/20"
                  >
                    Create Free Link
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-full text-lg border-slate-300"
                >
                  View Demo
                </Button>
              </div>

              <div className="pt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Free forever plan
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-20 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to grow
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Powerful features tailored for the Indian digital ecosystem.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Link2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Link Shortening</h3>
                <p className="text-slate-500 leading-relaxed">
                  Create short, memorable links instantly. Edit destination URLs anytime without
                  breaking existing links. Perfect for campaigns, social media, and SMS marketing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">UPI Express Links</h3>
                <p className="text-slate-500 leading-relaxed">
                  Create payment links that open directly in UPI apps. One-click payments via
                  PhonePe, Google Pay, Paytm, and more. Accept payments seamlessly without
                  redirects.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp Preview Cards</h3>
                <p className="text-slate-500 leading-relaxed">
                  Customize title, description, and thumbnail that appear when links are shared on
                  WhatsApp. Increase click-through rates with professional preview cards.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Dynamic QR Codes</h3>
                <p className="text-slate-500 leading-relaxed">
                  Generate branded QR codes for print and digital use. Update destination URLs
                  anytime without reprinting. Customize colors and add your logo.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Advanced Analytics</h3>
                <p className="text-slate-500 leading-relaxed">
                  Track clicks by city, device, browser, and referrer. Know which campaigns drive
                  sales. Export data as CSV or PDF for deeper analysis.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <Tag className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">UTM Templates & Tags</h3>
                <p className="text-slate-500 leading-relaxed">
                  Save UTM parameter templates for consistent campaign tracking. Organize links with
                  tags and powerful search. Never lose track of your campaigns.
                </p>
              </div>

              {/* Feature 7 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Globe2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Custom Domains</h3>
                <p className="text-slate-500 leading-relaxed">
                  Use your own branded domain for short links. Build trust with links like
                  yourbrand.com/offer instead of generic URLs. Multiple domains supported.
                </p>
              </div>

              {/* Feature 8 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Team Collaboration</h3>
                <p className="text-slate-500 leading-relaxed">
                  Organize links into workspaces. Collaborate with team members. Perfect for
                  agencies managing multiple clients or teams working on campaigns.
                </p>
              </div>

              {/* Feature 9 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Blazing Fast Redirects</h3>
                <p className="text-slate-500 leading-relaxed">
                  Hosted on Edge locations in Mumbai & Bangalore. Sub-100ms redirect speeds for
                  Indian users. Your customers won&apos;t wait for pages to load.
                </p>
              </div>

              {/* Feature 10 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Compliant</h3>
                <p className="text-slate-500 leading-relaxed">
                  Data stored locally in India (DPDP Act compliant). AI-powered phishing detection.
                  Enterprise-grade security to keep your brand safe from scams.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <section className="w-full py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to professionalize your business?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join 1,000+ Indian creators and businesses using BharatLinks to manage their digital
              presence.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-14 px-8 rounded-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg"
              >
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 md:px-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-bold text-xl text-white tracking-tight">
              Bharat<span className="text-blue-500">Links</span>
            </span>
            <p className="mt-4 text-sm leading-relaxed">
              Making the internet smaller and smarter for Indian businesses.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © 2024 BharatLinks Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
