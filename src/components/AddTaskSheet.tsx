'use client'

import { useState, useEffect } from 'react'
import { TaskDef, MinorGoal } from '@/lib/types'
import { addTaskDef, getMajorGoals, getTodayStr, generateId } from '@/lib/storage'

interface AddTaskSheetProps {
  isOpen: boolean
  onClose: () => void
  onAdded: () => void
}

export default function AddTaskSheet({ isOpen, onClose, onAdded }: AddTaskSheetProps) {
  // フォームの状態管理
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [weekTarget, setWeekTarget] = useState('')
  const [monthTarget, setMonthTarget] = useState('')
  const [goalId, setGoalId] = useState<string>('')
  // 選択可能な小区分リスト
  const [minorGoals, setMinorGoals] = useState<MinorGoal[]>([])

  // シートが開いたとき、小区分リストを読み込む
  useEffect(() => {
    if (isOpen) {
      const majors = getMajorGoals()
      // 全ての小区分をフラットに展開
      const allMinors = majors.flatMap(m => m.minorGoals)
      setMinorGoals(allMinors)
    }
  }, [isOpen])

  // シートを閉じるときにフォームをリセット
  const handleClose = () => {
    setName('')
    setUnit('')
    setWeekTarget('')
    setMonthTarget('')
    setGoalId('')
    onClose()
  }

  // タスク追加処理
  const handleSubmit = () => {
    if (!name.trim()) return

    const wt = weekTarget ? parseInt(weekTarget) : null
    const mt = monthTarget ? parseInt(monthTarget) : null

    // 週目標または月目標が1以上なら毎日繰り返し
    const isRecurring = (wt !== null && wt > 0) || (mt !== null && mt > 0)

    const newTask: TaskDef = {
      id: generateId(),
      name: name.trim(),
      unit: unit.trim(),
      weekTarget: wt,
      monthTarget: mt,
      goalId: goalId || null,
      createdDate: getTodayStr(),
      isRecurring,
    }

    addTaskDef(newTask)
    handleClose()
    onAdded()
  }

  // シートが閉じているときは何も表示しない
  if (!isOpen) return null

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(17,24,39,0.45)' }}
        onClick={handleClose}
      />

      {/* ボトムシート本体 */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white rounded-t-2xl z-50 p-6 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={handleClose}
            className="text-[#a78bfa] text-sm font-medium"
          >
            キャンセル
          </button>
          <h2 className="text-base font-bold text-gray-800">タスクを追加</h2>
          {/* 右側のスペース調整用 */}
          <div className="w-16" />
        </div>

        {/* フォーム */}
        <div className="space-y-4">
          {/* タスク名（必須） */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              タスク名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: 本を読む"
              className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
            />
          </div>

          {/* 単位 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              単位（任意）
            </label>
            <input
              type="text"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="例: 冊, 回"
              className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
            />
          </div>

          {/* 週目標・月目標（横並び） */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                週目標（任意）
              </label>
              <input
                type="number"
                value={weekTarget}
                onChange={e => setWeekTarget(e.target.value)}
                placeholder="例: 3"
                min="0"
                className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                月目標（任意）
              </label>
              <input
                type="number"
                value={monthTarget}
                onChange={e => setMonthTarget(e.target.value)}
                placeholder="例: 10"
                min="0"
                className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
              />
            </div>
          </div>

          {/* 目標リンク（小区分セレクト） */}
          {minorGoals.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                目標リンク（任意）
              </label>
              <select
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
                className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
              >
                <option value="">リンクしない</option>
                {minorGoals.map(minor => (
                  <option key={minor.id} value={minor.id}>
                    {minor.number} {minor.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 繰り返し設定の説明 */}
          <p className="text-xs text-gray-400">
            ※ 週目標または月目標を設定すると、毎日タスクに表示されます
          </p>

          {/* 追加するボタン */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-[#6d28d9] text-white font-bold rounded-xl py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            追加する
          </button>
        </div>

        {/* iPhoneのホームインジケーター対策 */}
        <div className="h-4" />
      </div>
    </>
  )
}
