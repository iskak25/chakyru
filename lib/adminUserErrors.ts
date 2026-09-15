/** Public diagnostic codes only; never expose SDK messages or credentials. */
export function adminUserErrorCode(error: unknown): string {
  const value = error as { code?: unknown; message?: unknown } | null;
  const code = String(value?.code ?? "");
  if (value?.message === "firebase-admin-not-configured") return "firebase-config";
  if (["auth/insufficient-permission", "permission-denied", "7"].includes(code)) return "firebase-permission";
  if (["app/invalid-credential", "auth/invalid-credential", "app/invalid-app-options", "16"].includes(code)) return "firebase-credential";
  if (code === "ERR_REQUIRE_ESM") return "firebase-runtime";
  if (["4", "14", "ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "app/network-error"].includes(code)) return "firebase-unavailable";
  return "users";
}

export function adminUserErrorMessage(code: string, ru: boolean, fallback: string): string {
  const messages: Record<string, [string, string]> = {
    "firebase-config": ["На сервере не настроен FIREBASE_SERVICE_ACCOUNT. Проверьте переменную окружения Production и повторно разверните сайт.", "Серверде FIREBASE_SERVICE_ACCOUNT жөндөлгөн эмес. Production чөйрөсүнүн өзгөрмөсүн текшерип, сайтты кайра жайгаштырыңыз."],
    "firebase-permission": ["Сервисному аккаунту сервера не хватает доступа к Firebase Authentication или Firestore. Проверьте его IAM-права в Google Cloud.", "Сервердин кызматтык аккаунтунда Firebase Authentication же Firestore үчүн уруксат жетишсиз. Google Cloud ичиндеги IAM уруксаттарын текшериңиз."],
    "firebase-credential": ["Firebase отклонил учётные данные сервера. Проверьте ключ сервисного аккаунта в настройках Production.", "Firebase сервердин маалыматтарын кабыл алган жок. Production жөндөөлөрүндөгү кызматтык аккаунттун ачкычын текшериңиз."],
    "firebase-runtime": ["Не удалось загрузить Firebase Admin на сервере. Проверьте версию Node.js и зависимости в журнале развёртывания.", "Серверде Firebase Admin жүктөлгөн жок. Жайгаштыруу журналынан Node.js версиясын жана көз карандылыктарды текшериңиз."],
    "firebase-unavailable": ["Сервер не смог подключиться к Firebase. Повторите попытку; если ошибка остаётся, проверьте журнал сервера.", "Сервер Firebase менен байланыша алган жок. Кайра аракет кылыңыз; ката кайталанса, сервердин журналын текшериңиз."],
  };
  return messages[code]?.[ru ? 0 : 1] ?? fallback;
}
