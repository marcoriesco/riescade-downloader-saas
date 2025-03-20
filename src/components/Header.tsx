
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gamepad2, Zap, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );
      
      return () => subscription.unsubscribe();
    };
    
    checkUser();
  }, []);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-black/60 backdrop-blur-md border-b border-pink-600/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-[#ff0884]" />
          <span className="text-xl font-bold text-white">
            <span className="text-[#ff0884]">Game</span>Platform
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {!loading && (
            user ? (
              <>
                <div className="hidden md:flex items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-[#ff0884]/20 border border-[#ff0884]/50 flex items-center justify-center mr-2">
                    <UserIcon className="h-4 w-4 text-[#ff0884]" />
                  </div>
                  <span className="text-gray-200">{user.email}</span>
                </div>
                <Link 
                  href="/dashboard"
                  className="px-4 py-2 border border-[#ff0884]/50 text-sm font-medium rounded-md text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-[#ff0884]/50 text-white hover:bg-[#ff0884]/10 transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]"
              >
                <Zap className="h-4 w-4" />
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
