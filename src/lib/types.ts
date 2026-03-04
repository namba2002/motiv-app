// 長期目標: 大区分
export interface MajorGoal {
  id: string
  title: string         // 例: "AIで給料を得る"
  minorGoals: MinorGoal[]
}

// 長期目標: 小区分
export interface MinorGoal {
  id: string
  majorGoalId: string
  number: string        // 例: "1.1", "1.2"
  title: string         // 例: "AIの知識を深める"
  status: 'now' | 'pending' // now=進行中, pending=未着手
}

// タスク定義（1回登録 → 繰り返し表示）
export interface TaskDef {
  id: string
  name: string          // 例: "本を読む"
  unit: string          // 例: "冊", "回", "" (空=単位なし)
  weekTarget: number | null   // 週目標（nullなら未設定）
  monthTarget: number | null  // 月目標（nullなら未設定）
  goalId: string | null // MinorGoalのid（nullならリンクなし）
  createdDate: string   // YYYY-MM-DD 作成日
  isRecurring: boolean  // true=毎日表示(週or月目標あり), false=当日のみ
}

// チェックログ（チェックするたびに記録）
export interface CheckLog {
  id: string
  taskDefId: string
  date: string          // YYYY-MM-DD
  memo: string          // 任意メモ（本のタイトルなど）空文字OK
}

// やりたいことリスト
export interface BucketItem {
  id: string
  title: string
  category: string      // カテゴリ名
  done: boolean
}
