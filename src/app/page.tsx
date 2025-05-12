// app/page.tsx
'use client'
import { auth } from "@/lib/firebase/firebase.config";
import Link from "next/link";

export default function Home() {

  const user = auth.currentUser
  console.log(user);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to My Next.js App</h1>
      <p className="text-lg text-gray-700 text-center max-w-xl mb-8">
        This is a simple home page with navigation options.
      </p>
      <div className="flex space-x-4">
        <Link href='/chat/new' className="flex items-center justify-center  ">
          <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
            Chat
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Register
          </button>
        </Link>
        <Link href="/login">
          <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
            Login
          </button>
        </Link>
      </div>
    </main>
  );
}
