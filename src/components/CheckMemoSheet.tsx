'use client'

import { useState } from 'react'
import { TaskDef } from '@/lib/types'
import { addCheckLog, getCheckLogs, getMonthRange, generateId, getTodayStr } from '@/lib/storage'

interface CheckMemoSheetProps {
  isOpen: boolean
  task: TaskDef | null
  onClose: () => void
  onChecked: () => void
}

export default function CheckMemoSheet({ isOpen, task, onClose, onChecked }: CheckMemoSheetProps) {
  const [memo, setMemo] = useState('')

  // 今月の達成数を計算
  const getMonthCount = (): number => {
    if (!task) return 0
    const { start, end } = getMonthRange()
    const logs = getCheckLogs()
    return logs.filter(l =>
      l.taskDefId === task.id &&
      l.date >= start &&
      l.date <= end
    ).length
  }

  // 完了処理（memoを記録）
  const handleComplete = (skipMemo = false) => {
    if (!task) return
    const log = {
      id: generateId(),
      taskDefId: task.id,
      date: getTodayStr(),
      memo: skipMemo ? '' : memo.trim(),
    }
    addCheckLog(log)
    setMemo('')
    onChecked()
    onClose()
  }

  if (!isOpen || !task) return null

  // 今月の達成数（チェック前）
  const currentCount = getMonthCount()
  // チェック後の予想達成数
  const nextCount = currentCount + 1

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(17,24,39,0.45)' }}
        onClick={onClose}
      />

      {/* ボトムシート本体 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white rounded-t-2xl z-50 p-6 transition-transform duration-300"
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* タスク名 */}
        <h3 className="text-base font-bold text-gray-800 mb-1">
          {task.name}
        </h3>

        {/* 今月の進捗変化表示 */}
        {task.monthTarget !== null ? (
          <p className="text-sm text-[#a78bfa] mb-4">
            今月 {currentCount} → {nextCount}/{task.monthTarget}{task.unit}
          </p>
        ) : (
          <p className="text-sm text-[#a78bfa] mb-4">
            今月 {currentCount} → {nextCount}{task.unit}
          </p>
        )}

        {/* メモ入力欄 */}
        <div className="mb-5">
          <input
            type="text"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="例: 本のタイトルを入力..."
            className="w-full bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl p-3 text-sm outline-none focus:border-[#6d28d9]"
            onKeyDown={e => {
              if (e.key === 'Enter') handleComplete(false)
            }}
          />
        </div>

        {/* スキップして完了するリンク */}
        <div className="flex justify-center mb-3">
          <button
            onClick={() => handleComplete(true)}
            className="text-[#a78bfa] text-sm underline"
          >
            スキップして完了する
          </button>
        </div>

        {/* 完了するボタン */}
        <button
          onClick={() => handleComplete(false)}
          className="w-full bg-[#6d28d9] text-white font-bold rounded-xl py-3.5 text-sm"
        >
          完了する
        </button>

        {/* iPhoneのホームインジケーター対策 */}
        <div className="h-4" />
      </div>
    </>
  )
}
