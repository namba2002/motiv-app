import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'モチベ管理',
  description: 'モチベーション管理アプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // 日本語ページとして設定
    <html lang="ja">
      {/* 全体背景をグレー、中央寄せ */}
      <body className="bg-gray-100 flex justify-center">
        {/* スマホ幅（390px）に制限したメインコンテナ */}
        <div className="w-full max-w-[390px] min-h-screen bg-[#f5f4fc] relative flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
