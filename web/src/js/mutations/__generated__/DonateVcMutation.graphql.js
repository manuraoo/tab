/**
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule DonateVcMutation.graphql
 * @generated SignedSource<<83f55a1438a48eef6d594b831a1e8271>>
 * @relayHash e616052f68c74b6606ba0c2f69e78f6b
 * @flow
 * @nogrep
 */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';
export type DonateVcInput = {
  userId?: ?string;
  charityId?: ?string;
  vc?: ?number;
};

export type DonateVcMutationResponse = {
  user?: ?DonateVcMutationResponse_user;
};

export type DonateVcMutationResponse_user = {
  vcCurrent?: ?number;
};
*/

/* eslint-disable comma-dangle, quotes */

/*
mutation DonateVcMutation(
  $input: DonateVcInput!
) {
  donateVc(input: $input) {
    user {
      vcCurrent
      id
    }
  }
}
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "input",
        "type": "DonateVcInput!",
        "defaultValue": null
      }
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DonateVcMutation",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "input",
            "variableName": "input",
            "type": "DonateVcInput!"
          }
        ],
        "concreteType": "DonateVcPayload",
        "name": "donateVc",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "User",
            "name": "user",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "vcCurrent",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation"
  },
  "id": null,
  "kind": "Batch",
  "metadata": {},
  "name": "DonateVcMutation",
  "query": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "input",
        "type": "DonateVcInput!",
        "defaultValue": null
      }
    ],
    "kind": "Root",
    "name": "DonateVcMutation",
    "operation": "mutation",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "input",
            "variableName": "input",
            "type": "DonateVcInput!"
          }
        ],
        "concreteType": "DonateVcPayload",
        "name": "donateVc",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "User",
            "name": "user",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "vcCurrent",
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "text": "mutation DonateVcMutation(\n  $input: DonateVcInput!\n) {\n  donateVc(input: $input) {\n    user {\n      vcCurrent\n      id\n    }\n  }\n}\n"
};

module.exports = batch;
