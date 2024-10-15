![Build and Test](https://github.com/codebysandip/react-ssr/actions/workflows/run-test.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sandip12081992_react-ssr&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sandip12081992_react-ssr)
[![codecov](https://codecov.io/github/codebysandip/react-ssr/branch/main/graph/badge.svg?token=77XQDFXBUL)](https://codecov.io/github/codebysandip/react-ssr)

# Lighthouse Score

![lighthouse score](https://gist.githubusercontent.com/codebysandip/9b7d7703eec1c6d1352ac9a437aa5f10/raw/87347b0bd841ba2a6f57d1e8bd7708ca6c950657/pagespeed.svg)

#### [Full Lighthouse Report](https://googlechrome.github.io/lighthouse/viewer/?gist=431d33b9aa603674249d0561301c93c9)

Note: Actual Score of performance is 100 but sometimes github CI machine generates reports with lower values. Best Practices score is lower because of Image used of lower resolution

# Demo

Demo is more than thousands of words. Please click [here](https://codebysandip-react-ssr.herokuapp.com/) to see demo.

# React Server Side Rendering Architecture

These are following features out of box supported to reduce initial development time:

1.  Built on Typescript.
2.  Well documented.
3.  Used core modules(node and React) to develop this architecture. It means you will never be in a situation of not supporting things as most libraries fail when we get complex requirements from clients. As we all know libraries export config but what will happen if our requirement is unique and that requirement is not supported by library config and we already developed most of the project using library then we can say what a waste 😂.
4.  Production ready and implemented best performance setup to achieve better performance for SEO and google performance score.
5.  Out of box support for compression(brotli and gzip) to reduce the size of html as well as Javascript files. This will reduce the load of bandwidth of client as well as server. Will also increase google performance score.
6.  Out of box support for caching of static pages. Caching will enable us to serve static pages fast with less usage of server's ram and CPU.
7.  Out of box support for environment management. So developers don't need to configure it.
8.  Inbuilt support of proxy for API to solve CORS issue. This is the common issue in frontend development. No need for api server to enable cors in the dev as well as production environment.
9.  In-built support for HttpClient to send requests to API. These are following features already implemented in HttpClient:

    1. Support for custom server response.
    2. Out of box support for Authorization of jwt token. In case of authentication, this architecture will automatically send Authorization header and will also handle refresh token case to generate new token and send back original request with new token.
    3. Support for checking if internet is not available. HttpClient will retry 3 times(configurable) after every 500ms\*retry count.
    4. If API throws 5xx(server error), HttpClient will retry 3 times to get success response.
    5. Whatever structure API will follow. HttpClient will convert it into a custom structure that will be easy for frontend developers.
    6. Sometimes during development API is not available, then dev creates mock data. But creating only mock data will not help. Dev changes code and when api will be available then again dev changes code. To solve this problem, this architecture has an inbuilt node test server. Developers can create a mock api in just 2 min and frontend code will be the same. Most important production build is safe from these changes 🍻  
       This will also open the door of testing code for success and error cases of API. Now developers will not need to rely on API to test different cases of frontend.

10. Out of box support for non SEO pages to render on client side only. SSR is only meant to be used for SEO. It's not a good idea to use server resources if it's not for SEO. This will enable frontend server to serve more requests and will save on server cost and bandwidth cost.
11. Most features are configurable through json. But you can get this json data through api. If you get configuration through api then you can change configuration anytime and wow changed in production without sending production deployment. One more reason to have 🍻.

[Please check documentation here](https://sandip12081992.github.io/react-ssr/)
