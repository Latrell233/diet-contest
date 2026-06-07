import type { Participant } from '../types'

export const participants: Participant[] = [
  {
    uid: "Latrell",
    nickname: "Latrell",
    height: 188,
    initialWeight: 107,
    avatar: "/avatars/Latrell.jpg",
  },
  {
    uid: "Bard",
    nickname: "Bard",
    height: 175,
    initialWeight: 82,
    avatar: "/avatars/Bard.jpg",
  },
  {
    uid: "猪事顺利",
    nickname: "猪事顺利",
    height: 175.6,
    initialWeight: 87.25,
    avatar: "/avatars/猪事顺利.jpg",
  },
  {
    uid: "噤.",
    nickname: "噤.",
    height: 175.5,
    initialWeight: 81,
    avatar: "/avatars/噤..jpg",
  },
  {
    uid: "起个名字",
    nickname: "起个名字",
    height: 180,
    initialWeight: 63,
    avatar: "/avatars/起个名字.jpg",
  },
  {
    uid: "I miss",
    nickname: "I miss",
    height: 173.5,
    initialWeight: 87.5,
    avatar: "/avatars/I miss.jpg",
  },
  {
    uid: "定轴转动的屑刚体",
    nickname: "定轴转动的屑刚体",
    height: 180,
    initialWeight: 91.75,
    avatar: "/avatars/定轴转动的屑刚体.jpg",
  },
]

/** 快速查找：uid → Participant */
export const participantMap = new Map(
  participants.map(p => [p.uid, p])
)
