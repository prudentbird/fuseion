'use server';

import { signIn, signOut } from './auth';

export const loginAction = async () => {
  await signIn('google', { redirect: true, redirectTo: '/' });
};

export const logoutAction = async () => {
  await signOut({ redirectTo: '/auth' });
};
