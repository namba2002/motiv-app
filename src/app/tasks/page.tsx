'use client'

import { useState, useEffect, useRef } from 'react'
import BottomNav from '@/components/BottomNav'
import AddTaskSheet from '@/components/AddTaskSheet'
import CheckMemoSheet from '@/components/CheckMemoSheet'
import {
  getTaskDefs,
  getCheckLogs,
  getMajorGoals,
  deleteCheckLog,
  addTaskDef,
  getTodayStr,
  getWeekRange,
  getMonthRange,
  generateId,
} from '@/lib/storage'
import { TaskDef, CheckLog, MinorGoal } from '@/lib/types'

// タブの型定義
type TabType = 'today' | 'week' | 'month'

// 今日の日付を日本語フォーマットで返す
function formatDateJP(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [taskDefs, setTaskDefs] = useState<TaskDef[]>([])
  const [checkLogs, setCheckLogs] = useState<CheckLog[]>([])
  const [minorGoals, setMinorGoals] = useState<MinorGoal[]>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [checkTarget, setCheckTarget] = useState<TaskDef | null>(null)
  const [quickInput, setQuickInput] = useState('')
  const quickInputRef = useRef<HTMLInputElement>(null)

  const today = getTodayStr()

  // データを読み込む
  const loadData = () => {
    setTaskDefs(getTaskDefs())
    setCheckLogs(getCheckLogs())
    const majors = getMajorGoals()
    setMinorGoals(majors.flatMap(m => m.minorGoals))
  }

  useEffect(() => {
    loadData()
  }, [])

  // 今日のチェックログを取得
  const todayLogs = checkLogs.filter(l => l.date === today)

  // タスクが今日チェック済みかどうか
  const isCheckedToday = (taskId: string): boolean => {
    return todayLogs.some(l => l.taskDefId === taskId)
  }

  // 今日チェック済みのlogを取得
  const getTodayLog = (taskId: string): CheckLog | undefined => {
    return todayLogs.find(l => l.taskDefId === taskId)
  }

  // 今月の達成数を取得
  const getMonthCount = (taskId: string): number => {
    const { start, end } = getMonthRange()
    return checkLogs.filter(l =>
      l.taskDefId === taskId &&
      l.date >= start &&
      l.date <= end
    ).length
  }

  // 今週の達成数を取得
  const getWeekCount = (taskId: string): number => {
    const { start, end } = getWeekRange()
    return checkLogs.filter(l =>
      l.taskDefId === taskId &&
      l.date >= start &&
      l.date <= end
    ).length
  }

  // チェックボックスをタップした時の処理
  const handleCheckTap = (task: TaskDef) => {
    if (isCheckedToday(task.id)) {
      // チェック済みなら取り消し
      const log = getTodayLog(task.id)
      if (log) {
        deleteCheckLog(log.id)
        loadData()
      }
    } else {
      // 未チェックならメモシートを開く
      setCheckTarget(task)
    }
  }

  // チェック完了後の更新
  const handleChecked = () => {
    loadData()
  }

  // クイック入力でタスクを追加
  const handleQuickAdd = () => {
    if (!quickInput.trim()) return
    const newTask: TaskDef = {
      id: generateId(),
      name: quickInput.trim(),
      unit: '',
      weekTarget: null,
      monthTarget: null,
      goalId: null,
      createdDate: today,
      isRecurring: false,
    }
    addTaskDef(newTask)
    setQuickInput('')
    loadData()
  }

  // 小区分名を取得
  const getMinorGoalTitle = (goalId: string | null): string | null => {
    if (!goalId) return null
    const minor = minorGoals.find(m => m.id === goalId)
    return minor ? `${minor.number} ${minor.title}` : null
  }

  // 今日表示するタスクリストを取得
  const getTodayTasks = () => {
    const recurring = taskDefs.filter(t => t.isRecurring)
    const todayOnly = taskDefs.filter(t => !t.isRecurring && t.createdDate === today)
    return { recurring, todayOnly }
  }

  // goalIdでタスクをグループ化
  const groupByGoal = (tasks: TaskDef[]): Map<string, TaskDef[]> => {
    const map = new Map<string, TaskDef[]>()
    for (const task of tasks) {
      const key = task.goalId || '__other__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(task)
    }
    return map
  }

  // 今月の進捗テキスト
  const getMonthProgressText = (task: TaskDef): string => {
    const count = getMonthCount(task.id)
    if (task.monthTarget !== null) {
      return `${count}/${task.monthTarget}${task.unit}`
    }
    return task.unit ? `${count}${task.unit}` : `${count}回`
  }

  // タスク行コンポーネント（今日タブ用）
  const TaskRowToday = ({ task }: { task: TaskDef }) => {
    const checked = isCheckedToday(task.id)
    return (
      <div
        className="flex items-center gap-3 py-3 px-1 min-h-[52px] cursor-pointer"
        onClick={() => handleCheckTap(task)}
      >
        {/* チェックボックス */}
        <div
          className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-colors ${
            checked
              ? 'bg-[#6d28d9]'
              : 'border-2 border-gray-300'
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* タスク情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${
                checked ? 'line-through text-[#a78bfa]' : 'text-gray-800'
              }`}
            >
              {task.name}
            </span>
            {/* 毎日バッジ */}
            {task.isRecurring && (
              <span className="text-[10px] bg-[#ede9fe] text-[#6d28d9] rounded-md px-1.5 py-0.5 font-bold flex-shrink-0">
                毎日
              </span>
            )}
          </div>
          {/* 今月の進捗 */}
          <p className="text-xs text-gray-400 mt-0.5">
            今月: {getMonthProgressText(task)}
          </p>
        </div>
      </div>
    )
  }

  // 今週/今月タブ用: 進捗バー
  const ProgressBar = ({ current, target }: { current: number; target: number | null }) => {
    if (target === null || target === 0) return null
    const pct = Math.min((current / target) * 100, 100)
    return (
      <div className="h-1.5 bg-[#ede9fe] rounded-full mt-2">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#a78bfa] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }

  // 今週タブの内容
  const WeekTab = () => {
    return (
      <div className="space-y-2">
        {taskDefs.map(task => {
          const count = getWeekCount(task.id)
          return (
            <div key={task.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{task.name}</span>
                <span className="text-sm font-bold text-[#6d28d9]">
                  {task.weekTarget !== null
                    ? `${count}/${task.weekTarget}${task.unit}`
                    : `${count}${task.unit}`
                  }
                </span>
              </div>
              <ProgressBar current={count} target={task.weekTarget} />
            </div>
          )
        })}
        {taskDefs.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">タスクがありません</p>
        )}
      </div>
    )
  }

  // 今月タブの内容
  const MonthTab = () => {
    return (
      <div className="space-y-2">
        {taskDefs.map(task => {
          const count = getMonthCount(task.id)
          const { start, end } = getMonthRange()
          // memoが空でないチェックログ
          const logsWithMemo = checkLogs.filter(l =>
            l.taskDefId === task.id &&
            l.date >= start &&
            l.date <= end &&
            l.memo !== ''
          )
          return (
            <div key={task.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{task.name}</span>
                <span className="text-sm font-bold text-[#6d28d9]">
                  {task.monthTarget !== null
                    ? `${count}/${task.monthTarget}${task.unit}`
                    : `${count}${task.unit}`
                  }
                </span>
              </div>
              <ProgressBar current={count} target={task.monthTarget} />
              {/* memoリスト */}
              {logsWithMemo.length > 0 && (
                <div className="mt-3 space-y-1">
                  {logsWithMemo.map(log => (
                    <div key={log.id} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className="text-[#a78bfa] flex-shrink-0">{log.date}</span>
                      <span>{log.memo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {taskDefs.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">タスクがありません</p>
        )}
      </div>
    )
  }

  // 今日タブの内容
  const TodayTab = () => {
    const { recurring, todayOnly } = getTodayTasks()
    const recurringGroups = groupByGoal(recurring)
    const todayOnlyGroups = groupByGoal(todayOnly)

    // グループを表示するヘルパー
    const renderGroups = (groups: Map<string, TaskDef[]>) => {
      return Array.from(groups.entries()).map(([key, tasks]) => {
        const goalLabel = key === '__other__'
          ? null
          : getMinorGoalTitle(key)

        return (
          <div key={key}>
            {/* グループラベル */}
            {goalLabel ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#ede9fe] text-[#6d28d9] text-xs font-bold rounded-md px-2 py-1">
                  {goalLabel}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400">📌 その他</span>
              </div>
            )}
            {/* タスクリスト */}
            <div className="divide-y divide-[#f0eeff]">
              {tasks.map(task => (
                <TaskRowToday key={task.id} task={task} />
              ))}
            </div>
          </div>
        )
      })
    }

    return (
      <div className="space-y-3">
        {/* 毎日繰り返しセクション */}
        {recurring.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
              毎日繰り返し
            </h3>
            {renderGroups(recurringGroups)}
          </div>
        )}

        {/* 今日だけセクション */}
        {todayOnly.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
              今日だけ
            </h3>
            {renderGroups(todayOnlyGroups)}
          </div>
        )}

        {/* タスクがない場合 */}
        {recurring.length === 0 && todayOnly.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">今日のタスクはありません</p>
            <p className="text-gray-300 text-xs mt-1">下のバーからタスクを追加しましょう</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      {/* ヘッダー */}
      <header className="bg-[#111827] px-4 pt-12 pb-4">
        <h1 className="text-white text-xl font-bold">タスク</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {formatDateJP(today)}
        </p>
      </header>

      {/* タブ */}
      <div className="bg-[#f5f4fc] px-4 pt-3">
        <div className="bg-[#ede9fe] rounded-xl p-1 flex">
          {(['today', 'week', 'month'] as const).map((tab) => {
            const labels: Record<TabType, string> = { today: '今日', week: '今週', month: '今月' }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  activeTab === tab
                    ? 'bg-[#6d28d9] text-white'
                    : 'text-[#6d28d9]'
                }`}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: '140px' }}>
        {activeTab === 'today' && <TodayTab />}
        {activeTab === 'week' && <WeekTab />}
        {activeTab === 'month' && <MonthTab />}
      </div>

      {/* クイック入力バー（BottomNavの上） */}
      <div
        className="fixed bottom-[60px] left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-[#ede9fe] px-3 py-2"
        style={{ zIndex: 30 }}
      >
        <div className="flex gap-2 items-center">
          <input
            ref={quickInputRef}
            type="text"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleQuickAdd()
            }}
            onBlur={handleQuickAdd}
            placeholder="タスクをすばやく追加..."
            className="flex-1 bg-[#f8f7ff] border border-[#ddd6fe] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d28d9]"
          />
          <button
            onClick={() => setShowAddSheet(true)}
            className="flex-shrink-0 bg-[#6d28d9] text-white text-xs font-bold rounded-xl px-3 py-2 min-h-[36px]"
          >
            詳細
          </button>
        </div>
      </div>

      {/* BottomNav */}
      <BottomNav />

      {/* AddTaskSheet */}
      <AddTaskSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdded={() => {
          loadData()
          setShowAddSheet(false)
        }}
      />

      {/* CheckMemoSheet */}
      <CheckMemoSheet
        isOpen={checkTarget !== null}
        task={checkTarget}
        onClose={() => setCheckTarget(null)}
        onChecked={handleChecked}
      />
    </div>
  )
}
