"use client";

import AddArticleModal from "@/components/home/AddArticleModal";
import { api } from "@/convex/_generated/api";
import { safeUrlCleanup } from "@/util/url";
import { SignInButton, UserButton } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function AuthenticatedDashboard() {
  const articles = useQuery(api.articles.list);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight">romu</h1>
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </header>

      <div className="flex flex-1 px-8">
        {/* Main Content */}
        <main className="mx-auto max-w-3xl flex-1 pt-8">
          <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="font-serif text-2xl text-gray-600">
              Recent Articles
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 text-gray-600 transition-colors hover:text-black"
            >
              <Plus className="h-4 w-4" />
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
                  className="group block"
                >
                  <article className="font-serif">
                    <div className="mb-1 flex items-baseline justify-between">
                      <h3 className="text-xl font-bold text-gray-900 decoration-gray-400 underline-offset-4 group-hover:underline">
                        {article.title}
                      </h3>
                      <span className="ml-4 shrink-0 text-sm text-gray-500">
                        {formatDistanceToNow(article.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {article.url !== undefined && (
                      <div className="text-sm text-gray-500">
                        {safeUrlCleanup(article.url)}
                      </div>
                    )}
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
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] text-[#222]">
      {/* Navigation */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-12">
        <div className="font-serif text-2xl font-bold tracking-tight">romu</div>
        <div className="flex items-center gap-6">
          <SignInButton mode="modal">
            <button className="cursor-pointer rounded-full bg-[#222] px-5 py-2.5 text-sm font-medium text-[#FDFBF7] transition-all hover:bg-gray-800">
              Sign In
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-32">
        <h1 className="mb-8 font-serif text-5xl leading-[1.1] font-medium tracking-tight md:text-7xl">
          Read better, <br className="hidden md:block" />
          <span className="text-gray-600 italic">think deeper.</span>
        </h1>
        <p className="mb-12 max-w-2xl font-serif text-lg leading-relaxed text-gray-600 md:text-xl">
          Romu is a sanctuary for your reading. Save articles from anywhere,
          read them in a distraction-free environment, and build your knowledge
          base.
        </p>

        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <SignInButton mode="modal">
            <button className="w-full rounded-full bg-[#222] px-8 py-4 text-lg font-medium text-[#FDFBF7] shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl sm:w-auto">
              Start Reading Now
            </button>
          </SignInButton>
        </div>
      </main>

      {/* Features Section - Zig Zag Layout */}
      <section className="w-full border-t border-gray-200 bg-white/50 px-6 py-20 md:py-32">
        <div className="mx-auto max-w-7xl space-y-24 md:space-y-32">
          {/* Feature 1: Text Left, Image Right */}
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-24">
            <div className="order-2 space-y-6 md:order-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-[#FDFBF7]">
                <svg
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-3xl font-medium md:text-4xl">
                Capture everything worth reading.
              </h3>
              <p className="font-serif text-lg leading-relaxed text-gray-600">
                Don&apos;t let great articles get lost in your open tabs. With
                Romu, you can save any article with a single click. We strip
                away the clutter, ads, and popups, preserving only the content
                that matters. Build a library of knowledge that&apos;s yours to
                keep forever.
              </p>
            </div>
            <div className="order-1 flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 font-serif text-gray-400 italic shadow-sm md:order-2">
              [Image Placeholder: Saving an article]
            </div>
          </div>

          {/* Feature 2: Image Left, Text Right */}
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-24">
            <div className="order-1 flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 font-serif text-gray-400 italic shadow-sm">
              [Image Placeholder: Reading interface]
            </div>
            <div className="order-2 space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-[#FDFBF7]">
                <svg
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-3xl font-medium md:text-4xl">
                Focus on the words.
              </h3>
              <p className="font-serif text-lg leading-relaxed text-gray-600">
                Experience reading as it should be. Our typography is carefully
                chosen to optimize readability and comfort. Switch to Studio
                mode to take notes alongside the text, or ask our AI assistant
                to help you summarize complex ideas and find connections.
              </p>
            </div>
          </div>

          {/* Feature 3: Text Left, Image Right */}
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-24">
            <div className="order-2 space-y-6 md:order-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-[#FDFBF7]">
                <svg
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-3xl font-medium md:text-4xl">
                Curate and connect.
              </h3>
              <p className="font-serif text-lg leading-relaxed text-gray-600">
                (Coming Soon) Share your annotated articles with friends or
                colleagues. Discuss ideas in the margins. Create a shared
                knowledge base that grows with your team. Romu isn&apos;t just
                for reading; it&apos;s for thinking together.
              </p>
            </div>
            <div className="order-1 flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 font-serif text-gray-400 italic shadow-sm md:order-2">
              [Image Placeholder: Sharing/Community]
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#FDFBF7] py-12 text-center font-serif text-sm text-gray-400">
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
        <div className="flex min-h-screen items-center justify-center font-serif text-gray-500">
          Loading...
        </div>
      </AuthLoading>
    </>
  );
}
