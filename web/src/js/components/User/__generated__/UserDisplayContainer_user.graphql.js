/**
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule UserDisplayContainer_user.graphql
 * @generated SignedSource<<335c5138a1e78570d5ad91923436dc05>>
 * @flow
 * @nogrep
 */

'use strict';

/*::
import type {ConcreteFragment} from 'relay-runtime';
export type UserDisplayContainer_user = {
  id: string;
  username?: ?string;
  email?: ?string;
};
*/

/* eslint-disable comma-dangle, quotes */

const fragment /*: ConcreteFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserDisplayContainer_user",
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "args": null,
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "args": null,
      "name": "username",
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "args": null,
      "name": "email",
      "storageKey": null
    }
  ],
  "type": "User"
};

module.exports = fragment;
