export const LOGIN_MUTATION = `mutation Login($email: String!, $password: String!) { generateCustomerToken(email: $email, password: $password) { token } }`;
export const REGISTER_MUTATION = `mutation Register($input: CustomerCreateInput!) { createCustomerV2(input: $input) { customer { firstname lastname email } } }`;
