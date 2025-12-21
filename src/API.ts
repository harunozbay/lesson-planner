/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreatePlanInput = {
  id?: string | null,
  title: string,
  dateRange: string,
  fields: string,
  docxUrl?: string | null,
  createdAt?: string | null,
};

export type ModelPlanConditionInput = {
  title?: ModelStringInput | null,
  dateRange?: ModelStringInput | null,
  fields?: ModelStringInput | null,
  docxUrl?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelPlanConditionInput | null > | null,
  or?: Array< ModelPlanConditionInput | null > | null,
  not?: ModelPlanConditionInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Plan = {
  __typename: "Plan",
  id: string,
  title: string,
  dateRange: string,
  fields: string,
  docxUrl?: string | null,
  createdAt?: string | null,
  updatedAt: string,
  owner?: string | null,
};

export type UpdatePlanInput = {
  id: string,
  title?: string | null,
  dateRange?: string | null,
  fields?: string | null,
  docxUrl?: string | null,
  createdAt?: string | null,
};

export type DeletePlanInput = {
  id: string,
};

export type ModelPlanFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  dateRange?: ModelStringInput | null,
  fields?: ModelStringInput | null,
  docxUrl?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelPlanFilterInput | null > | null,
  or?: Array< ModelPlanFilterInput | null > | null,
  not?: ModelPlanFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelPlanConnection = {
  __typename: "ModelPlanConnection",
  items:  Array<Plan | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionPlanFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  dateRange?: ModelSubscriptionStringInput | null,
  fields?: ModelSubscriptionStringInput | null,
  docxUrl?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPlanFilterInput | null > | null,
  or?: Array< ModelSubscriptionPlanFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type CreatePlanMutationVariables = {
  input: CreatePlanInput,
  condition?: ModelPlanConditionInput | null,
};

export type CreatePlanMutation = {
  createPlan?:  {
    __typename: "Plan",
    id: string,
    title: string,
    dateRange: string,
    fields: string,
    docxUrl?: string | null,
    createdAt?: string | null,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdatePlanMutationVariables = {
  input: UpdatePlanInput,
  condition?: ModelPlanConditionInput | null,
};

export type UpdatePlanMutation = {
  updatePlan?:  {
    __typename: "Plan",
    id: string,
    title: string,
    dateRange: string,
    fields: string,
    docxUrl?: string | null,
    createdAt?: string | null,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeletePlanMutationVariables = {
  input: DeletePlanInput,
  condition?: ModelPlanConditionInput | null,
};

export type DeletePlanMutation = {
  deletePlan?:  {
    __typename: "Plan",
    id: string,
    title: string,
    dateRange: string,
    fields: string,
    docxUrl?: string | null,
    createdAt?: string | null,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetPlanQueryVariables = {
  id: string,
};

export type GetPlanQuery = {
  getPlan?:  {
    __typename: "Plan",
    id: string,
    title: string,
    dateRange: string,
    fields: string,
    docxUrl?: string | null,
    createdAt?: string | null,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListPlansQueryVariables = {
  filter?: ModelPlanFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPlansQuery = {
  listPlans?:  {
    __typename: "ModelPlanConnection",
    items:  Array< {
      __typename: "Plan",
      id: string,
      title: string,
      dateRange: string,
      fields: string,
      docxUrl?: string | null,
      createdAt?: string | null,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GeneratePlanQueryVariables = {
  hafta_no?: string | null,
  tarih_araligi?: string | null,
  kurum_adi?: string | null,
  muzik_listesi?: Array< string | null > | null,
  sections?: string | null,
  fields?: string | null,
};

export type GeneratePlanQuery = {
  generatePlan?: string | null,
};

export type OnCreatePlanSubscriptionVariables = {
  filter?: ModelSubscriptionPlanFilterInput | null,
  owner?: string | null,
};

export type OnCreatePlanSubscription = {
  onCreatePlan?:  {
    __typename: "Plan",
    id: string,
    title: string,
    dateRange: string,
    fields: string,
    docxUrl?: string | null,
    createdAt?: string | null,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdatePlanSubscriptionVariables = {
  filter?: ModelSubscriptionPlanFilterInput | null,
  owner?: string | null,
};

export type OnUpdatePlanSubscription = {
  onUpdatePlan?:  {
    __typename: "Plan",
    id: string,
    title: string,
    dateRange: string,
    fields: string,
    docxUrl?: string | null,
    createdAt?: string | null,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeletePlanSubscriptionVariables = {
  filter?: ModelSubscriptionPlanFilterInput | null,
  owner?: string | null,
};

export type OnDeletePlanSubscription = {
  onDeletePlan?:  {
    __typename: "Plan",
    id: string,
    title: string,
    dateRange: string,
    fields: string,
    docxUrl?: string | null,
    createdAt?: string | null,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
