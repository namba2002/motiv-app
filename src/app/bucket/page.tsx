'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import {
  getBucketItems,
  addBucketItem,
  updateBucketItem,
  deleteBucketItem,
  generateId,
} from '@/lib/storage'
import { BucketItem } from '@/lib/types'

export default function BucketPage() {
  const [items, setItems] = useState<BucketItem[]>([])
  // 追加フォームの表示フラグ
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')

  // データを読み込む
  const loadData = () => {
    setItems(getBucketItems())
  }

  useEffect(() => {
    loadData()
  }, [])

  // アイテムを追加
  const handleAdd = () => {
    if (!newTitle.trim()) return
    const newItem: BucketItem = {
      id: generateId(),
      title: newTitle.trim(),
      category: newCategory.trim() || 'その他',
      done: false,
    }
    addBucketItem(newItem)
    setNewTitle('')
    setNewCategory('')
    setShowAddForm(false)
    loadData()
  }

  // 達成済み切り替え
  const handleToggleDone = (item: BucketItem) => {
    updateBucketItem({ ...item, done: !item.done })
    loadData()
  }

  // アイテムを削除
  const handleDelete = (id: string) => {
    if (!confirm('このアイテムを削除しますか？')) return
    deleteBucketItem(id)
    loadData()
  }

  // 統計
  const totalCount = items.length
  const doneCount = items.filter(i => i.done).length
  const pendingCount = totalCount - doneCount

  // カテゴリ別にグループ化
  const groupByCategory = (): Map<string, BucketItem[]> => {
    const map = new Map<string, BucketItem[]>()
    for (const item of items) {
      const key = item.category
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }

  const groups = groupByCategory()

  return (
    <div className="flex flex-col flex-1">
      {/* ヘッダー */}
      <header className="bg-[#111827] px-4 pt-12 pb-4">
        <h1 className="text-white text-xl font-bold">やりたいことリスト</h1>
        <p className="text-gray-400 text-sm mt-0.5">夢と目標を書き留めよう</p>
      </header>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: '80px' }}>

        {/* 統計ボックス */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">合計</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-[#6d28d9]">{doneCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">達成</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-[#a78bfa]">{pendingCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">未達成</p>
          </div>
        </div>

        {/* アイテム追加フォーム */}
        {showAddForm ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
            <h3 className="text-sm font-bold text-gray-700 mb-3">新しいアイテムを追加</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="やりたいこと（例: 富士山に登る）"
                className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') setShowAddForm(false)
                }}
              />
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="カテゴリ（例: 旅行, 趣味）省略可"
                className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') setShowAddForm(false)
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newTitle.trim()}
                  className="flex-1 bg-[#6d28d9] text-white font-bold rounded-xl py-3 text-sm disabled:opacity-40"
                >
                  追加する
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewTitle('')
                    setNewCategory('')
                  }}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold rounded-xl py-3 text-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-white rounded-2xl shadow-sm p-4 text-[#6d28d9] font-semibold text-sm text-left hover:bg-[#f5f0ff] transition-colors mb-3"
          >
            + 追加
          </button>
        )}

        {/* カテゴリ別アイテムリスト */}
        {Array.from(groups.entries()).map(([category, categoryItems]) => (
          <div key={category} className="bg-white rounded-2xl shadow-sm p-4 mb-3">
            {/* カテゴリラベル */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#ede9fe] text-[#6d28d9] text-xs font-bold rounded-md px-2 py-1">
                {category}
              </span>
              <span className="text-xs text-gray-400">
                {categoryItems.filter(i => i.done).length}/{categoryItems.length}
              </span>
            </div>

            {/* アイテムリスト */}
            <div className="divide-y divide-[#f0eeff]">
              {categoryItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 min-h-[44px]">
                  {/* チェックボックス */}
                  <button
                    onClick={() => handleToggleDone(item)}
                    className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      item.done
                        ? 'bg-[#6d28d9]'
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {item.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* タイトル */}
                  <span
                    className={`flex-1 text-sm ${
                      item.done
                        ? 'line-through text-gray-400'
                        : 'text-gray-800'
                    }`}
                  >
                    {item.title}
                  </span>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-200 text-lg w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-gray-400 flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* アイテムがない場合 */}
        {items.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">やりたいことがありません</p>
            <p className="text-gray-300 text-xs mt-1">上のボタンから追加しましょう</p>
          </div>
        )}
      </div>

      {/* BottomNav */}
      <BottomNav />
    </div>
  )
}
