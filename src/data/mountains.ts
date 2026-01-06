/**
 * 山域データ定義
 * 各山域の代表的な山頂の座標（緯度・経度・標高）を持つ
 */

export interface MountainArea {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  elevation: number;
}

export const MOUNTAIN_AREAS: MountainArea[] = [
  // 北海道
  { id: "rishiri", name: "利尻山", region: "道北", lat: 45.1787, lon: 141.5, elevation: 1721 },
  { id: "rausu", name: "羅臼岳", region: "道東", lat: 43.8, lon: 145.1264, elevation: 1661 },
  { id: "asahidake", name: "大雪山(旭岳)", region: "道央", lat: 43.6628, lon: 142.8547, elevation: 2291 },
  { id: "yotei", name: "羊蹄山", region: "道南", lat: 42.8267, lon: 140.8114, elevation: 1898 },

  // 東北
  { id: "chokai", name: "鳥海山", region: "鳥海", lat: 39.4, lon: 140.0472, elevation: 2236 },
  { id: "gassan", name: "月山", region: "月山", lat: 38.5489, lon: 139.5, elevation: 1984 },
  { id: "hakkoda", name: "八甲田山", region: "八甲田", lat: 40.6589, lon: 140.8767, elevation: 1585 },
  { id: "hayachine", name: "早池峰山", region: "早池峰", lat: 39.4775, lon: 141.4867, elevation: 1917 },
  { id: "zao", name: "蔵王山", region: "蔵王", lat: 38.5, lon: 141.2, elevation: 1841 },
  { id: "adatara", name: "安達太良山", region: "安達太良", lat: 37.7, lon: 141.5, elevation: 1700 },

  // 関東・上信越
  { id: "kumotori", name: "雲取山", region: "奥多摩", lat: 35.9, lon: 140.5, elevation: 2017 },
  { id: "hirugatake", name: "蛭ヶ岳", region: "丹沢", lat: 35, lon: 139.45, elevation: 1673 },
  { id: "kobushigatake", name: "甲武信ヶ岳", region: "秩父", lat: 36.7, lon: 139.5, elevation: 2475 },
  { id: "nikko-shirane", name: "日光白根山", region: "日光", lat: 36.7, lon: 141, elevation: 2578 },
  { id: "nasu", name: "茶臼岳(那須)", region: "那須", lat: 37.65, lon: 139.9633, elevation: 1915 },
  { id: "tanigawa", name: "谷川岳", region: "上信越", lat: 37.6, lon: 138.5, elevation: 1977 },
  { id: "fuji", name: "富士山", region: "富士山", lat: 35.85, lon: 139.1, elevation: 3776 },

  // 日本アルプス・八ヶ岳
  { id: "shirouma", name: "白馬岳", region: "北アルプス北部", lat: 37.5, lon: 137, elevation: 2932 },
  { id: "yari", name: "槍ヶ岳", region: "北アルプス南部", lat: 36.6, lon: 136.6, elevation: 3180 },
  { id: "kisokoma", name: "木曽駒ヶ岳", region: "中央アルプス", lat: 35.8, lon: 137.65, elevation: 2956 },
  { id: "kitadake", name: "北岳", region: "南アルプス", lat: 34.9, lon: 137.9, elevation: 3193 },
  { id: "akadake", name: "赤岳", region: "八ヶ岳", lat: 36.7, lon: 138.1, elevation: 2899 },
  { id: "suzuka", name: "御在所岳", region: "鈴鹿", lat: 35.0308, lon: 136.2, elevation: 1212 },

  // 西日本
  { id: "daisen", name: "大山", region: "中国", lat: 35.3708, lon: 133.5461, elevation: 1729 },
  { id: "ishizuchi", name: "石鎚山", region: "四国", lat: 33.7675, lon: 133.1164, elevation: 1982 },
  { id: "kuju", name: "くじゅう連山", region: "九州", lat: 33.0861, lon: 131.2428, elevation: 1791 },
  { id: "miyanoura", name: "宮之浦岳", region: "屋久島", lat: 30.3353, lon: 130.5017, elevation: 1936 },
];
