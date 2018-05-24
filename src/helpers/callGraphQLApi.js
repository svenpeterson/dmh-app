import { modules } from 'veritone-redux-common';

const {
  config: { getConfig },
  auth: { selectOAuthToken }
} = modules;

export default async function callGraphQLApi({
  types: [requestType, successType, failureType],
  query,
  variables,
  operationName,
  dispatch,
  getState
}) {
  const state = getState();
  const config = getConfig(state);
  const endpoint = `${config.apiRoot}/${config.graphQLEndpoint}`;
  const token = selectOAuthToken(state);

  dispatch({ type: requestType, meta: { variables, operationName, query } });

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({
        query,
        variables,
        operationName
      }),
      headers: {
        Authorization: token ? `bearer ${token}` : null,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());
  } catch (e) {
    dispatch({
      type: failureType,
      error: true,
      payload: e,
      meta: { variables, operationName, query }
    });

    let error = new Error('API call failed');
    error.errors = [e];
    throw error;
  }

  if (response.errors && response.errors.length) {
    dispatch({
      type: failureType,
      error: true,
      payload: response.errors,
      meta: { variables, operationName, query }
    });

    let error = new Error('API response included errors');
    error.errors = response.errors;
    throw error;
  }

  dispatch({
    type: successType,
    payload: response,
    meta: { variables, operationName, query }
  });

  return response.data;
}