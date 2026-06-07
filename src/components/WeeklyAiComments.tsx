import type { WeekData, WeeklyAiComment } from '../types'
import { participantMap } from '../data/participants'

interface WeeklyAiCommentsProps {
  weekData: WeekData
  leaderboard: { uid: string }[]
}

const TAG_COLORS = [
  'bg-green-500/15 text-green-400 border-green-500/25',
  'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'bg-pink-500/15 text-pink-400 border-pink-500/25',
]

function CommentCard({
  comment,
  nickname,
  avatar,
}: {
  comment: WeeklyAiComment
  nickname: string
  avatar: string
}) {
  return (
    <div
      className="relative bg-[#111118] rounded-2xl border border-[#1e1e2a] p-6 md:p-8
                  hover:border-purple-500/25 transition-all duration-300 overflow-hidden
                  max-w-[720px] mx-auto"
    >
      {/* 顶部紫粉渐变装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-pink-400 to-neon-green" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <img
          src={avatar}
          alt={nickname}
          className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
        />
        <div>
          <div className="text-white font-bold text-base">{nickname}</div>
          {comment.title && (
            <span
              className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold
                           bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300
                           border border-purple-500/25"
            >
              🎭 {comment.title}
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      {comment.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {comment.tags.map((tag, i) => (
            <span
              key={tag}
              className={`px-2.5 py-0.5 rounded-md text-xs border ${
                TAG_COLORS[i % TAG_COLORS.length]
              }`}
            >
              🔖 {tag}
            </span>
          ))}
        </div>
      )}

      {/* Highlight */}
      {comment.highlight && (
        <div className="bg-neon-green/[0.03] border-l-[3px] border-neon-green/40 rounded-r-lg px-4 py-3 mb-5">
          <p className="text-neon-green/80 text-sm italic leading-relaxed">
            💡 {comment.highlight}
          </p>
        </div>
      )}

      {/* AI Comment Body */}
      {comment.comment && (
        <div className="mb-6">
          <p className="text-[#d0d0d0] text-[15px] leading-relaxed">{comment.comment}</p>
        </div>
      )}

      <div className="border-t border-[#1e1e2a] mb-5" />

      {/* Next Week Flag */}
      {comment.nextWeekFlag && (
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-start gap-3 mb-4 border border-[#2a2a2a]">
          <div
            className="w-[18px] h-[18px] border-2 border-gray-600 rounded flex-shrink-0 mt-0.5
                        bg-gray-800/50"
          />
          <div>
            <span className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase">
              📋 下周 Flag
            </span>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              {comment.nextWeekFlag}
            </p>
          </div>
        </div>
      )}

      {/* Prediction */}
      {comment.prediction && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-lg">🔮</span>
          <span className="text-xs text-gray-600 italic">{comment.prediction}</span>
        </div>
      )}
    </div>
  )
}

export default function WeeklyAiComments({
  weekData,
  leaderboard,
}: WeeklyAiCommentsProps) {
  const rankedUids = leaderboard.map(e => e.uid)
  const orderedParticipants = rankedUids
    .map(uid => weekData.participants.find(p => p.uid === uid))
    .filter(Boolean)

  return (
    <section id="comments" className="max-w-6xl mx-auto px-4 pb-16">
      <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 tracking-tight">
        💬 AI 锐评茶话会
      </h2>
      <div className="flex flex-col gap-6">
        {orderedParticipants.map(wp => {
          if (!wp) return null
          const profile = participantMap.get(wp.uid)!
          return (
            <CommentCard
              key={wp.uid}
              comment={wp.aiComment}
              nickname={profile.nickname}
              avatar={profile.avatar}
            />
          )
        })}
      </div>
    </section>
  )
}
