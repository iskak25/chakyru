export const ANIMS = [
  { id: "none", ky: "Жок", ru: "Нет" },
  { id: "float", ky: "Калуу", ru: "Парение" },
  { id: "spin", ky: "Айлануу", ru: "Вращение" },
  { id: "pulse", ky: "Дем", ru: "Пульс" },
  { id: "sway", ky: "Теңселүү", ru: "Качание" },
  { id: "pop", ky: "Пайда болуу", ru: "Появление" },
] as const;

export type AnimKind = (typeof ANIMS)[number]["id"];

export function animClass(anim?: string) {
  if (!anim || anim === "none") return "";
  return `el-anim el-${anim}`;
}
