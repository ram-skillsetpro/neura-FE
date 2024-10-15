export interface OnlyOfficeConfigReps {
  status: number;
  message: string;
  response: Response | string;
  config: Config | null;
  contractId: number;
  createdBy: number;
  templateId?: number;
  contractName: string;
  state: number;
  contractTypeId: number;
  pdfContent: string;
  markerValueJson: string;
  templateName?: string;
  postContractId: number;
}

export interface Response {
  apiUrl: string;
  config: Config | null;
  contractId: number;
}

export interface Config {
  events: { onError: (event: any) => void };
  document: Document;
  documentType: string;
  editorConfig: EditorConfig;
  token: string;
  type: string;
}

export interface Document {
  info: Info;
  fileType: string;
  key: string;
  title: string;
  url: string;
  permissions: Permissions;
}

export interface Info {
  owner: string;
  uploaded: string;
}

export interface Permissions {
  comment: boolean;
  copy: boolean;
  download: boolean;
  edit: boolean;
  print: boolean;
  fillForms: boolean;
  modifyFilter: boolean;
  modifyContentControl: boolean;
  review: boolean;
  chat: boolean;
  protect: boolean;
}

export interface EditorConfig {
  callbackUrl: string;
  lang: string;
  mode: string;
  user: User;
  customization: Customization;
}

export interface User {
  id: string;
  name: string;
  group: any;
  image: string;
}

export interface Customization {
  logo: Logo;
  autosave: boolean;
  comments: boolean;
}

export interface Logo {
  image: string;
  imageDark: string;
  imageEmbedded: any;
  url: string;
}
