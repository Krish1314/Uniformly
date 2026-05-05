import { redirect } from 'next/navigation'

export default function Home() {
  // Automatically redirect to the catalog so users see the products immediately
  redirect('/catalog')
}
