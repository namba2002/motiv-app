'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import {
  getMajorGoals,
  saveMajorGoals,
  addMajorGoal,
  updateMajorGoal,
  generateId,
} from '@/lib/storage'
import { MajorGoal, MinorGoal } from '@/lib/types'

export default function GoalsPage() {
  const [majorGoals, setMajorGoals] = useState<MajorGoal[]>([])
  // 大区分追加中フラグ
  const [addingMajor, setAddingMajor] = useState(false)
  const [newMajorTitle, setNewMajorTitle] = useState('')
  // 小区分追加中: majorGoalId を保持
  const [addingMinorFor, setAddingMinorFor] = useState<string | null>(null)
  const [newMinorTitle, setNewMinorTitle] = useState('')

  // データを読み込む
  const loadData = () => {
    setMajorGoals(getMajorGoals())
  }

  useEffect(() => {
    loadData()
  }, [])

  // 大区分を追加
  const handleAddMajor = () => {
    if (!newMajorTitle.trim()) return
    const newGoal: MajorGoal = {
      id: generateId(),
      title: newMajorTitle.trim(),
      minorGoals: [],
    }
    addMajorGoal(newGoal)
    setNewMajorTitle('')
    setAddingMajor(false)
    loadData()
  }

  // 小区分を追加
  const handleAddMinor = (majorGoalId: string) => {
    if (!newMinorTitle.trim()) return
    const major = majorGoals.find(m => m.id === majorGoalId)
    if (!major) return

    // 小区分のナンバリングを自動生成
    const majorIndex = majorGoals.findIndex(m => m.id === majorGoalId) + 1
    const minorIndex = major.minorGoals.length + 1
    const number = `${majorIndex}.${minorIndex}`

    const newMinor: MinorGoal = {
      id: generateId(),
      majorGoalId,
      number,
      title: newMinorTitle.trim(),
      status: 'pending',
    }

    const updatedMajor: MajorGoal = {
      ...major,
      minorGoals: [...major.minorGoals, newMinor],
    }
    updateMajorGoal(updatedMajor)
    setNewMinorTitle('')
    setAddingMinorFor(null)
    loadData()
  }

  // 小区分のステータスを切り替え（now <-> pending）
  const handleToggleStatus = (majorGoalId: string, minorId: string) => {
    const major = majorGoals.find(m => m.id === majorGoalId)
    if (!major) return

    const updatedMinors = major.minorGoals.map(m =>
      m.id === minorId
        ? { ...m, status: m.status === 'now' ? 'pending' as const : 'now' as const }
        : m
    )
    const updatedMajor: MajorGoal = { ...major, minorGoals: updatedMinors }
    updateMajorGoal(updatedMajor)
    loadData()
  }

  // 大区分を削除
  const handleDeleteMajor = (id: string) => {
    if (!confirm('この大区分と全ての小区分を削除しますか？')) return
    const current = getMajorGoals()
    saveMajorGoals(current.filter(m => m.id !== id))
    loadData()
  }

  return (
    <div className="flex flex-col flex-1">
      {/* ヘッダー */}
      <header className="bg-[#111827] px-4 pt-12 pb-4">
        <h1 className="text-white text-xl font-bold">長期目標</h1>
        <p className="text-gray-400 text-sm mt-0.5">目標を整理して進捗を管理</p>
      </header>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: '80px' }}>
        <div className="space-y-3">
          {/* 大区分リスト */}
          {majorGoals.map((major, majorIdx) => (
            <div key={major.id} className="bg-white rounded-2xl shadow-sm p-4">
              {/* 大区分ヘッダー */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#6d28d9]">
                    {majorIdx + 1}.
                  </span>
                  <h2 className="text-base font-bold text-gray-800">{major.title}</h2>
                </div>
                {/* 削除ボタン */}
                <button
                  onClick={() => handleDeleteMajor(major.id)}
                  className="text-gray-300 text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              {/* 小区分リスト */}
              <div className="space-y-2 mb-3">
                {major.minorGoals.map(minor => (
                  <div key={minor.id} className="flex items-center gap-3 py-1">
                    {/* ステータスアイコン（タップで切り替え） */}
                    <button
                      onClick={() => handleToggleStatus(major.id, minor.id)}
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                    >
                      {minor.status === 'now' ? (
                        // 進行中: 紫塗りつぶし
                        <div className="w-4 h-4 rounded-full bg-[#6d28d9] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      ) : (
                        // 未着手: グレーのアウトライン
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        </div>
                      )}
                    </button>

                    {/* テキスト */}
                    <span className="flex-1 text-sm text-gray-700">
                      <span className="text-[#a78bfa] mr-1">{minor.number}</span>
                      {minor.title}
                    </span>

                    {/* ステータスバッジ */}
                    {minor.status === 'now' ? (
                      <span className="flex-shrink-0 text-xs bg-[#ede9fe] text-[#6d28d9] font-bold rounded-md px-2 py-0.5">
                        進行中
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-xs bg-gray-100 text-gray-400 font-bold rounded-md px-2 py-0.5">
                        未着手
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* 小区分追加エリア */}
              {addingMinorFor === major.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMinorTitle}
                    onChange={e => setNewMinorTitle(e.target.value)}
                    placeholder="小区分のタイトル"
                    className="flex-1 bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d28d9]"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddMinor(major.id)
                      if (e.key === 'Escape') {
                        setAddingMinorFor(null)
                        setNewMinorTitle('')
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddMinor(major.id)}
                    className="bg-[#6d28d9] text-white text-xs font-bold rounded-xl px-3 py-2"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setAddingMinorFor(null)
                      setNewMinorTitle('')
                    }}
                    className="text-gray-400 text-xs px-2"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAddingMinorFor(major.id)
                    setAddingMajor(false)
                  }}
                  className="text-[#6d28d9] text-sm font-medium"
                >
                  + 小区分を追加
                </button>
              )}
            </div>
          ))}

          {/* 大区分追加エリア */}
          {addingMajor ? (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMajorTitle}
                  onChange={e => setNewMajorTitle(e.target.value)}
                  placeholder="大区分のタイトル（例: AIで給料を得る）"
                  className="flex-1 bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d28d9]"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddMajor()
                    if (e.key === 'Escape') {
                      setAddingMajor(false)
                      setNewMajorTitle('')
                    }
                  }}
                />
                <button
                  onClick={handleAddMajor}
                  className="bg-[#6d28d9] text-white text-xs font-bold rounded-xl px-3 py-2"
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setAddingMajor(false)
                    setNewMajorTitle('')
                  }}
                  className="text-gray-400 text-xs px-2"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setAddingMajor(true)
                setAddingMinorFor(null)
              }}
              className="w-full bg-white rounded-2xl shadow-sm p-4 text-[#6d28d9] font-semibold text-sm text-left hover:bg-[#f5f0ff] transition-colors"
            >
              + 大区分を追加
            </button>
          )}

          {/* 大区分がない場合 */}
          {majorGoals.length === 0 && !addingMajor && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">長期目標がありません</p>
              <p className="text-gray-300 text-xs mt-1">上のボタンから追加しましょう</p>
            </div>
          )}
        </div>
      </div>

      {/* BottomNav */}
      <BottomNav />
    </div>
  )
}
