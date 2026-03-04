import { MajorGoal, TaskDef, CheckLog, BucketItem } from './types'

// localStorageキー定数
const KEYS = {
  MAJOR_GOALS: 'motiv_major_goals',
  TASK_DEFS: 'motiv_task_defs',
  CHECK_LOGS: 'motiv_check_logs',
  BUCKET_ITEMS: 'motiv_bucket_items',
} as const

// SSR対策: ブラウザ環境かチェック
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// JSONパースのヘルパー
function getFromStorage<T>(key: string): T[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

// JSON保存のヘルパー
function saveToStorage<T>(key: string, items: T[]): void {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(items))
}

// ---- MajorGoal ----
export function getMajorGoals(): MajorGoal[] {
  return getFromStorage<MajorGoal>(KEYS.MAJOR_GOALS)
}

export function saveMajorGoals(items: MajorGoal[]): void {
  saveToStorage(KEYS.MAJOR_GOALS, items)
}

export function addMajorGoal(item: MajorGoal): void {
  const current = getMajorGoals()
  saveMajorGoals([...current, item])
}

export function updateMajorGoal(item: MajorGoal): void {
  const current = getMajorGoals()
  saveMajorGoals(current.map(g => g.id === item.id ? item : g))
}

export function deleteMajorGoal(id: string): void {
  const current = getMajorGoals()
  saveMajorGoals(current.filter(g => g.id !== id))
}

// ---- TaskDef ----
export function getTaskDefs(): TaskDef[] {
  return getFromStorage<TaskDef>(KEYS.TASK_DEFS)
}

export function saveTaskDefs(items: TaskDef[]): void {
  saveToStorage(KEYS.TASK_DEFS, items)
}

export function addTaskDef(item: TaskDef): void {
  const current = getTaskDefs()
  saveTaskDefs([...current, item])
}

export function updateTaskDef(item: TaskDef): void {
  const current = getTaskDefs()
  saveTaskDefs(current.map(t => t.id === item.id ? item : t))
}

export function deleteTaskDef(id: string): void {
  const current = getTaskDefs()
  saveTaskDefs(current.filter(t => t.id !== id))
}

// ---- CheckLog ----
export function getCheckLogs(): CheckLog[] {
  return getFromStorage<CheckLog>(KEYS.CHECK_LOGS)
}

export function saveCheckLogs(items: CheckLog[]): void {
  saveToStorage(KEYS.CHECK_LOGS, items)
}

export function addCheckLog(item: CheckLog): void {
  const current = getCheckLogs()
  saveCheckLogs([...current, item])
}

export function updateCheckLog(item: CheckLog): void {
  const current = getCheckLogs()
  saveCheckLogs(current.map(l => l.id === item.id ? item : l))
}

export function deleteCheckLog(id: string): void {
  const current = getCheckLogs()
  saveCheckLogs(current.filter(l => l.id !== id))
}

// ---- BucketItem ----
export function getBucketItems(): BucketItem[] {
  return getFromStorage<BucketItem>(KEYS.BUCKET_ITEMS)
}

export function saveBucketItems(items: BucketItem[]): void {
  saveToStorage(KEYS.BUCKET_ITEMS, items)
}

export function addBucketItem(item: BucketItem): void {
  const current = getBucketItems()
  saveBucketItems([...current, item])
}

export function updateBucketItem(item: BucketItem): void {
  const current = getBucketItems()
  saveBucketItems(current.map(b => b.id === item.id ? item : b))
}

export function deleteBucketItem(id: string): void {
  const current = getBucketItems()
  saveBucketItems(current.filter(b => b.id !== id))
}

// ---- ヘルパー関数 ----

// 今日の日付文字列を返す（YYYY-MM-DD）
export function getTodayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 今週の月曜〜日曜の範囲を返す
export function getWeekRange(): { start: string; end: string } {
  const today = new Date()
  const day = today.getDay() // 0=日, 1=月, ...
  // 月曜を週の始まりとする
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    start: dateToStr(monday),
    end: dateToStr(sunday),
  }
}

// 今月の1日〜末日の範囲を返す
export function getMonthRange(): { start: string; end: string } {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  return {
    start: dateToStr(firstDay),
    end: dateToStr(lastDay),
  }
}

// DateオブジェクトをYYYY-MM-DD文字列に変換
function dateToStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ユニークID生成
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
