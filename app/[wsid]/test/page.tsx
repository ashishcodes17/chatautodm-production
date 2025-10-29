'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'

export default function InstagramTestPage() {
  const { wsid } = useParams() as { wsid: string }
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wsid) return

    fetch(`/api/workspaces/${wsid}/user`)
      .then(res => res.json())
      .then(data => {
        setUserData(data.user)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load IG data:', err)
        setLoading(false)
      })
  }, [wsid])

  if (!wsid) return <p className="p-6 text-red-500">Missing workspace ID.</p>
  if (loading) return <p className="p-6">Loading...</p>
  if (!userData) return <p className="p-6 text-red-500">No user data found.</p>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src={userData.profilePictureUrl}
          alt={userData.username}
          width={80}
          height={80}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">@{userData.username}</h1>
          <h1 className="text-2xl font-bold">@{userData.name}</h1>
          <p className="text-sm text-gray-500">{userData.accountType}</p>
          <div className="flex space-x-4 mt-2 text-sm">
            <span>Followers: {userData.followers}</span>
            <span>Following: {userData.following}</span>
            <span>Posts: {userData.posts}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {userData.thumbnails?.map((post: any) => (
          <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer">
            <div className="border rounded-lg overflow-hidden shadow hover:scale-105 transition-transform">
              <Image
                src={post.thumbnail}
                alt={post.caption || 'Instagram post'}
                width={400}
                height={400}
                className="w-full h-[200px] object-cover"
              />
              <div className="p-2 text-sm line-clamp-2">{post.caption}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
