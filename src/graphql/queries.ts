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
