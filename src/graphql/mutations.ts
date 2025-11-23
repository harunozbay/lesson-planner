/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createPlan = /* GraphQL */ `mutation CreatePlan(
  $input: CreatePlanInput!
  $condition: ModelPlanConditionInput
) {
  createPlan(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreatePlanMutationVariables,
  APITypes.CreatePlanMutation
>;
export const updatePlan = /* GraphQL */ `mutation UpdatePlan(
  $input: UpdatePlanInput!
  $condition: ModelPlanConditionInput
) {
  updatePlan(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdatePlanMutationVariables,
  APITypes.UpdatePlanMutation
>;
export const deletePlan = /* GraphQL */ `mutation DeletePlan(
  $input: DeletePlanInput!
  $condition: ModelPlanConditionInput
) {
  deletePlan(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeletePlanMutationVariables,
  APITypes.DeletePlanMutation
>;
