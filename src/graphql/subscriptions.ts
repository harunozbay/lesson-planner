/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreatePlan = /* GraphQL */ `subscription OnCreatePlan(
  $filter: ModelSubscriptionPlanFilterInput
  $owner: String
) {
  onCreatePlan(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePlanSubscriptionVariables,
  APITypes.OnCreatePlanSubscription
>;
export const onUpdatePlan = /* GraphQL */ `subscription OnUpdatePlan(
  $filter: ModelSubscriptionPlanFilterInput
  $owner: String
) {
  onUpdatePlan(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePlanSubscriptionVariables,
  APITypes.OnUpdatePlanSubscription
>;
export const onDeletePlan = /* GraphQL */ `subscription OnDeletePlan(
  $filter: ModelSubscriptionPlanFilterInput
  $owner: String
) {
  onDeletePlan(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePlanSubscriptionVariables,
  APITypes.OnDeletePlanSubscription
>;
