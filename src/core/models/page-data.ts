export interface PageMetaData {
  description?: string;
  canonicalUrl?: string;
  keywords?: string;
}

export interface PageDataSeo {
  title?: string;
  metaData?: PageMetaData;
}

export interface PageRedirect {
  /**
   * Path to redirect
   */
  path: string;
  /**
   * Replace current url.
   * This will replace in history api
   */
  replace?: boolean;
  /**
   * state data of route
   */
  state?: Record<string, any>;
}

/**
 * Every page interface should extend with this interface
 */
export interface IRedirect {
  /**
   * redirect will use to redirect to another page when getInitialProps will return redirect key
   * from getInitialProps
   */
  redirect: PageRedirect;
}
/**
 * Common interface for page data.
 * Don't remove IRedirect extend
 */
export interface PageData {
  /**
   * Some API sends page meta information as seo key in API response
   * change this key as per response of API
   */
  seo?: PageDataSeo;
  // uncomment following code if header comes from api
  // header?: HeaderData;
}
