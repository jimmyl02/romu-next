"use client";

import AddArticleModal from "@/components/AddArticleModal";
import { api } from "@/convex/_generated/api";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function AuthenticatedDashboard() {
  const articles = useQuery(api.articles.list);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-bold font-serif tracking-tight">romu</h1>
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </header>

      <div className="flex flex-1 px-8">

        {/* Main Content */}
        <main className="flex-1 max-w-3xl mx-auto pt-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl text-gray-600 font-serif">Recent Articles</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Article
            </button>
          </div>

          <div className="space-y-8">
            {articles === undefined ? (
              <div className="text-gray-500">Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="text-gray-500">No articles saved yet.</div>
            ) : (
              articles.map((article) => (
                <Link
                  key={article._id}
                  href={`/articles/${article._id}`}
                  className="block group"
                >
                  <article className="font-serif">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-xl font-bold group-hover:underline decoration-gray-400 underline-offset-4 text-gray-900">
                        {article.title}
                      </h3>
                      <span className="text-sm text-gray-500 shrink-0 ml-4">
                        {formatDistanceToNow(article.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new URL(article.url).hostname.replace("www.", "")}
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>

      <AddArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#222]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold font-serif tracking-tight">romu</div>
        <div className="flex items-center gap-6">
          <SignInButton mode="modal">
            <button className="px-5 py-2.5 bg-[#222] text-[#FDFBF7] rounded-full text-sm font-medium hover:bg-gray-800 transition-all cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center max-w-4xl mx-auto w-full">
        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-8 tracking-tight">
          Read better, <br className="hidden md:block" />
          <span className="italic text-gray-600">think deeper.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 leading-relaxed font-serif">
          Romu is a sanctuary for your reading. Save articles from anywhere, read them in a distraction-free environment, and build your knowledge base.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#222] text-[#FDFBF7] rounded-full text-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
              Start Reading Now
            </button>
          </SignInButton>
        </div>
      </main>

      {/* Features Section - Zig Zag Layout */}
      <section className="px-6 py-20 md:py-32 border-t border-gray-200 w-full bg-white/50">
        <div className="max-w-7xl mx-auto space-y-24 md:space-y-32">
          
          {/* Feature 1: Text Left, Image Right */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center border border-gray-200">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-medium">Capture everything worth reading.</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-serif">
                Don&apos;t let great articles get lost in your open tabs. With Romu, you can save any article with a single click. We strip away the clutter, ads, and popups, preserving only the content that matters. Build a library of knowledge that&apos;s yours to keep forever.
              </p>
            </div>
            <div className="order-1 md:order-2 bg-gray-100 rounded-2xl aspect-[4/3] w-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 font-serif italic">
              [Image Placeholder: Saving an article]
            </div>
          </div>

          {/* Feature 2: Image Left, Text Right */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="order-1 bg-gray-100 rounded-2xl aspect-[4/3] w-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 font-serif italic">
               [Image Placeholder: Reading interface]
            </div>
            <div className="space-y-6 order-2">
              <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center border border-gray-200">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-medium">Focus on the words.</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-serif">
                Experience reading as it should be. Our typography is carefully chosen to optimize readability and comfort. Switch to Studio mode to take notes alongside the text, or ask our AI assistant to help you summarize complex ideas and find connections.
              </p>
            </div>
          </div>

          {/* Feature 3: Text Left, Image Right */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center border border-gray-200">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-medium">Curate and connect.</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-serif">
                (Coming Soon) Share your annotated articles with friends or colleagues. Discuss ideas in the margins. Create a shared knowledge base that grows with your team. Romu isn&apos;t just for reading; it&apos;s for thinking together.
              </p>
            </div>
            <div className="order-1 md:order-2 bg-gray-100 rounded-2xl aspect-[4/3] w-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 font-serif italic">
               [Image Placeholder: Sharing/Community]
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-400 text-sm font-serif border-t border-gray-200 bg-[#FDFBF7]">
        <div className="mb-4">
          <span className="text-lg font-bold text-gray-900">romu</span>
        </div>
        &copy; {new Date().getFullYear()} Romu. All rights reserved.
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Authenticated>
        <AuthenticatedDashboard />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center text-gray-500 font-serif">
          Loading...
        </div>
      </AuthLoading>
    </>
  );
}
