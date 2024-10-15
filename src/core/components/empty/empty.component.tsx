import { SsrHead } from "src/core/components/ssr-head/csr-head.comp";

export function Empty() {
  return <>{process.env.IS_SERVER && <SsrHead />}</>;
}
