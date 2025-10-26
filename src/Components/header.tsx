"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createPortal } from 'react-dom';
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/Components/DropdownMenu";

import {
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { getProductSuggestions } from '@/services/productSuggestClient';
import {
  userMenuItems,
  guestMenuItems,
  navigationItems,
} from "@/constants/headerLinks";
import { getUserForHeader, UserHeaderData } from "@/lib/actions/user";
import { getImageUrl } from '@/lib/getImageUrl';
import { useCartStore } from "@/store/useCartStore";
import { ThemeToggle } from "@/Components/ui/ThemeToggle";
import MandalaPayButton from '@/Components/mandala-pay/shared/MandalaPayButton';
import NotificationBell from "./shared/NotificationBell";

interface HeaderProps {
  initialUserData: UserHeaderData | null;
}

function HeaderComponent({ initialUserData }: HeaderProps) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [hints, setHints] = useState<any[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const suggestRef = useRef<HTMLDivElement | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const loadingDelayRef = useRef<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number; width: number } | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  // client helper: use shared service `getProductSuggestions` (imported)

  // helper tô sáng kết quả tìm kiếm
  const highlightMatch = useCallback((text: string) => {
    const q = search.trim();
    if (!q) return text;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <span className="font-semibold">{match}</span>
        {after}
      </>
    );
  }, [search]);

  // Clear loading and navigating when navigation completes & reset UI
  useEffect(() => {
    if (loadingId) setLoadingId(null);
    if (navigating) setNavigating(false);
    setHints([]);
    setSuggestions([]);
    setIsSuggestOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  const { data: session, status, update } = useSession();
  const [userData, setUserData] = useState(initialUserData);
  const { totalItems } = useCartStore();

  useEffect(() => {
    setUserData(initialUserData);
  }, [initialUserData]);

  useEffect(() => {
    if (status === "authenticated") {
      getUserForHeader().then((data) => {
        if (data) setUserData(data);
      });
    } else {
      setUserData(null);
    }
  }, [status]);

  const currentMenuItems = useMemo(() => {
    return session?.user ? userMenuItems : guestMenuItems;
  }, [session?.user]);

  const getDisplayText = useCallback(() => {
    if (userData) return userData.name || userData.email || "User";
    return "Tài khoản";
  }, [userData]);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?query=${encodeURIComponent(search.trim())}`);
  }, [search, router]);

  // Lấy gợi ý (debounced) từ server qua endpoint suggest
  useEffect(() => {
    const q = search.trim();
    if (q.length === 0) {
      setSuggestions([]);
      setHints([]);
      setIsSuggestOpen(false);
      setActiveIndex(-1);
      return;
    }
    // cancel previous debounce if any
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const handle = window.setTimeout(async () => {
      try {
        if (navigating) return; // tạm dừng fetch khi đang điều hướng

        // start delayed loading indicator (show only if request is slow)
        if (loadingDelayRef.current) {
          window.clearTimeout(loadingDelayRef.current);
          loadingDelayRef.current = null;
        }
        loadingDelayRef.current = window.setTimeout(() => setShowLoading(true), 250);
        const data = await getProductSuggestions(q, 8);
        const serverHints = (data.hints && data.hints.length > 0) ? data.hints : [{ text: q }];
        setHints(serverHints);
        setSuggestions(data.products || []);
        // fetch complete: hide loading
        if (loadingDelayRef.current) {
          window.clearTimeout(loadingDelayRef.current);
          loadingDelayRef.current = null;
        }
        setShowLoading(false);
        const total = (serverHints?.length || 0) + ((data.products && data.products.length) || 0);
        setIsSuggestOpen(total > 0);
        setActiveIndex(-1);
        if (total > 0) {
          requestAnimationFrame(() => {
            if (inputWrapperRef.current) {
              const rect = inputWrapperRef.current.getBoundingClientRect();
              setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
            }
          });
        }
      } catch (err) {
        setSuggestions([]);
        if (loadingDelayRef.current) {
          window.clearTimeout(loadingDelayRef.current);
          loadingDelayRef.current = null;
        }
        setShowLoading(false);
        setActiveIndex(-1);
      }
    }, 250);

    debounceRef.current = handle;

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (loadingDelayRef.current) {
        window.clearTimeout(loadingDelayRef.current);
        loadingDelayRef.current = null;
      }
      setShowLoading(false);
    };
  }, [search, navigating]);

  // Close suggestions on outside interaction
  useEffect(() => {
    function onDoc(e: PointerEvent) {
      const target = e.target as Node;
      const clickedInsideSuggest = suggestRef.current && suggestRef.current.contains(target);
      const clickedInsideInput = inputWrapperRef.current && inputWrapperRef.current.contains(target);
      if (clickedInsideSuggest || clickedInsideInput) return;
      setIsSuggestOpen(false);
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  const selectSuggestion = useCallback((item: any) => {
    const sid = item._id?.toString() || null;

    // Cancel pending debounce to avoid reopen
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Clear UI immediately so no later fetch re-opens dropdown
    setIsSuggestOpen(false);
    setHints([]);
    setSuggestions([]);
    setActiveIndex(-1);

    setLoadingId(sid);
    setNavigating(true);

    try {
      const inp = inputWrapperRef.current?.querySelector('input') as HTMLInputElement | null;
      if (inp) inp.blur();
    } catch (err) {
      // ignore
    }

    const safeSlug = encodeURIComponent(String(item.slug || ''));
    if (safeSlug) {
      router.push(`/products/${safeSlug}`);
    } else {
      router.push(`/search?query=${encodeURIComponent(item.name || '')}`);
      setTimeout(() => {
        setNavigating(false);
        setLoadingId(null);
      }, 1500);
    }
  }, [router]);

  const onInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => {
        if (i >= suggestions.length - 1) return 0;
        return Math.min(i + 1, suggestions.length - 1);
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => {
        if (i <= 0) return suggestions.length - 1;
        return Math.max(i - 1, 0);
      });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSuggestOpen(false);
    }
  }, [isSuggestOpen, suggestions, activeIndex, selectSuggestion]);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!isSuggestOpen) return;
    function update() {
      if (inputWrapperRef.current) {
        const rect = inputWrapperRef.current.getBoundingClientRect();
        setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
      }
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [isSuggestOpen]);

  useEffect(() => {
    setSearch("");
  }, [pathname]);

  useEffect(() => {
    const handleLoginSuccess = () => {
      update();
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, [update]);

  // immediate hint on typing
  const onInputChange = (v: string) => {
    setSearch(v);
    if (v.trim().length > 0) {
      setHints([{ text: v }]);
      setSuggestions([]);
      setIsSuggestOpen(true);
      setActiveIndex(-1);
    } else {
      setHints([]);
      setSuggestions([]);
      setIsSuggestOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-sm border-b dark:border-gray-700">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link className="flex items-center space-x-3" href="/">
            <div className="flex items-center">
              <span
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{ background: "hsl(88 50% 53%)" }}
              >
                <span className="ml-2 text-3xl text-white font-[cursive] italic font-bold tracking-tight">
                  M
                </span>
              </span>
              <span className="ml-2 text-3xl text-black dark:text-white font-[cursive] italic font-bold tracking-tight">
                andala
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8 flex flex-col" ref={inputWrapperRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  value={search}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  className="rounded-r-none border-r-0 focus:border-primary pr-4"
                />
                <Button
                  type="submit"
                  className="rounded-l-none px-6 bg-primary hover:bg-primary-hover"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-colors h-auto p-2"
                >
                  <User className="h-7 w-7" />
                  <span className="text-sm mt-1 font-medium max-w-20 truncate">
                    {getDisplayText()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-2 bg-white dark:bg-gray-800"
              >
                {currentMenuItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    asChild={!item.action}
                    className="rounded-lg px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                  >
                    {item.action === "logout" ? (
                      <button
                        onClick={handleLogout}
                        className="w-full text-left"
                      >
                        {item.text}
                      </button>
                    ) : item.href ? (
                      <Link href={item.href} className="w-full block">
                        {item.text}
                      </Link>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {session?.user && <MandalaPayButton userData={userData} />}

            <Link
              href="/cart"
              className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary relative"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs mt-1">Giỏ hàng</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {session?.user && <NotificationBell />}
          </div>
        </div>
      </div>

      {isSuggestOpen && dropdownPos && typeof document !== 'undefined' && createPortal(
        <div
          ref={suggestRef}
          role="listbox"
          aria-activedescendant={activeIndex >= 0 ? `suggest-${activeIndex}` : undefined}
          style={{ position: 'fixed', left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width, zIndex: 9999 }}
        >
          {/* Fixed height = 4 items (h-14 each) -> h-56 total */}
          <div
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg animate-fade ${suggestions.length >= 4 ? 'scrollbar-hide' : ''}`}
            style={{
              height: suggestions.length >= 4 ? 192 : 'auto',
              overflowY: suggestions.length >= 4 ? 'auto' : 'visible'
            }}
          >
            {showLoading && (
              <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Đang tìm kiếm...</span>
              </div>
            )}
            {/* Render hints first */}
            {hints.map((h, idx) => (
              <button
                key={`hint-${idx}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // cancel debounce and loading delay
                  if (debounceRef.current) { window.clearTimeout(debounceRef.current); debounceRef.current = null; }
                  if (loadingDelayRef.current) { window.clearTimeout(loadingDelayRef.current); loadingDelayRef.current = null; setShowLoading(false); }
                  setIsSuggestOpen(false);
                  setHints([]);
                  setSuggestions([]);
                  setActiveIndex(-1);
                  setSearch(h.text || h);
                  router.push(`/search?query=${encodeURIComponent(h.text || h)}`);
                }}
                type="button"
                className="w-full text-left flex items-center gap-3 px-3 h-12 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{h.text}</div>
                </div>
              </button>
            ))}

            {suggestions.map((s, idx) => {
              const sid = s._id?.toString() || `idx-${idx}`;
              return (
                <button
                  id={`suggest-${idx}`}
                  key={s._id || idx}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (loadingId === sid) return; // ignore double
                    // cancel debounce and loading delay
                    if (debounceRef.current) { window.clearTimeout(debounceRef.current); debounceRef.current = null; }
                    if (loadingDelayRef.current) { window.clearTimeout(loadingDelayRef.current); loadingDelayRef.current = null; setShowLoading(false); }
                    // show per-item loading
                    setLoadingId(sid);
                    // clear UI immediately to avoid reopen
                    setIsSuggestOpen(false);
                    setHints([]);
                    setSuggestions([]);
                    setActiveIndex(-1);
                    // blur input
                    try { const inp = inputWrapperRef.current?.querySelector('input') as HTMLInputElement | null; if (inp) inp.blur(); } catch (err) {}
                    // navigate
                    const safeSlug = encodeURIComponent(String(s.slug || ''));
                    if (safeSlug) {
                      router.push(`/products/${safeSlug}`);
                    } else {
                      router.push(`/search?query=${encodeURIComponent(s.name || '')}`);
                    }
                  }}
                  type="button"
                  role="option"
                  aria-selected={idx === activeIndex}
                  disabled={loadingId === sid}
                  className={`relative w-full text-left flex items-center gap-3 px-3 h-12 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${idx === activeIndex ? 'bg-gray-100 dark:bg-gray-700' : ''} ${loadingId && loadingId !== sid ? 'opacity-60' : ''}`}
                >
                  <img
                    src={((): string => {
                      const u = getImageUrl(s.image || '');
                      return u === '/placeholder.svg' ? '/products/product_placeholder.png' : u;
                    })()}
                    alt={s.name}
                    className="w-9 h-9 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium truncate">{highlightMatch(s.name)}</div>
                    {s.brand && <div className="text-xs text-muted-foreground truncate">{highlightMatch(s.brand)}</div>}
                  </div>
                  {loadingId === sid && (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  )}
                  {/* per-item overlay when loading */}
                  {loadingId === sid && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-800/60 rounded">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">Đang mở...</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>, document.body)
      }

      {/* Navigation Menu */}
      <nav className="bg-primary dark:bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-hover lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden lg:flex items-center space-x-8 py-3">
              {navigationItems.map((item, index) => {
                const isActive = pathname === item.href;
                const activeClass = isActive
                  ? "text-[#8BC34A]"
                  : "hover:text-accent";

                return item.hasDropdown ? (
                  <div key={index} className="relative group">
                    <Link
                      href={item.href}
                      className={`font-medium transition-colors flex items-center gap-1 ${activeClass}`}
                    >
                      {item.text}
                      <ChevronDown className="h-4 w-4" />
                    </Link>
                    {/* Dropdown menu có thể thêm sau */}
                  </div>
                ) : (
                  <Link
                    key={index}
                    href={item.href}
                    className={`font-medium transition-colors ${activeClass}`}
                  >
                    {item.text}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

const Header = React.memo(HeaderComponent);
export default Header;
