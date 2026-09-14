// 白基調・高級感のあるトーンに合わせた、控えめなアクセントカラーのパレット
const PALETTE = [
  '#c9a876', // ゴールド
  '#a8988a', // ウォームグレージュ
  '#b98a8a', // ダスティローズ
  '#8fa892', // セージグリーン
  '#8ea6b0', // パウダーブルー
  '#a897b3', // ラベンダー
  '#c1a17a', // サンド
  '#b08a76', // テラコッタ
];

export function getCastColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}
