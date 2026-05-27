'use client';

import { useState } from 'react';
import { Friend } from '@/lib/types';

interface Props {
  initial?: Friend;
  onSave: (friend: Friend) => void;
  onClose: () => void;
}

export default function AddFriendModal({ initial, onSave, onClose }: Props) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [lolRiotId, setLolRiotId] = useState(initial?.lolRiotId ?? '');
  const [pubgName, setPubgName] = useState(initial?.pubgName ?? '');
  const [pubgPlatform, setPubgPlatform] = useState<'steam' | 'kakao'>(
    initial?.pubgPlatform ?? 'steam'
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      displayName: displayName.trim(),
      lolRiotId: lolRiotId.trim() || undefined,
      pubgName: pubgName.trim() || undefined,
      pubgPlatform: pubgName.trim() ? pubgPlatform : undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6">
        <h2 className="text-white text-xl font-bold mb-5">
          {initial ? '친구 수정' : '친구 추가'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">표시 이름 *</label>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="친구 이름"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1 flex items-center gap-2">
              <span className="text-yellow-400">⚔</span> 롤 Riot ID
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              placeholder="GameName#KR1"
              value={lolRiotId}
              onChange={(e) => setLolRiotId(e.target.value)}
            />
            <p className="text-gray-600 text-xs mt-1">예: Faker#KR1</p>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1 flex items-center gap-2">
              <span className="text-orange-400">🎯</span> PUBG 닉네임
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="닉네임"
              value={pubgName}
              onChange={(e) => setPubgName(e.target.value)}
            />
            {pubgName.trim() && (
              <div className="flex gap-2 mt-2">
                {(['steam', 'kakao'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPubgPlatform(p)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      pubgPlatform === p
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {p === 'steam' ? 'Steam' : 'Kakao'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2.5 font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 font-medium transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
