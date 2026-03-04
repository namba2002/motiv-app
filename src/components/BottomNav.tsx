'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ナビゲーションアイテムの定義
const navItems = [
  { href: '/goals', label: '長期目標', icon: '🎯' },
  { href: '/tasks', label: 'タスク', icon: '📋' },
  { href: '/bucket', label: 'やりたいこと', icon: '✨' },
]

export default function BottomNav() {
  // 現在のパスを取得してアクティブタブを判定
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-[#ede9fe] flex"
      style={{ zIndex: 50 }}
    >
      {navItems.map((item) => {
        // アクティブかどうか判定
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center min-h-[60px] py-2 text-xs font-medium transition-colors ${
              isActive
                ? 'text-[#6d28d9]'  // アクティブ: 紫
                : 'text-[#c4b5fd]'  // 非アクティブ: 薄紫
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
