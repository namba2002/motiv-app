import { redirect } from 'next/navigation'

// ルートページはタスク画面にリダイレクト
export default function Home() {
  redirect('/tasks')
}
