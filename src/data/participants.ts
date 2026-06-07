import type { Participant } from '../types'

const BASE = import.meta.env.BASE_URL

export const participants: Participant[] = [
  {
    uid: "Latrell",
    nickname: "Latrell",
    height: 188,
    initialWeight: 107,
    avatar: `${BASE}avatars/Latrell.jpg`,
  },
  {
    uid: "Bard",
    nickname: "Bard",
    height: 175,
    initialWeight: 82,
    avatar: `${BASE}avatars/Bard.jpg`,
  },
  {
    uid: "猪事顺利",
    nickname: "猪事顺利",
    height: 175.6,
    initialWeight: 87.25,
    avatar: `${BASE}avatars/猪事顺利.jpg`,
  },
  {
    uid: "噤.",
    nickname: "噤.",
    height: 175.5,
    initialWeight: 81,
    avatar: `${BASE}avatars/噤..jpg`,
  },
  {
    uid: "起个名字",
    nickname: "起个名字",
    height: 180,
    initialWeight: 63,
    avatar: `${BASE}avatars/起个名字.jpg`,
  },
  {
    uid: "I miss",
    nickname: "I miss",
    height: 173.5,
    initialWeight: 87.5,
    avatar: `${BASE}avatars/I miss.jpg`,
  },
  {
    uid: "定轴转动的屑刚体",
    nickname: "定轴转动的屑刚体",
    height: 180,
    initialWeight: 91.75,
    avatar: `${BASE}avatars/定轴转动的屑刚体.jpg`,
  },
]

/** 快速查找：uid → Participant */
export const participantMap = new Map(
  participants.map(p => [p.uid, p])
)
