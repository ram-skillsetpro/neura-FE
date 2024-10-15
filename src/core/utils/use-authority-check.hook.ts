import { useEffect, useState } from "react";

/**
 * Custom React hook for checking if a user has specified authorities.
 *
 * @param {string[]} authoritiesToCheck - An array of authority names to check.
 * @returns {boolean} - Returns `true` if the user has all specified authorities, otherwise `false`.
 */
export const useAuthorityCheck = (authoritiesToCheck: string[]): boolean => {
  const [userAuthority, setUserAuthority] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      const authData = localStorage.getItem("auth");
      if (authData) {
        const parsedAuthData = JSON.parse(authData);
        if (parsedAuthData.userauthority) {
          setUserAuthority(
            parsedAuthData.userauthority.map((authority: { name: string }) => authority.name),
          );
        }
      }
    }
  }, []); // Empty dependency array to run this effect only once

  /**
   * Check if the user has all specified authorities.
   *
   * @type {boolean}
   */
  const hasAuthorities: boolean = authoritiesToCheck.some((authority: string) =>
    userAuthority.includes(authority),
  );

  return hasAuthorities;
};
