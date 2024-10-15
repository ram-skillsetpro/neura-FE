export interface TemplateType {
  id: number;
  templateName: string;
  templateUploadId: number;
  companyId: number;
  contractTypeId: number;
  status: number;
  isActive: number;
  folderId: number;
  updatedOn: number;
  createdOn: number;
  createdBy: number;
  updatedBy: number;
  updatedByName: string;
  uploadFileType: string;
}

export interface QuestionnairePlaceholderType {
  key: string;
  label: string;
}

export interface SaveTemplateResponse {}
export interface FieldsState {
  fields: Field[];
}

export interface Field {
  variable_name: string;
  ans_type: string;
  question: string;
}

export interface AutoSuggestFiled {
  id: number;
  clus: string;
  ques: string;
  var: string;
  smdt: string;
  cntpid: number;
  cntnm: any;
  cmid: number;
}
