import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Todos</h1>
      <ul className="space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="p-4 bg-white shadow rounded border">
            {todo.name}
          </li>
        ))}
        {(!todos || todos.length === 0) && (
          <li className="text-gray-500 italic">No todos found. Make sure you have a 'todos' table in Supabase!</li>
        )}
      </ul>
    </div>
  )
}
