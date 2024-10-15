import { AxiosError, AxiosResponse } from "axios";
import { ACCESS_TOKEN, INTERNET_NOT_AVAILABLE } from "src/const";
import { CommonService } from "../services/common.service";
import { HttpClient } from "../services/http-client";

export function getAxiosResponseFromResponse(response: AxiosResponse<any> | AxiosError<any>) {
  let resp: AxiosResponse | undefined;
  if (!(response as AxiosError).isAxiosError) {
    resp = response as AxiosResponse<any>;
  } else {
    resp = (response as AxiosError<any>).response;
  }
  return resp;
}

export function configureHttpClient() {
  /** To process message by your own replace this function code with your own code */
  HttpClient.processMessage = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);

    const data: any = resp?.data;
    let message: string[] = [];
    const status: number = resp?.status || 0;

    if (status < 400) {
      const successMessage = data && data.message;
      if (typeof successMessage === "string") {
        message.push(successMessage);
      }
    } else {
      const errorMessage = data && data.message;
      if (typeof errorMessage === "string") {
        message.push(errorMessage);
      } else if (Array.isArray(errorMessage) && typeof errorMessage[0] === "string") {
        message = errorMessage;
      }
    }
    return message;
  };
  /**
   * Replace this function body with your own code if api return different type of response While
   * replacing remember that this function will get called for success as well as error response
   *
   * @param response AjaxResponse<any> | AjaxError
   * @returns Api Response
   */
  HttpClient.processData = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);

    const data: any = resp?.data;
    // can check instanceOf to know response type
    // some api send data in response and data field contain actual data
    return data?.response || data;
  };

  HttpClient.getErrorCode = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);
    const data: any = resp?.data;
    return data?.status || -1;
  };

  HttpClient.getStatusCode = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);
    return resp?.data?.status || resp?.status || 0;
  };

  HttpClient.onResponse = (apiResponse, options) => {
    if (!apiResponse.isSuccess && apiResponse.message.length && options.showNotificationMessage) {
      CommonService.toast({
        type: "error",
        message: apiResponse.message[0],
      });
    }
  };

  HttpClient.getAuthToken = () => {
    return localStorage.getItem(ACCESS_TOKEN) || "";
  };

  HttpClient.getAuthHeader = (token) => {
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  HttpClient.internetNotAvailableMsg = INTERNET_NOT_AVAILABLE;

  HttpClient.setUrl = (url) => {
    const isLocal = JSON.parse(process.env.IS_LOCAL || "false") as boolean;
    const newUrl = `${
      isLocal ? url : `${url.startsWith("http") ? url : process.env.API_BASE_URL + url}`
    }`;
    return newUrl;
  };

  HttpClient.retryTime = process.env.ENV === "cypress" ? 10 : 1000;
  HttpClient.isAuthDefault = true;
}
