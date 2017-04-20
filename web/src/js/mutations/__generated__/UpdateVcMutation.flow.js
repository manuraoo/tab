/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule UpdateVcMutation.flow
 * @generated SignedSource<<d832d0ae2f5482511baaf400243d2b0e>>
 * @flow
 */

'use strict';

export type UpdateVcInput = {
  userId?: ?string;
};

export type UpdateVcMutationResponse = {
  user?: ?UpdateVcMutationResponse_user;
};

export type UpdateVcMutationResponse_user = {
  id: string;
  vcCurrent?: ?number;
  vcAllTime?: ?number;
  heartsUntilNextLevel?: ?number;
  level?: ?number;
};
