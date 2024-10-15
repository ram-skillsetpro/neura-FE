import { Outlet } from "react-router";
import PublicHeader from "./public-header/public-header.comp";
import "./public-layout.scss";

export default function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
    </>
  );
}
