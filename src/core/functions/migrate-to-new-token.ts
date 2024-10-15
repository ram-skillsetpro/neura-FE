import { ACCESS_TOKEN } from "src/const";

export function migrateToNewToken() {
  const authStr = localStorage.getItem("auth");
  if (authStr) {
    try {
      const authData = JSON.parse(authStr);
      if (authData && authData.token) {
        if (!localStorage.getItem(ACCESS_TOKEN)) {
          localStorage.setItem(ACCESS_TOKEN, authData.token);
        }
      }
    } catch {}
  }
}
