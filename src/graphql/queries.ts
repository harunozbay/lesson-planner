/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getPlan = /* GraphQL */ `query GetPlan($id: ID!) {
  getPlan(id: $id) {
    id
    title
    dateRange
    fields
    docxUrl
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<APITypes.GetPlanQueryVariables, APITypes.GetPlanQuery>;
export const listPlans = /* GraphQL */ `query ListPlans(
  $filter: ModelPlanFilterInput
  $limit: Int
  $nextToken: String
) {
  listPlans(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      dateRange
      fields
      docxUrl
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListPlansQueryVariables, APITypes.ListPlansQuery>;
export const generatePlan = /* GraphQL */ `query GeneratePlan(
  $hafta_no: String
  $tarih_araligi: String
  $kurum_adi: String
  $muzik_listesi: [String]
  $sections: AWSJSON
  $fields: AWSJSON
) {
  generatePlan(
    hafta_no: $hafta_no
    tarih_araligi: $tarih_araligi
    kurum_adi: $kurum_adi
    muzik_listesi: $muzik_listesi
    sections: $sections
    fields: $fields
  )
}
` as GeneratedQuery<
  APITypes.GeneratePlanQueryVariables,
  APITypes.GeneratePlanQuery
>;
